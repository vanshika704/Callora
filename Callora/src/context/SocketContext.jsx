// creating a context api in order to provide the state to the components
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // imported io from socketio

const SocketContext = createContext(null); // creating a context api

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null); // use state socket 

  useEffect(() => {
    const newSocket = io('https://vistora-nzjq.onrender.com'); // use effect is getting the socket from the server ie backend
    setSocket(newSocket); //socket ko pass krdiya
///////////////////////
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}