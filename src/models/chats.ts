// @ts-expect-error - Mock data for development
import userAvatar1 from "/images/user-avatar-1.jpg";
// @ts-expect-error - Mock data for development
import userAvatar2 from "/images/user-avatar-2.jpg";
// @ts-expect-error - Mock data for development
import userAvatar3 from "/images/user-avatar-3.jpg";
import { Chat } from './types';

export const chats: Chat[] = [
  { 
    id: "1",
    avatar: userAvatar1,
    title: "Поручик Ржевский",
    lastMessage: "",
    time: "",
    unreadCount: 0
  },
  { 
    id: "2",
    avatar: userAvatar2,
    title: "Саня Неотвечать!",
    lastMessage: "",
    time: "",
    unreadCount: 0
  },
  { 
    id: "3",
    avatar: userAvatar3,
    title: "Алексей Алексеевич",
    lastMessage: "",
    time: "",
    unreadCount: 0
  }
];

// Функция для поиска чатов
export function searchChats(query: string): Chat[] {
  if (!query.trim()) {
    return chats;
  }
  
  return chats.filter(chat => 
    chat.title.toLowerCase().includes(query.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(query.toLowerCase())
  );
}

