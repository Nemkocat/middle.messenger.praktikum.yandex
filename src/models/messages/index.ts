import { UserChatMessages1 } from './UserChatMessages1';
import { UserChatMessages2 } from './UserChatMessages2';
import { UserChatMessages3 } from './UserChatMessages3';
import { Message } from '../types';

// Экспорт всех сообщений по ID чата
export const messagesByChatId: Record<string, Message[]> = {
  "1": UserChatMessages1,
  "2": UserChatMessages2,
  "3": UserChatMessages3,
};

// Функция для получения сообщений по ID чата
export function getMessagesByChatId(chatId: string): Message[] {
  return messagesByChatId[chatId] || [];
}

// Экспорт отдельных массивов сообщений
export { UserChatMessages1, UserChatMessages2, UserChatMessages3 };
