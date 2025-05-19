import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import useChat from '../context/ChatProvider';
import ChatListSkeleton from '../components/ChatListSkeleton';

const ChatList = () => {
  const { createChat, joinChat, chatsList, chatsMap, isLoading } = useChat();

  const navigate = useNavigate();

  const [createChatInput, setCreateChatInput] = useState<string>('');
  const [joinChatInput, setJoinChatInput] = useState<string>('');
  const [handleInput, setHandleInput] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    'createChat' | 'joinChat' | null
  >(null);

  const handleCreateOrJoinChat = () => {
    if (handleInput.length < 3) {
      alert('Handle must be at least 3 characters long');
      return;
    }
    switch (currentAction) {
      case 'createChat':
        createChat({ handle: handleInput, roomName: createChatInput });
        break;
      case 'joinChat':
        joinChat({ handle: handleInput, roomId: joinChatInput });
        break;
      default:
        break;
    }
    setCreateChatInput('');
    setJoinChatInput('');
    setModalOpen(false);
  };

  const buttons = [
    {
      button: 'Create Chat',
      placeholder: 'Chat Name',
      value: createChatInput,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateChatInput(e.target.value);
      },
      onClick: () => {
        if (createChatInput.length < 3) {
          alert('Chat name must be at least 3 characters long');
          return;
        }
        setCurrentAction('createChat');
        setModalOpen(true);
      },
    },
    {
      button: 'Join Chat',
      placeholder: 'Insert the Id or full link',
      value: joinChatInput,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setJoinChatInput(e.target.value);
      },
      onClick: () => {
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(joinChatInput)) {
          alert('Chat ID must be exactly 36 characters long');
          return;
        }
        setCurrentAction('joinChat');
        setModalOpen(true);
      },
    },
  ];

  if (isLoading) {
    return <ChatListSkeleton />;
  }

  return (
    <div className="flex h-screen p-2">
      <div className="flex flex-col h-screen border bg-muted border-muted w-96">
        <div className="space-y-1">
          {buttons.map((item) => {
            return (
              <div
                className="flex items-center justify-center gap-1"
                key={item.button}
              >
                <Input
                  placeholder={item.placeholder}
                  className="flex-[12] h-[8.5] text-foreground"
                  onChange={item.onChange}
                  value={item.value}
                />
                <Button className="flex-[4] h-9" onClick={item.onClick}>
                  {item.button}
                </Button>
              </div>
            );
          })}
        </div>
        <ul className="p-2 mt-5 overflow-y-auto border-r border-muted bg-background">
          {chatsList.map((chatId) => {
            const chat = chatsMap[chatId];
            const unreadCount = chat.messages.filter(
              (message) => !message.seen,
            ).length;
            const lastMessage = chat.messages[chat.messages.length - 1];
            return (
              <li
                key={chat.roomId}
                className={`
          flex items-center justify-between gap-2 p-3 border-b border-muted cursor-pointer
          hover:bg-accent transition-colors group
        `}
                onClick={() => navigate(`./${chat.roomId}`)}
              >
                {/* Left: Avatar & Chat Info */}
                <div className="flex items-center flex-1 min-w-0 gap-3">
                  {/* Avatar (first letter of roomName) */}
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 text-lg font-bold rounded-full bg-primary/20 text-primary">
                    {chat.roomName[0]?.toUpperCase()}
                  </div>
                  {/* Chat Info */}
                  <div className="min-w-0">
                    <div className="font-semibold truncate text-foreground">
                      {chat.roomName}
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {lastMessage ? (
                        `${
                          lastMessage.senderId === chat.userId
                            ? 'You: '
                            : lastMessage.senderHandle + ': '
                        }${lastMessage.message}`
                      ) : (
                        <span className="italic text-muted-foreground">
                          No messages yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {/* Right: Time & Unread */}
                <div className="flex flex-col items-end gap-1 ml-2">
                  {/* Time of last message */}
                  {lastMessage && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                  {/* Unread badge */}
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-primary text-white rounded-full font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
          <div className="relative p-6 border rounded-lg shadow-lg w-96 bg-background text-foreground border-border">
            <button
              className="absolute text-2xl top-2 right-2 text-muted-foreground hover:text-primary"
              onClick={() => setModalOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col gap-4">
              <label className="text-lg font-semibold text-center text-primary">
                Insert your handle for the chat
              </label>
              <Input
                placeholder="Enter your handle"
                className="border h-9 bg-input border-border text-foreground"
                onChange={(e) => setHandleInput(e.target.value)}
                value={handleInput}
              />
              <Button
                className="font-semibold h-9 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreateOrJoinChat}
              >
                {currentAction === 'createChat' ? 'Create Chat' : 'Join Chat'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
