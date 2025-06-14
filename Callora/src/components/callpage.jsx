

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VideoPlayer from '../components/VideoPlayer';
import ChatBox from './chatbot';
import Controls from './controlls';
import ParticipantList from './newparticipant';
import RoomControls from './newcontrol';
import ConnectionStatus from './connectionStatus';

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const mediaConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

export default function CallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    isLocked: false,
    isMuted: false
  });
  const [isCreator, setIsCreator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const peerConnections = useRef({});
  const screenStreamRef = useRef(null);
  const retryCount = useRef(0);
  const audioContextRef = useRef(null);
  const analysersRef = useRef({});
  const animationFrameRef = useRef(null);

  // Initialize audio context and analysers
  const initAudioAnalyser = (stream, userId) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 32;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyser);
      analysersRef.current[userId] = analyser;
    } catch (error) {
      console.error('Error initializing audio analyser:', error);
    }
  };

  // Check speaking status
  const checkSpeakingStatus = () => {
    try {
      const dataArray = new Uint8Array(32);
      let loudestUserId = null;
      let maxVolume = -Infinity;

      Object.entries(analysersRef.current).forEach(([userId, analyser]) => {
        analyser.getByteFrequencyData(dataArray);
        const volume = Math.max(...dataArray);
        
        if (volume > maxVolume && volume > 50) {
          maxVolume = volume;
          loudestUserId = userId;
        }
      });

      setActiveSpeaker(loudestUserId);
      animationFrameRef.current = requestAnimationFrame(checkSpeakingStatus);
    } catch (error) {
      console.error('Error checking speaking status:', error);
    }
  };

  const getUserMedia = async (constraints = mediaConstraints) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      
      if (stream.getAudioTracks().length > 0) {
        initAudioAnalyser(stream, socket.id);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setConnectionStatus('media-error');
      return null;
    }
  };

  const createPeerConnection = (userId) => {
    try {
      const pc = new RTCPeerConnection(iceServers);
      peerConnections.current[userId] = pc;

      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      pc.onicecandidate = (e) => {
        if (e.candidate && socket) {
          socket.emit('ice-candidate', {
            to: userId,
            candidate: e.candidate,
          });
        }
      };

      pc.ontrack = (e) => {
        const stream = e.streams[0];
        setRemoteStreams((prev) => ({
          ...prev,
          [userId]: stream,
        }));

        if (stream.getAudioTracks().length > 0) {
          initAudioAnalyser(stream, userId);
        }
      };

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log(`${userId} ICE state: ${state}`);
        
        if (state === 'connected') {
          setConnectionStatus('connected');
          retryCount.current = 0;
        } else if (state === 'disconnected' || state === 'failed') {
          if (retryCount.current < 3) {
            retryCount.current += 1;
            reconnectPeer(userId);
          } else {
            handleUserLeft({ userId });
          }
        }
      };

      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', { to: userId, offer });
        } catch (err) {
          console.error('Negotiation error:', err);
        }
      };

      return pc;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      return null;
    }
  };

  const reconnectPeer = (userId) => {
    const pc = peerConnections.current[userId];
    if (!pc) return;
    
    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
      console.log(`Attempting to reconnect to ${userId}`);
      handleUserJoined({ userId });
    }
  };

  const handleUserJoined = async ({ userId }) => {
    if (peerConnections.current[userId] || userId === socket?.id) return;
    
    const pc = createPeerConnection(userId);
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('offer', { to: userId, offer });
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async ({ sender, offer }) => {
    if (roomSettings.isLocked && !participants.includes(sender)) {
      console.log('Room is locked, rejecting connection from', sender);
      return;
    }

    let pc = peerConnections.current[sender];
    if (!pc) {
      pc = createPeerConnection(sender);
    }

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { to: sender, answer });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async ({ sender, answer }) => {
    const pc = peerConnections.current[sender];
    if (pc) {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (error) {
        console.error('Error handling answer:', error);
      }
    }
  };

  const handleIceCandidate = async ({ sender, candidate }) => {
    const pc = peerConnections.current[sender];
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Error adding ICE candidate:', error);
      }
    }
  };

  const handleUserLeft = ({ userId }) => {
    const pc = peerConnections.current[userId];
    if (pc) {
      pc.close();
      delete peerConnections.current[userId];
    }
    
    delete analysersRef.current[userId];
    
    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
    
    setParticipants(prev => prev.filter(id => id !== userId));
    
    if (activeSpeaker === userId) {
      setActiveSpeaker(null);
    }
  };

  const shareScreen = async () => {
    try {
      if (isScreenSharing) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
        setIsScreenSharing(false);
        
        const stream = await getUserMedia();
        if (!stream) return;
        
        Object.keys(peerConnections.current).forEach(userId => {
          const pc = peerConnections.current[userId];
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            const videoTrack = stream.getVideoTracks()[0];
            sender.replaceTrack(videoTrack);
          }
        });
        return;
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });
      screenStreamRef.current = screenStream;
      setIsScreenSharing(true);

      const videoTrack = screenStream.getVideoTracks()[0];
      Object.keys(peerConnections.current).forEach(userId => {
        const pc = peerConnections.current[userId];
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      videoTrack.onended = () => {
        shareScreen();
      };
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  const updateRoomSettings = (newSettings) => {
    if (!isCreator) return;
    
    const updatedSettings = { ...roomSettings, ...newSettings };
    setRoomSettings(updatedSettings);
    socket.emit('update-room-settings', { 
      roomId, 
      settings: updatedSettings 
    });
  };

  const endCallForAll = () => {
    if (!isCreator) return;
    socket.emit('close-room', roomId);
    navigate('/');
  };

  const cleanup = () => {
    // Stop all media tracks
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    
    // Clean up audio analysers
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    analysersRef.current = {};
    
    // Notify server
    if (socket) {
      socket.emit('leave-room', roomId);
    }
  };

  useEffect(() => {
    const init = async () => {
      const stream = await getUserMedia();
      if (!stream) return;

      socket.emit('join-room', roomId, (response) => {
        if (response?.error) {
          alert(response.error);
          navigate('/');
          return;
        }
        
        setIsCreator(response.isCreator);
        if (response.roomSettings) {
          setRoomSettings(response.roomSettings);
        }
        setConnectionStatus('connected');
        
        // Start checking speaking status
        checkSpeakingStatus();
      });
    };

    init();
    return cleanup;
  }, []);

  useEffect(() => {
    if (!socket || !localStream) return;

    const eventHandlers = {
      'existing-users': ({ roomUsers, roomSettings }) => {
        setParticipants(roomUsers);
        if (roomSettings) {
          setRoomSettings(roomSettings);
        }
        roomUsers.forEach(userId => {
          if (userId !== socket.id && !peerConnections.current[userId]) {
            handleUserJoined({ userId });
          }
        });
      },
      'user-joined': ({ userId, roomUsers }) => {
        setParticipants(prev => {
          const newParticipants = roomUsers || [...prev, userId];
          return Array.from(new Set(newParticipants));
        });
        handleUserJoined({ userId });
      },
      'offer': handleOffer,
      'answer': handleAnswer,
      'ice-candidate': handleIceCandidate,
      'user-left': handleUserLeft,
      'room-settings-updated': (settings) => {
        setRoomSettings(settings);
      },
      'room-closed': () => {
        alert('The host has closed the room');
        navigate('/');
      },
      'promoted-to-creator': () => {
        setIsCreator(true);
        alert('You are now the room creator');
      }
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(eventHandlers).forEach(event => {
        socket.off(event, eventHandlers[event]);
      });
    };
  }, [socket, localStream, roomId, participants]);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Main video grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-700 flex justify-between items-center bg-gray-800">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Room: {roomId}</h2>
            <ConnectionStatus status={connectionStatus} />
          </div>
          <RoomControls 
            isCreator={isCreator}
            isLocked={roomSettings.isLocked}
            onToggleLock={() => updateRoomSettings({ isLocked: !roomSettings.isLocked })}
            onEndCall={endCallForAll}
          />
        </div>
        
        {/* Video grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto bg-gray-900">
          <VideoPlayer 
            stream={localStream} 
            isLocal 
            ref={localVideoRef} 
            username="You"
            isSpeaking={activeSpeaker === socket.id}
            isMuted={roomSettings.isMuted}
          />
          
          {Object.entries(remoteStreams).map(([id, stream]) => (
            <VideoPlayer 
              key={id} 
              stream={stream} 
              username={`User ${id.slice(0, 5)}`}
              isSpeaking={activeSpeaker === id}
            />
          ))}
        </div>
        
        {/* Controls */}
        <Controls 
          localStream={localStream} 
          onScreenShare={shareScreen}
          isScreenSharing={isScreenSharing}
          isMuted={roomSettings.isMuted}
          onToggleMute={() => updateRoomSettings({ isMuted: !roomSettings.isMuted })}
        />
      </div>
      
      {/* Sidebar */}
      <div className="w-80 border-l border-gray-700 flex flex-col bg-gray-800">
        <ParticipantList 
          participants={participants} 
          currentUserId={socket?.id}
          isCreator={isCreator}
          activeSpeaker={activeSpeaker}
        />
        <ChatBox roomId={roomId} socket={socket} />
      </div>
    </div>
  );
}