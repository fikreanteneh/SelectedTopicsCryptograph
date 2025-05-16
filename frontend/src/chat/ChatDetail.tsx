import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useChat from '@/context/ChatProvider';
import { useState } from 'react';

const ChatDetail = () => {
  const { chatsMap, selectedChat, sendMessage } = useChat();
  const [message, setMessage] = useState('');
  if (!selectedChat) return null;
  const chat = chatsMap[selectedChat];

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    // Send the message
    sendMessage({
      roomId: chat.roomId,
      message,
    });

    // Clear the input field
    setMessage('');
  };

  console.log(chat);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="text-lg font-bold">{chat.roomName}</h3>
        <p className="text-sm text-gray-600">Members: {chat.memberCount}</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {chat.messages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg shadow-sm ${
              message.sender === 'You' ? 'bg-blue-100 self-end' : 'bg-gray-100'
            }`}
          >
            <p className="text-sm font-semibold">{message.sender}</p>
            <p className="text-sm">{message.message}</p>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="flex items-center gap-2 p-4 bg-gray-100 border-t">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} className="text-white bg-blue-500">
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatDetail;
