import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useChat from '@/context/ChatProvider';
import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import ChatDetailSkeleton from '@/components/ChatDetailSkeleton';

const ChatDetail = () => {
  const { chatId: selectedChat } = useParams();
  const { chatsMap, sendMessage, isLoading } = useChat();
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return <ChatDetailSkeleton />;
  }

  if (!selectedChat || !(selectedChat in chatsMap)) {
    return <Navigate to={'/'} />;
  }

  const chat = chatsMap[selectedChat];
  const inviteLink = `${chat.roomId}`; //`${window.location.origin}/${chat.roomId}`

  const handleSendMessage = () => {
    if (message.trim() === '') return;
    sendMessage({ roomId: chat.roomId, message });
    setMessage('');
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-start justify-center h-screen gap-8">
      {/* Main Chat Area */}
      <div className="flex flex-col h-full w-[420px]">
        {/* Chat Header */}
        <div className="sticky top-0 z-10 flex flex-col p-4 border-b shadow-sm bg-card border-border">
          <h3 className="text-lg font-bold text-primary">{chat.roomName}</h3>
          <p className="text-xs text-muted-foreground">
            Members: {chat.memberCount}
          </p>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 px-4 py-2 space-y-2 overflow-y-scroll bg-background scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted">
          {chat.messages.map((message, index) => {
            const isMe = message.senderId === chat.userId;
            return (
              <div
                key={index}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-xs md:max-w-md lg:max-w-lg break-words px-4 py-2 rounded-2xl shadow
                    ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {!isMe && (
                      <span className="text-xs font-semibold text-primary">
                        {message.senderHandle}
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-2">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-sm">{message.message}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="sticky bottom-0 flex items-center gap-2 p-3 border-t bg-card border-border">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border bg-input border-border text-foreground"
          />
          <Button
            onClick={handleSendMessage}
            className="px-4 py-2 font-semibold rounded-lg shadow bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Sidebar on the right */}
      <aside className="flex flex-col w-[300px] h-1/3 self-end p-4 border-l border-border bg-card">
        <div className="mb-4">
          <div className="mb-2 text-lg font-bold text-primary">
            Active Users
          </div>
          <ul className="space-y-2">
            {chat.members.map((member) => (
              <li
                key={member.sid}
                className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-foreground"
              >
                <span className="font-semibold">{member.handle}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto">
          <Button
            className="w-full bg-primary text-primary-foreground"
            onClick={handleCopyLink}
          >
            {copied ? 'Copied!' : 'Copy Chat Code'}
          </Button>
        </div>
      </aside>
    </div>
  );
};

export default ChatDetail;
