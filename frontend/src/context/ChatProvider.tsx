import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Chat, ChatCreate, ChatEvent, ChatJoin, MessageReceived, SendMessage } from "../types/chat.type";


const ChatContext = createContext<ChatContextType>({
    createChat: () => { },
    joinChat: () => { },
    sendMessage: () => { },
    chats: []
});

type ChatContextType = {
    createChat: (createChat: ChatCreate) => void;
    joinChat: (joinChat: ChatJoin) => void;
    sendMessage: (message: SendMessage) => void;
    chats: Chat[];
}


const useChat = () => {
    return useContext<ChatContextType>(ChatContext);
};



export const ChatProvider: React.FC<React.PropsWithChildren> = ({ children }) => {

    const [socket, setSocket] = useState<Socket | null>(null);
    const [chats, setChats] = useState<Chat[]>([])

    useEffect(() => {
        const socket = io(import.meta.env.VITE_API_URL);
        socket.on("connect", () => {
            setSocket(socket);
        });
        socket.on('chatCreated', (data: ChatEvent) => {
            console.log("=============Created", data);
            setChats((prev) => [
                ...prev,
                {
                    roomId: data.roomId,
                    roomName: data.roomName,
                    joinedAt: new Date(),
                    handle: data.handle,
                    messages: [],
                    createdAt: new Date(data.createdAt),
                    memberCount: data.memberCount,
                    members: data.members
                }
            ]);
        });
        socket.on('chatJoined', (data: ChatEvent) => {
            console.log("=============Joined", data);
            setChats((prev) => [
                ...prev,
                {
                    roomId: data.roomId,
                    roomName: data.roomName,
                    joinedAt: new Date(data.joinedAt),
                    createdAt: new Date(data.createdAt),
                    memberCount: data.memberCount,
                    members: data.members,
                    handle: data.handle,
                    messages: []
                }
            ]);
        });
        socket.on('receiveMessage', (data: MessageReceived) => {
            console.log("============Received", data);
            //TODO: Handle Message Seen and Optimize this logic
            setChats((prev) => {
                const index = prev.findIndex(chat => chat.roomId === data.roomId);
                if (index !== -1) {
                    const newChat = { ...prev[index] };
                    newChat.messages.push({ sender: data.sender, message: data.messages, seen: false });
                    return [...prev.slice(0, index), newChat, ...prev.slice(index + 1)];
                }
                return prev;
            })
        })
        //TODO: Handle Error Messages
        return () => {
            socket.disconnect();
        };
    }, []);

    const sendMessage = (message: SendMessage) => socket?.emit("send", message);

    const createChat = (createChat: ChatCreate) => socket?.emit("create", createChat);

    const joinChat = (joinChat: ChatJoin) => socket?.emit("join", joinChat);

    console.log("===New Chats List-----", chats);


    return (
        <ChatContext.Provider value={{ createChat, joinChat, chats, sendMessage }}>
            {socket ? children : <div>Loading...</div>}
        </ChatContext.Provider>
    )
}

export default useChat;
