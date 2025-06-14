import { useState } from 'react';

export default function Controls({ localStream }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleTrack = (type) => {
    if (!localStream) return;
    
    const track = localStream.getTracks().find((t) => t.kind === type);
    if (track) {
      track.enabled = !track.enabled;
      if (type === 'audio') setIsMuted(!track.enabled);
      if (type === 'video') setIsVideoOff(!track.enabled);
    }
  };

  const shareScreen = async () => {
    if (!localStream) return;

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const currentVideoTrack = localStream.getVideoTracks()[0];

      localStream.removeTrack(currentVideoTrack);
      localStream.addTrack(videoTrack);

      videoTrack.onended = () => {
        localStream.removeTrack(videoTrack);
        localStream.addTrack(currentVideoTrack);
        setIsVideoOff(false);
      };

      setIsVideoOff(false);
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return (
    <div className="p-3 bg-gray-800 flex gap-3 justify-center">
      <button
        onClick={() => toggleTrack('audio')}
        className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? '🔇' : '🎤'}
      </button>
      <button
        onClick={() => toggleTrack('video')}
        className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}
        title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
      >
        {isVideoOff ? '📷❌' : '📷'}
      </button>
      <button
        onClick={shareScreen}
        className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
        title="Share screen"
      >
        🖥️
      </button>
    </div>
  );
}