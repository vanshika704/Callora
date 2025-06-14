import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const joinRoom = () => {
    if (roomId.trim()) navigate(`/call/${roomId}`);
  };

  const createRoom = () => {
    // Generate a random 6-character room ID
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/call/${newRoomId}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800">Video Chat App</h1>
      
      <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-md">
        {/* Join Existing Room */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Join Existing Room</h2>
          <input
            type="text"
            placeholder="Enter Room ID"
            className="p-2 border border-gray-400 rounded"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
          />
          <button 
            onClick={joinRoom} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Join Room
          </button>
        </div>
        
        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-2 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        
        {/* Create New Room */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Create New Room</h2>
          <button 
            onClick={createRoom} 
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;