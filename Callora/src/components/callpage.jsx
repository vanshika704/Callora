import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import VideoPlayer from '../components/VideoPlayer';
import ChatBox from './chatbot';
import Controls from './controlls';

const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ],
};

export default function CallPage() {
  const { roomId } = useParams();
  const socket = useSocket();
  const localVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const peerConnections = useRef({});

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const createPeerConnection = (userId) => {
    try {
      const pc = new RTCPeerConnection(iceServers);
      peerConnections.current[userId] = pc;

      // Add tracks only if localStream exists
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
        setRemoteStreams((prev) => ({
          ...prev,
          [userId]: e.streams[0],
        }));
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || 
            pc.iceConnectionState === 'failed') {
          handleUserLeft({ userId });
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

  const handleUserJoined = async ({ userId }) => {
    if (peerConnections.current[userId]) return;
    
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
    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  // Cleanup function
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
  };

  useEffect(() => {
    getUserMedia();
    return cleanup;
  }, []);

  useEffect(() => {
    if (!socket || !localStream) return;

    const eventHandlers = {
      'existing-users': ({ roomUsers }) => {
        roomUsers.forEach(userId => {
          if (userId !== socket.id && !peerConnections.current[userId]) {
            handleUserJoined({ userId });
          }
        });
      },
      'user-joined': handleUserJoined,
      'offer': handleOffer,
      'answer': handleAnswer,
      'ice-candidate': handleIceCandidate,
      'user-left': handleUserLeft,
    };

    socket.emit('join-room', roomId);

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.keys(eventHandlers).forEach(event => {
        socket.off(event, eventHandlers[event]);
      });
      cleanup();
    };
  }, [socket, localStream, roomId]);

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 overflow-y-auto">
        <VideoPlayer 
          stream={localStream} 
          isLocal 
          ref={localVideoRef} 
          className="bg-gray-800 rounded-lg"
        />
        {Object.entries(remoteStreams).map(([id, stream]) => (
          <VideoPlayer 
            key={id} 
            stream={stream} 
            className="bg-gray-800 rounded-lg"
          />
        ))}
      </div>
      <div className="w-80 border-l border-gray-700 flex flex-col">
        <ChatBox roomId={roomId} socket={socket} />
        <Controls localStream={localStream} />
      </div>
    </div>
  );
}