// import React, { useEffect } from 'react';
// import socket from './socket';
// import VideoCall from './components/VideoCall';

// function App() {
//   useEffect(() => {
//     socket.on('connect', () => {
//       console.log('🟢 Connected to signaling server:', socket.id);
//     });

//     socket.on('disconnect', () => {
//       console.log('🔴 Disconnected from signaling server');
//     });
//   }, []);

//   return (
//     <div className="App">
//       <h1>Video Call App Frontend 🚀</h1>
//       <VideoCall/>
//     </div>
//   );
// }

// export default App;
import { Routes, Route } from 'react-router-dom';

import CallPage from './components/callpage';
import { SocketProvider } from './context/SocketContext';
import HomePage from './components/HomePage';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/call/:roomId" element={<CallPage />} />
      </Routes>
    </SocketProvider>
  );
}

export default App;
