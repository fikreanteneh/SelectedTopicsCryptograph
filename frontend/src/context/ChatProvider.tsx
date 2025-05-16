import {
  decryptJson,
  encryptJson,
  encryptSessionKey,
  sessionToCryptoKey,
} from '@/lib/cryptography';
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Chat,
  ChatCreate,
  ChatError,
  ChatEvent,
  ChatJoin,
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
  createChat: (createChat: ChatCreate) => void;
  joinChat: (joinChat: ChatJoin) => void;
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
        const chatCreatedHandler = jsonReceiveHandler<ChatEvent>((data) => {
          chatsMap[data.roomId] = {
            roomId: data.roomId,
            roomName: data.roomName,
            joinedAt: new Date(),
            handle: data.handle,
            messages: [],
            createdAt: new Date(data.createdAt),
            memberCount: data.memberCount,
            members: data.members,
          };
          setChatsList((prev) => [...prev, data.roomId]);
        }, sessionKey);

        // Handle chat joining
        const chatJoinedHandler = jsonReceiveHandler<ChatEvent>((data) => {
          chatsMap[data.roomId] = {
            roomId: data.roomId,
            roomName: data.roomName,
            joinedAt: new Date(data.joinedAt),
            handle: data.handle,
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
            setMapList((prevChatsMap) => {
              const chat = prevChatsMap[data.roomId];
              if (chat) {
                // Update the chat's messages
                const updatedChat = {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      sender: data.sender,
                      message: data.message,
                      createdAt: new Date(data.createdAt), // Fix the typo here
                      seen: false,
                    },
                  ],
                };

                // Return the updated chats map
                return {
                  ...prevChatsMap,
                  [data.roomId]: updatedChat,
                };
              }
              // If the chat doesn't exist, return the previous state
              return prevChatsMap;
            });
          },
          sessionKey,
        );

        const chatErrorHandler = jsonReceiveHandler<ChatError>((data) => {
          alert(data.message);
        }, sessionKey);

        // Register socket event handlers
        socket.on('chatCreated', chatCreatedHandler);
        socket.on('chatJoined', chatJoinedHandler);
        socket.on('receiveMessage', chatReceivedHandler);
        socket.on('error', chatErrorHandler);
      } catch (error) {
        alert(error);
      }
    };

    initializeSocket();

    return () => {
      socket?.disconnect(); // Disconnect the socket on cleanup
    };
  }, []);

  const sendMessage = async (message: SendMessage) =>
    socket?.emit('send', await encryptJson(message, sessionKey!));

  const createChat = async (createChat: ChatCreate) =>
    socket?.emit('create', await encryptJson(createChat, sessionKey!));

  const joinChat = async (joinChat: ChatJoin) =>
    socket?.emit('join', await encryptJson(joinChat, sessionKey!));

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
      {children}
    </ChatContext.Provider>
  ) : null;
};

export default useChat;
