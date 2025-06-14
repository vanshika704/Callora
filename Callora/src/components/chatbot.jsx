import { useEffect, useRef, useState } from 'react';

export default function ChatBox({ roomId, socket }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef();

  useEffect(() => {
    const handleChatMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on('chat-message', handleChatMessage);

    return () => {
      socket.off('chat-message', handleChatMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim()) {
      socket.emit('chat-message', { roomId, message: input });
      setInput('');
    }
  };

  return (
    <div className="flex-1 flex flex-col border-b border-gray-700">
      <div className="flex-1 overflow-y-auto p-3 bg-gray-800">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-3">
            <div className="font-semibold text-sm text-blue-400">
              {msg.sender === 'You' ? 'You' : msg.sender}
            </div>
            <div className="text-white">{msg.message}</div>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}