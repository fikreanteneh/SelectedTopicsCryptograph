import {
  decryptJson,
  encryptJson,
  encryptSessionKey,
  sessionToCryptoKey,
} from '@/lib/cryptography';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import {
  Chat,
  ChatCreateReq,
  ChatCreateRes,
  ChatError,
  ChatJoinReq,
  ChatJoinRes,
  LeaveChat,
  MessageReceived,
  SendMessage,
} from '../types/chat.type';

const ChatContext = createContext<ChatContextType>({
  createChat: () => {},
  joinChat: () => {},
  sendMessage: () => {},
  chatsList: [],
  chatsMap: {},
  selectedChat: null,
  setSelectedChat: () => {},
});

type ChatContextType = {
  createChat: (createChat: ChatCreateReq) => void;
  joinChat: (joinChat: ChatJoinReq) => void;
  sendMessage: (message: SendMessage) => void;
  chatsList: string[];
  chatsMap: Record<string, Chat>;
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
};

const useChat = () => {
  return useContext<ChatContextType>(ChatContext);
};

export const ChatProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chatsList, setChatsList] = useState<string[]>([]);
  const [chatsMap, setMapList] = useState<Record<string, Chat>>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);

  function jsonReceiveHandler<T>(
    handler: (data: T) => void,
    sessionKey: CryptoKey,
  ): (encryptedData: ArrayBuffer) => Promise<void> {
    return async function (encryptedData: ArrayBuffer) {
      const decryptedData = await decryptJson(encryptedData, sessionKey);
      handler(decryptedData as T);
    };
  }

  // function jsonSendHandler<T>(
  //   handler: (data: T) => void,
  // ): (data: T) => Promise<void> {
  //   return async function (data: T) {
  //     console.log(data);
  //     const encryptedData = await encryptJson(data as object, sessionKey!); // Encrypt the data
  //     console.log('Encrypted data:', encryptedData); // Log the encrypted data
  //     handler(encryptedData); // Call the handler with the encrypted data
  //   };
  // }

  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Fetch the server's public key
        const res = await fetch(`${import.meta.env.VITE_API_URL}/getPublicKey`);
        const { publicKey }: { publicKey: string } = await res.json();

        // Generate a random session key (32 bytes for AES-256)
        const rawSessionKey = crypto.getRandomValues(new Uint8Array(32));

        console.log(
          'rawSessionKey (base64):',
          btoa(String.fromCharCode(...rawSessionKey)),
        );

        // the session key as a CryptoKey
        const sessionKey = await sessionToCryptoKey(rawSessionKey);

        setSessionKey(sessionKey); // Save the session key for later use

        // Initialize the socket connection
        const socket = io(import.meta.env.VITE_API_URL);

        socket.on('connect', async () => {
          // Encrypt the session key using the server's public key
          const encryptedSessionKey = await encryptSessionKey(
            publicKey,
            rawSessionKey,
          );
          socket.emit('exchangeKey', encryptedSessionKey); // Send the encrypted session key to the server
        });

        socket.on('exchangeKeySuccess', () => {
          console.log('Session key exchange successful!');
          setSocket(socket); // Save the socket instance
        });

        // Handle chat creation
        const chatCreatedHandler = jsonReceiveHandler<ChatCreateRes>((data) => {
          toast.success(`Chat "${data.roomName}" created successfully!`);
          chatsMap[data.roomId] = {
            roomId: data.roomId,
            roomName: data.roomName,
            handle: data.handle,
            userId: data.userId,
            messages: [],
            createdAt: data.createdAt,
            memberCount: data.memberCount,
            members: data.members,
          };
          setChatsList((prev) => [...prev, data.roomId]);
        }, sessionKey);

        // Handle chat joining
        const chatJoinedHandler = jsonReceiveHandler<ChatJoinRes>((data) => {
          toast.success(`Joined chat "${data.roomName}"!`);
          chatsMap[data.roomId] = {
            roomId: data.roomId,
            roomName: data.roomName,
            handle: data.handle,
            userId: data.userId,
            messages: [],
            createdAt: new Date(data.createdAt),
            memberCount: data.memberCount,
            members: data.members,
          };
          setChatsList((prev) => [...prev, data.roomId]);
        }, sessionKey);

        // Handle receiving messages
        const chatReceivedHandler = jsonReceiveHandler<MessageReceived>(
          (data) => {
            if (selectedChat !== data.roomId) {
              toast(`New message from ${data.senderHandle}`, {
                icon: '💬',
              });
            }
            setMapList((prevChatsMap) => {
              const chat = prevChatsMap[data.roomId];
              if (chat) {
                return {
                  ...prevChatsMap,
                  [data.roomId]: {
                    ...chat,
                    messages: [
                      ...chat.messages,
                      {
                        senderId: data.senderId,
                        senderHandle: data.senderHandle,
                        message: data.message,
                        createdAt: data.createdAt,
                        seen: false,
                      },
                    ],
                  },
                };
              }
              return prevChatsMap;
            });
          },
          sessionKey,
        );

        const someoneJoinedHandler = jsonReceiveHandler<ChatJoinRes>((data) => {
          toast(`${data.handle} joined the chat!`, {
            icon: '👋',
          });
          setMapList((prevChatsMap) => {
            const chat = prevChatsMap[data.roomId];
            if (chat) {
              return {
                ...prevChatsMap,
                [data.roomId]: {
                  ...chat,
                  members: data.members,
                  memberCount: data.memberCount,
                },
              };
            }
            return prevChatsMap;
          });
        }, sessionKey);

        const chatErrorHandler = jsonReceiveHandler<ChatError>((data) => {
          toast.error(data.message);
        }, sessionKey);

        const someoneLeftHandler = jsonReceiveHandler<LeaveChat>((data) => {
          const chat = chatsMap[data.roomId];
          const leavingUser = chat?.members.find(member => member.sid === data.userId);
          if (leavingUser) {
            toast(`${leavingUser.handle} left the chat`, {
              icon: '👋',
            });
          }
          setMapList((prevChatsMap) => {
            const chat = prevChatsMap[data.roomId];
            if (chat) {
              return {
                ...prevChatsMap,
                [data.roomId]: {
                  ...chat,
                  members: chat.members.filter(
                    (member) => member.sid !== data.userId,
                  ),
                  memberCount: chat.memberCount - 1,
                },
              };
            }
            return prevChatsMap;
          });
        }, sessionKey);

        // Register socket event handlers
        socket.on('chatCreated', chatCreatedHandler);
        socket.on('chatJoined', chatJoinedHandler);
        socket.on('receiveMessage', chatReceivedHandler);
        socket.on('someoneJoined', someoneJoinedHandler);
        socket.on('someoneLeft', someoneLeftHandler);
        socket.on('error', chatErrorHandler);
      } catch (error) {
        toast.error(`Connection error: ${error}`);
      }
    };

    initializeSocket();

    return () => {
      socket?.disconnect(); // Disconnect the socket on cleanup
    };
  }, []);

  const sendMessage = async (message: SendMessage) =>
    socket?.emit('send', await encryptJson(message, sessionKey!));

  const createChat = async (createChat: ChatCreateReq) =>
    socket?.emit('create', await encryptJson(createChat, sessionKey!));

  const joinChat = async (joinChat: ChatJoinReq) => {
    if (joinChat.roomId in chatsMap) {
      toast.error('You are already in this chat');
      return;
    }
    socket?.emit('join', await encryptJson(joinChat, sessionKey!));
  };

  return socket && sessionKey ? (
    <ChatContext.Provider
      value={{
        createChat,
        joinChat,
        chatsList: chatsList,
        sendMessage,
        chatsMap: chatsMap,
        selectedChat,
        setSelectedChat,
      }}
    >
      <Toaster position="top-right" />
      {children}
    </ChatContext.Provider>
  ) : null;
};

export default useChat;
