import { getMessagesByChatId } from './messages';
import { Message } from './types';

export class MessageModel {
  // Получить сообщения для конкретного чата
  getMessagesForChat(chatId: string): Message[] {
    return getMessagesByChatId(chatId);
  }

  // Получить последнее сообщение чата (для отображения на левой панели main)
  getLastMessage(chatId: string): Message | null {
    const messages = getMessagesByChatId(chatId);
    return messages.length > 0 ? messages[messages.length - 1] : null;
  }
}
