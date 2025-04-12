import { useState } from "react";
import useChat from "../context/ChatProvider";
import NavBar from "./NavBar";


const Home = () => {

    const { chats } = useChat(); // Access chats from context
    const [selectedChat, setSelectedChat] = useState<string | null>(null); // Track selected chat



    return (
        <div className="flex h-screen">
            <NavBar />

            <div className="flex-grow p-4 overflow-x-auto">
                <div className="grid grid-flow-col auto-cols-[minmax(300px,_1fr)] gap-4">
                    {chats.map((chat) => (
                        <div
                            key={chat.roomId}
                            className={`border p-4 rounded-lg ${selectedChat === chat.roomId ? "bg-blue-100" : "bg-gray-100"
                                }`}
                            onClick={() => setSelectedChat(chat.roomId)}
                        >
                            <h3 className="text-lg font-bold">{chat.roomName}</h3>
                            <p className="text-sm text-gray-600">
                                Members: {chat.memberCount}
                            </p>
                            <div className="mt-2 space-y-1">
                                {chat.messages.slice(0, 2).map((message, index) => (
                                    <div
                                        key={index}
                                        className="p-2 bg-white rounded shadow-sm"
                                    >
                                        <p className="text-sm font-semibold">
                                            {message.sender}
                                        </p>
                                        <p className="text-sm">{message.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;