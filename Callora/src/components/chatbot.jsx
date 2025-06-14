import { useEffect, useRef, useState } from 'react';

 function ChatBox({ roomId, socket }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef();

  useEffect(() => {
    const handleChatMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket?.on('chat-message', handleChatMessage);

    return () => {
      socket?.off('chat-message', handleChatMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && socket) {
      socket.emit('chat-message', { roomId, message: input }, (response) => {
        if (response?.success) {
          setInput('');
        }
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col border-t border-gray-700">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.isSystem ? 'text-center text-gray-400 text-sm' : ''}`}>
            {!msg.isSystem && (
              <div className={`font-semibold text-sm ${
                msg.sender === socket?.id ? 'text-blue-400' : 'text-green-400'
              }`}>
                {msg.sender === socket?.id ? 'You' : msg.senderName || 'User'}
              </div>
            )}
            <div className={`p-2 rounded-lg inline-block ${
              msg.sender === socket?.id ? 'bg-blue-600 text-white' : 'bg-gray-700'
            }`}>
              {msg.message}
            </div>
            {!msg.isSystem && (
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 bg-gray-900 flex gap-2">
        <input
          className="flex-1 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          disabled={!input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
export default ChatBox;