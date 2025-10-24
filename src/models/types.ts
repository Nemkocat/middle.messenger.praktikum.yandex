export interface Message {
  content: string;
  time: string;
  isMine: boolean;
}

export interface Chat {
  id: string;
  avatar: string;
  title: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
}
