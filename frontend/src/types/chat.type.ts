export type ChatCreate = {
  roomName: string;
  handle: string;
};

export type ChatJoin = {
  roomId: string;
  handle: string;
};

export interface ChatEvent {
  success: boolean;
  roomId: string;
  roomName: string;
  handle: string;
  createdAt: string;
  joinedAt: string;
  memberCount: number;
  members: string[];
}

export type SendMessage = {
  roomId: string;
  messages: string;
};

export type MessageReceived = {
  sender: string;
  messages: string;
  roomId: string;
};

export type Message = {
  sender: string;
  message: string;
  seen: boolean;
};

export type Chat = {
  roomId: string;
  roomName: string;
  handle: string;
  messages: Message[];
  memberCount: number;
  members: string[];
  createdAt: Date;
  joinedAt: Date;
};
