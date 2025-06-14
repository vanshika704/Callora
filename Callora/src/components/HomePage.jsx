import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [roomId, setRoomId] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const joinRoom = () => {
    if (roomId.trim()) navigate(`/call/${roomId}`);
  };

  const createRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    navigate(`/call/${newRoomId}`);
  };

  return (
    <div className="max-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-teal-700 flex flex-col lg:flex-row p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating bubbles */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              animation: `float ${Math.random() * 20 + 10}s linear infinite`,
            }}
          />
        ))}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/30 to-teal-800/20"></div>
      </div>

      {/* Left side - Beautiful illustration */}
      <div className={`hidden lg:flex flex-1 items-center justify-center p-8 transition-all duration-700 ease-out ${isMounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div className="relative w-full h-full max-w-xl">
          {/* Main illustration */}
          <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* Background circles */}
            <circle cx="250" cy="250" r="200" stroke="#E5F9FF" strokeWidth="2" strokeOpacity="0.2"/>
            <circle cx="250" cy="250" r="150" stroke="#E5F9FF" strokeWidth="2" strokeOpacity="0.3"/>
            <circle cx="250" cy="250" r="100" stroke="#E5F9FF" strokeWidth="2" strokeOpacity="0.4"/>
            
            {/* Main video call illustration */}
            <path d="M375 250C375 333.5 308.5 400 225 400C141.5 400 75 333.5 75 250C75 166.5 141.5 100 225 100C308.5 100 375 166.5 375 250Z" stroke="#E5F9FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M225 300C245 300 260 285 260 265C260 245 245 230 225 230C205 230 190 245 190 265C190 285 205 300 225 300Z" fill="#E5F9FF"/>
            
            {/* Connection points */}
            <circle cx="350" cy="180" r="10" fill="#E5F9FF"/>
            <circle cx="150" cy="180" r="10" fill="#E5F9FF"/>
            <circle cx="225" cy="130" r="10" fill="#E5F9FF"/>
            <circle cx="350" cy="320" r="10" fill="#E5F9FF"/>
            <circle cx="150" cy="320" r="10" fill="#E5F9FF"/>
            
            {/* Connection lines */}
            <path d="M225 300L225 360" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M225 230L225 170" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M290 250L360 250" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M160 250L90 250" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M260 280L310 320" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M190 280L140 320" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M260 230L310 180" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
            <path d="M190 230L140 180" stroke="#E5F9FF" strokeWidth="1.5" strokeDasharray="3 3"/>
          </svg>
          
          {/* Floating text */}
          <div className="absolute bottom-10 left-0 right-0 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Connect Instantly</h2>
            <p className="text-teal-100/70">High-quality video calls with anyone, anywhere</p>
          </div>
        </div>
      </div>

      {/* Right side - Form card */}
      <div className="flex-1 mr-20 flex items-center justify-center lg:justify-end">
        <div 
          className={`relative z-10 w-full max-w-sm transition-all duration-500 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/10 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl animate-[pulse_6s_ease-in-out_infinite]"></div>
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl animate-[pulse_6s_ease-in-out_infinite]"></div>
            
            {/* Header */}
            <div className={`text-center mb-8 transition-opacity duration-500 delay-100 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-400/20">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 8.5C22 12.09 19.09 15 15.5 15C15.33 15 15.15 14.99 14.98 14.98C14.73 11.81 12.19 9.27 9.02 9.02C9.01 8.85 9 8.67 9 8.5C9 4.91 11.91 2 15.5 2C19.09 2 22 4.91 22 8.5Z" stroke="#E5F9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 15.5C15 19.09 12.09 22 8.5 22C4.91 22 2 19.09 2 15.5C2 11.91 4.91 9 8.5 9C8.67 9 8.85 9.01 9.02 9.02C12.19 9.27 14.73 11.81 14.98 14.98C14.99 15.15 15 15.33 15 15.5Z" stroke="#E5F9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-200 via-cyan-200 to-teal-300 bg-clip-text text-transparent mb-2">
                Callora
              </h1>
              <p className="text-teal-100/70">Premium video conferencing made simple</p>
            </div>

            {/* Join Room Section */}
            <div className={`mb-6 transition-opacity duration-500 delay-200 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-lg font-semibold text-white mb-3">Join a Room</h2>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Room ID"
                    className="w-full p-3 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-teal-100/50 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-transparent transition-all duration-200 hover:bg-white/10"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                  />
                  <svg 
                    className="absolute left-3 top-3.5 h-5 w-5 text-teal-100/50" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={joinRoom}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-teal-500/10"
                >
                  Join Now
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="mx-3 text-teal-100/50 text-sm">OR</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Create Room Section */}
            <div className={`transition-opacity duration-500 delay-300 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="text-lg font-semibold text-white mb-3">Create New Room</h2>
              <button
                onClick={createRoom}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-cyan-500/10"
              >
                Create Room
              </button>
            </div>

            {/* Features */}
            <div className={`mt-8 grid grid-cols-3 gap-4 text-center text-teal-100/70 text-xs transition-opacity duration-500 delay-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex flex-col items-center">
                <div className="p-2 bg-teal-500/10 rounded-md mb-1 border border-teal-400/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23 7L16 12L23 17V7Z" stroke="#E5F9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 5H3C1.89543 5 1 5.89543 1 7V17C1 18.1046 1.89543 19 3 19H14C15.1046 19 16 18.1046 16 17V7C16 5.89543 15.1046 5 14 5Z" stroke="#E5F9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>HD Video</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-2 bg-teal-500/10 rounded-md mb-1 border border-teal-400/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H14L9 21V16Z" stroke="#E5F9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Live Chat</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="p-2 bg-teal-500/10 rounded-md mb-1 border border-teal-400/20">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#E5F9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8V12M12 16H12.01" stroke="#E5F9FF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span>Secure</span>
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </div>
  );
}

export default HomePage;