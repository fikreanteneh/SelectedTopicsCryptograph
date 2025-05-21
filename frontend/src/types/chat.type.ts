//API Types
export type ChatMember = {
  handle: string;
  sid: string;
  joinedAt: Date;
};

export type ChatCreateReq = {
  roomName: string;
  handle: string;
};

export interface ChatCreateRes {
  roomId: string;
  roomName: string;
  handle: string;
  userId: string;
  createdAt: Date;
  memberCount: number;
  members: ChatMember[];
}

export type ChatJoinReq = {
  roomId: string;
  handle: string;
};

export interface ChatJoinRes {
  roomId: string;
  roomName: string;
  handle: string;
  userId: string;
  createdAt: string;
  memberCount: number;
  members: ChatMember[];
}

export type SendMessage = {
  roomId: string;
  message: string;
};

export type MessageReceived = {
  senderId: string;
  senderHandle: string;
  message: string;
  roomId: string;
  createdAt: Date;
};

//Local Types
export type Message = {
  senderId: string;
  senderHandle: string;
  message: string;
  seen: boolean;
  createdAt: Date;
};

export type Chat = {
  roomId: string;
  roomName: string;
  handle: string;
  userId: string;
  messages: Message[];
  memberCount: number;
  members: ChatMember[];
  createdAt: Date;
};

export type ChatError = {
  message: string;
};

export type LeaveChat = {
  roomId: string;
  userId: string;
};
