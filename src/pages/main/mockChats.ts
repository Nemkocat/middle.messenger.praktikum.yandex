// @ts-expect-error - Mock data for development
import userAvatar1 from "/images/user-avatar-1.jpg";
// @ts-expect-error - Mock data for development
import userAvatar2 from "/images/user-avatar-2.jpg";
// @ts-expect-error - Mock data for development
import userAvatar3 from "/images/user-avatar-3.jpg";


export default [
  { 
    id: "1",
    avatar: userAvatar1,
    title: "Иван Иванович",
    lastMessage: "заходит в бар русский, америк...",
    time: "15:16", 
    unreadCount: 2
  },

  { 
    id: "2",
    avatar: userAvatar2,
    title: "Мария Петровна",
    lastMessage: "заходит в бар русский, армя...",
    time: "15:39", 
    unreadCount: 1
  },

  { 
    id: "3",
    avatar: userAvatar3,
    title: "Алексей Смирнов",
    lastMessage: "заходит в бар русский, молдов...",
    time: "12:31",
    unreadCount: 0
  }

];


