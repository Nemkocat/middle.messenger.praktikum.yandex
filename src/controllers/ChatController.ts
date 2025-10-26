import { chats, searchChats } from '../models/chats';
import { MessageModel } from '../models/MessageModel';
import { Message, Chat } from '../models/types';
import Block from '../core/block';

export class ChatController {
  private messageModel: MessageModel;
  private view: Block | null = null;
  private selectedChat: Chat | null = null;

  constructor() {
    this.messageModel = new MessageModel();
  }

  // Установить ссылку на View (страницу)
  setView(view: Block): void {
    this.view = view;
  }

  // Получить все чаты с последними сообщениями
  getChats(): Chat[] {
    return chats.map(chat => {
      const lastMessage = this.messageModel.getLastMessage(chat.id);
      const unreadCount = this.getUnreadCount(chat.id);
      
      return {
        ...chat,
        lastMessage: lastMessage ? lastMessage.content : chat.lastMessage,
        time: lastMessage ? lastMessage.time : chat.time,
        unreadCount: unreadCount
      };
    });
  }

  // Простая реализация подсчёта не прочитанных сообщений - просто захотелось :3
  private getUnreadCount(chatId: string): number {
    const messages = this.messageModel.getMessagesForChat(chatId);
    
    if (messages.length === 0) {
      return 0;
    }
    
    // Находим последнее сообщение
    const lastMessage = messages[messages.length - 1];
    
    // Если последнее сообщение мое - непрочитанных нет
    if (lastMessage.isMine) {
      return 0;
    }
    
    // Если последнее сообщение не мое - считаем количество непрочитанных
    // (все сообщения от последнего моего до конца)
    let unreadCount = 0;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].isMine) {
        break; // Дошли до последнего моего сообщения
      }
      unreadCount++;
    }
    
    return unreadCount;
  }

  // Получить сообщения для чата
  getMessagesForChat(chatId: string): Message[] {
    return this.messageModel.getMessagesForChat(chatId);
  }

  // Выбрать чат
  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    
    // Обновляем View с выбранным чатом
    if (this.view) {
      this.view.setProps({ 
        selectedChat: chat,
        messages: this.messageModel.getMessagesForChat(chat.id)
      });
    }
  }

  // Поиск чатов
  searchChats(query: string): Chat[] {
    return searchChats(query);
  }

  // Обновить список чатов в View
  private updateChatsList(): void {
    if (this.view) {
      const updatedChats = this.getChats();
      this.view.setProps({ chats: updatedChats });
    }
  }

  // Отправить сообщение
  sendMessage(chatId: string, content: string): void {
    const newMessage = {
      content,
      time: new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      isMine: true
    };
    
    // В реальном приложении здесь была бы отправка на сервер
    console.log(`Message sent to chat ${chatId}:`, newMessage);
    
    // Обновляем список чатов с новым последним сообщением
    this.updateChatsList();
  }

  // Обработчик клика по чату
  onChatClick = (chat: Chat): void => {
    this.selectChat(chat);
  };

  // Обработчик отправки сообщения
  onMessageSubmit = (e: Event): void => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const messageInput = form.querySelector('input[name="message"]') as HTMLInputElement;
    
    if (messageInput && messageInput.value.trim()) {
      const selectedChat = this.selectedChat;
      if (selectedChat) {
        this.sendMessage(selectedChat.id, messageInput.value.trim());
        messageInput.value = ''; // Очищаем поле ввода
      }
    }
  };

  // Обработчик изменения поля сообщения
  onMessageChange = (): void => {
    // Можно добавить логику для live-typing или валидации
    console.log('Message input changed');
  };

  // Обработчик изменения поля поиска
  onSearchChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const query = target.value;
    
    const allChats = this.getChats(); // Получаем чаты с последними сообщениями
    const filteredChats = allChats.filter(chat => 
      chat.title.toLowerCase().includes(query.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(query.toLowerCase())
    );
    
    // Обновляем список чатов в View
    if (this.view) {
      this.view.setProps({ chats: filteredChats });
    }
  };

  // Обработчик загрузки файла
  onFileChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      console.log('File selected:', file.name);
      // В реальном приложении здесь была бы загрузка файла
    }
  };
}

