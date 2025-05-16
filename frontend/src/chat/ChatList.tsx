import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import useChat from '../context/ChatProvider';

const ChatList = () => {
  const { createChat, joinChat, chatsList, chatsMap } = useChat();

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

  return (
    <div className="flex h-screen">
      <div className="flex flex-col h-screen border bg-muted border-muted w-96">
        <div>
          <div className="space-y-1">
            {buttons.map((item) => {
              return (
                <div className="flex space-x-[0.5]" key={item.button}>
                  <Input
                    placeholder={item.placeholder}
                    className="flex-[12] h-9"
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
        </div>
        <ul className="p-2 mt-5 overflow-y-auto border-r border-muted bg-background">
          {chatsList.map((chatId) => {
            const chat = chatsMap[chatId];
            const unreadCount = chat.messages.filter(
              (message) => !message.seen,
            ).length;
            return (
              <li
                key={chat.roomId}
                className="flex items-center justify-between p-2 border-b cursor-pointer border-muted"
                onClick={() => navigate(`./${chat.roomId}`)}
              >
                <span>{chat.roomName}</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-red-500 rounded-full text-foreground">
                    {unreadCount}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {modalOpen && (
        <div className="flex items-center justify-center h-screen">
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative p-6 bg-white rounded-lg shadow-lg w-96">
              <button
                className="absolute text-gray-500 top-2 right-2 hover:text-gray-700"
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                &times;
              </button>
              <div className="flex flex-col gap-2">
                <label className="text-lg font-semibold text-center" htmlFor="">
                  Insert your handle for the chat
                </label>

                <Input
                  placeholder="Enter your handle"
                  className="flex-[12] h-9"
                  onChange={(e) => setHandleInput(e.target.value)}
                  value={handleInput}
                />
                <Button
                  className="flex-[4] h-9"
                  onClick={handleCreateOrJoinChat}
                >
                  {currentAction === 'createChat' ? 'Create Chat' : 'Join Chat'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
