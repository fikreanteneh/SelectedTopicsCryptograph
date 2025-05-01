import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import useChat from '../context/ChatProvider';

const NavBar = () => {
  const {
    createChat,
    joinChat,
    chatsList,
    chatsMap,
    setSelectedChat,
    selectedChat,
  } = useChat();

  const [createChatInput, setCreateChatInput] = useState<string>('');
  const [joinChatInput, setJoinChatInput] = useState<string>('');

  const buttons = [
    {
      button: 'Create Chat',
      placeholder: 'Chat Name',
      value: createChatInput,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateChatInput(e.target.value);
      },
      onClick: () => {
        createChat({ handle: 'fikre', roomName: createChatInput });
        setCreateChatInput('');
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
        joinChat({ handle: 'fikre', roomId: joinChatInput });
        setJoinChatInput('');
      },
    },
  ];

  return (
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
              onClick={() => setSelectedChat(chat.roomId)}
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
  );
};

export default NavBar;
