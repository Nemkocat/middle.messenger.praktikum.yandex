export interface Message {
  id?: string;
  content: string;
  time: string;
  isMine: boolean;
  type?: 'message' | 'file' | 'sticker';
  file?: {
    id: number;
    user_id: number;
    path: string;
    filename: string;
    content_type: string;
    content_size: number;
    upload_date: string;
  };
}

export interface Chat {
  id: string;
  avatar: string;
  title: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
}

