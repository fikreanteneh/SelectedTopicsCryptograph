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
  message: string;
};

export type MessageReceived = {
  sender: string;
  message: string;
  roomId: string;
  createdAt: string;
};

export type Message = {
  sender: string;
  message: string;
  seen: boolean;
  createdAt: Date;
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

export type ChatError = {
  message: string;
};
