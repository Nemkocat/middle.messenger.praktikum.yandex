import { chats } from '../models/chats';
import { MessageModel } from '../models/MessageModel';
import { Message, Chat } from '../models/types';
import ChatAPI, { Chat as APIChat } from '../services/ChatAPI';
import UserAPI, { User } from '../services/UserAPI';
import AuthAPI from '../services/AuthAPI';
import ChatWebSocket, { WSMessage } from '../services/ChatWebSocket';
import Block from '../core/block';
import { RESOURCES_BASE_URL } from '../config';

export class ChatController {
  private static instance: ChatController | null = null;
  private messageModel: MessageModel;
  private view: Block | null = null;
  private selectedChat: Chat | null = null;
  private chats: Chat[] = [];
  private currentUserId: number | null = null;
  private messagesByChatId: Map<string, Message[]> = new Map();
  // @ts-expect-error - переменная используется для хранения токена, но может быть не прочитана в некоторых сценариях
  private currentChatToken: string | null = null;
  private isLoadingOldMessages: boolean = false;
  // Ключ для localStorage, где хранятся аватары чатов
  private readonly CHAT_AVATARS_STORAGE_KEY = 'chat_avatars';

  constructor() {
    ChatController.instance = this;
    this.messageModel = new MessageModel();
    // Не загружаем чаты в конструкторе - они будут загружены при открытии страницы чата
    // Это предотвращает запросы к API до авторизации пользователя
    
    // Получаем ID текущего пользователя
    this.loadCurrentUser();
    
    // Настраиваем обработчики WebSocket
    this.setupWebSocketHandlers();
  }

  // Загрузить информацию о текущем пользователе
  private async loadCurrentUser(): Promise<void> {
    try {
      const user = await AuthAPI.getUser();
      const oldUserId = this.currentUserId;
      this.currentUserId = user.id;
      
      // Если пользователь изменился, отключаемся от WebSocket
      if (oldUserId !== null && oldUserId !== this.currentUserId) {
        ChatWebSocket.disconnect();
        this.messagesByChatId.clear();
        this.selectedChat = null;
      }
    } catch (error) {
      console.error('[ChatController] Error loading current user:', error);
    }
  }

  // Настроить обработчики WebSocket
  private setupWebSocketHandlers(): void {
    // Обработчик входящих сообщений
    ChatWebSocket.onMessage((data) => {
      if (Array.isArray(data)) {
        // Массив сообщений (get old)
        this.handleOldMessages(data);
      } else {
        // Одно сообщение
        this.handleNewMessage(data);
      }
    });

    // Обработчик подключения
    ChatWebSocket.onConnect(() => {
      const chatId = ChatWebSocket.getCurrentChatId();
      if (chatId) {
        // Загружаем первые 20 старых сообщений при подключении
        ChatWebSocket.getOldMessages(0);
      }
    });
  }

  // Загрузить чаты с сервера
  async loadChats(): Promise<void> {
    try {
      const apiChats = await ChatAPI.getChats();
      
      // Преобразуем чаты из API в формат приложения
      const mappedChats = this.mapAPIChatsToChats(apiChats);
      
      // Обновляем чаты данными с сервера
      // Если API вернул пустой массив, это нормально (у пользователя просто нет чатов)
      this.chats = mappedChats;
      this.updateChatsList();
    } catch (error) {
      console.error('[ChatController] Error loading chats:', error);
      // В случае ошибки НЕ очищаем существующие чаты, если они есть
      // Только если чатов еще не было, используем локальные данные
      if (this.chats.length === 0) {
        this.chats = chats.map(chat => ({
          ...chat,
          unreadCount: this.getUnreadCount(chat.id)
        }));
        this.updateChatsList();
      }
      // Если чаты уже были загружены, оставляем их как есть (не обновляем)
    }
  }

  // Получить аватар чата из localStorage
  private getChatAvatarFromStorage(chatId: string): string | null {
    try {
      const avatars = JSON.parse(window.localStorage.getItem(this.CHAT_AVATARS_STORAGE_KEY) || '{}');
      return avatars[chatId] || null;
    } catch (error) {
      console.error('[ChatController] Error reading chat avatar from storage:', error);
      return null;
    }
  }

  // Сохранить аватар чата в localStorage
  private saveChatAvatarToStorage(chatId: string, avatarUrl: string): void {
    try {
      const avatars = JSON.parse(window.localStorage.getItem(this.CHAT_AVATARS_STORAGE_KEY) || '{}');
      avatars[chatId] = avatarUrl;
      window.localStorage.setItem(this.CHAT_AVATARS_STORAGE_KEY, JSON.stringify(avatars));
    } catch (error) {
      console.error('[ChatController] Error saving chat avatar to storage:', error);
    }
  }

  // Преобразовать чаты из API в формат приложения
  private mapAPIChatsToChats(apiChats: APIChat[]): Chat[] {
    return apiChats.map(apiChat => {
      // Форматируем время в формат hh:mm
      let formattedTime = '';
      if (apiChat.last_message?.time) {
        try {
          const date = new Date(apiChat.last_message.time);
          if (!isNaN(date.getTime())) {
            formattedTime = date.toLocaleTimeString('ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
          } else {
            formattedTime = apiChat.last_message.time;
          }
        } catch {
          formattedTime = apiChat.last_message.time;
        }
      }

      // Формируем URL аватара чата
      // Используем только сохраненный аватар из localStorage или дефолтный
      const savedAvatar = this.getChatAvatarFromStorage(String(apiChat.id));
      const avatarUrl = savedAvatar || '/images/default-avatar.png';

      return {
        id: String(apiChat.id),
        avatar: avatarUrl,
        title: apiChat.title,
        lastMessage: apiChat.last_message?.content || '',
        time: formattedTime,
        unreadCount: apiChat.unread_count || 0,
      };
    });
  }

  // Установить ссылку на View (страницу)
  setView(view: Block): void {
    this.view = view;
    // Загружаем чаты при установке view (когда открывается страница чата)
    this.loadChats();
  }

  // Получить все чаты с последними сообщениями
  getChats(): Chat[] {
    return this.chats;
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
    // Сначала проверяем сообщения из WebSocket
    if (this.messagesByChatId.has(chatId)) {
      return this.messagesByChatId.get(chatId)!;
    }
    // Если нет, используем моковые данные
    return this.messageModel.getMessagesForChat(chatId);
  }

  // Выбрать чат
  async selectChat(chat: Chat): Promise<void> {
    this.selectedChat = chat;
    
    // Обнуляем счетчик непрочитанных сообщений для выбранного чата
    const chatIndex = this.chats.findIndex(c => c.id === chat.id);
    if (chatIndex !== -1) {
      this.chats[chatIndex].unreadCount = 0;
      // Обновляем список чатов в UI
      this.updateChatsList();
    }
    
    // Всегда обновляем информацию о текущем пользователе перед подключением
    // Это важно при смене аккаунта
    await this.loadCurrentUser();
    
    if (this.currentUserId === null) {
      console.error('[ChatController] Cannot connect to chat: user ID is not available');
      // Продолжаем без WebSocket, используем моковые данные
      if (this.view) {
        const messages = this.getMessagesForChat(chat.id);
        this.view.setProps({ 
          selectedChat: chat,
          messages: messages
        });
      }
      return;
    }
    
    // Получаем токен для WebSocket подключения
    try {
      const chatIdNum = parseInt(chat.id, 10);
      const token = await ChatAPI.getChatToken(chatIdNum);
      this.currentChatToken = token;
      
      // Подключаемся к WebSocket для этого чата с userId и токеном
      ChatWebSocket.connect(String(this.currentUserId), chat.id, token);
    } catch (error) {
      console.error('[ChatController] Error getting chat token:', error);
      this.currentChatToken = null;
      // Продолжаем без WebSocket, используем моковые данные
    }
    
    // Обновляем View с выбранным чатом
    if (this.view) {
      // Используем сообщения из WebSocket или моковые данные
      const messages = this.getMessagesForChat(chat.id);
      this.view.setProps({ 
        selectedChat: chat,
        messages: messages
      });
    }
  }

  // Поиск чатов
  searchChats(query: string): Chat[] {
    if (!query) {
      return this.chats;
    }
    const lowerQuery = query.toLowerCase();
    return this.chats.filter(chat => 
      chat.title.toLowerCase().includes(lowerQuery) ||
      chat.lastMessage.toLowerCase().includes(lowerQuery)
    );
  }

  // Создать новый чат
  async createChat(title: string): Promise<void> {
    try {
      await ChatAPI.createChat({ title });
      // Перезагружаем список чатов
      await this.loadChats();
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // Добавить пользователя в чат
  async addUserToChat(chatId: number, userId: number): Promise<void> {
    try {
      await ChatAPI.addUserToChat({
        chatId,
        users: [userId],
      });
    } catch (error) {
      console.error('Error adding user to chat:', error);
      throw error;
    }
  }

  // Удалить пользователя из чата
  async removeUserFromChat(chatId: number, userId: number): Promise<void> {
    try {
      await ChatAPI.removeUserFromChat({
        chatId,
        users: [userId],
      });
    } catch (error) {
      console.error('Error removing user from chat:', error);
      throw error;
    }
  }

  // Удалить чат (удаляет текущего пользователя из чата)
  async deleteChat(chatId: number): Promise<void> {
    try {
      // Получаем ID текущего пользователя
      if (this.currentUserId === null) {
        await this.loadCurrentUser();
      }
      
      if (this.currentUserId === null) {
        throw new Error('Не удалось получить ID текущего пользователя');
      }
      
      // Удаляем текущего пользователя из чата
      // Если пользователь был последним, чат может автоматически удалиться на сервере
      await ChatAPI.removeUserFromChat({
        chatId,
        users: [this.currentUserId],
      });
      
      
      // Отключаемся от WebSocket, если удаляем текущий чат
      if (this.selectedChat && String(chatId) === this.selectedChat.id) {
        ChatWebSocket.disconnect();
      }
      // Удаляем сообщения этого чата из памяти
      this.messagesByChatId.delete(String(chatId));
      // Перезагружаем список чатов
      await this.loadChats();
      // Сбрасываем выбранный чат
      this.selectedChat = null;
      if (this.view) {
        this.view.setProps({ selectedChat: null });
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  }

  // Получить экземпляр ChatController (singleton pattern)
  static getInstance(): ChatController | null {
    return ChatController.instance;
  }

  // Обновить список чатов в View
  private updateChatsList(): void {
    if (this.view) {
      const updatedChats = this.getChats();
      // Обновляем список чатов в View
      // Важно: создаем новый массив, чтобы componentDidUpdate правильно определил изменение
      // Важно: передаем массив чатов, даже если он пустой (это нормально, если у пользователя нет чатов)
      this.view.setProps({ chats: [...updatedChats] });
    }
  }

  // Отправить сообщение
  sendMessage(chatId: string, content: string): void {
    // Отправляем сообщение через WebSocket
    if (ChatWebSocket.isConnected() && ChatWebSocket.getCurrentChatId() === chatId) {
      ChatWebSocket.sendMessage(content);
    }
  }

  // Обработать новое сообщение от WebSocket
  private handleNewMessage(wsMessage: WSMessage): void {
    if (!wsMessage.chat_id && !ChatWebSocket.getCurrentChatId()) {
      return;
    }

    const chatId = wsMessage.chat_id || ChatWebSocket.getCurrentChatId() || '';
    const message = this.convertWSMessageToMessage(wsMessage);

    // Добавляем сообщение в список
    if (!this.messagesByChatId.has(chatId)) {
      this.messagesByChatId.set(chatId, []);
    }
    const messages = this.messagesByChatId.get(chatId)!;
    
    // Проверяем, нет ли уже такого сообщения (по id)
    if (message.id && messages.some(m => m.id === message.id)) {
      return;
    }
    
    // Добавляем новое сообщение в конец массива
    messages.push(message);
    
    // Убеждаемся, что сообщения отсортированы по времени (от старых к новым)
    messages.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
    });
    
    this.messagesByChatId.set(chatId, messages);

    // Обновляем UI, если это текущий чат
    if (this.selectedChat && this.selectedChat.id === chatId && this.view) {
      const messages = this.getMessagesForChat(chatId);
      this.view.setProps({
        messages: [...messages]
      });
    }

    // Обновляем список чатов
    this.updateChatsList();
  }

  // Обработать старые сообщения от WebSocket
  private handleOldMessages(wsMessages: WSMessage[]): void {
    const chatId = ChatWebSocket.getCurrentChatId();
    if (!chatId) {
      return;
    }

    // Сбрасываем флаг загрузки
    this.isLoadingOldMessages = false;

    // Если сообщений нет, просто сохраняем пустой массив
    if (wsMessages.length === 0) {
      return;
    }

    // Конвертируем сообщения из WebSocket в формат приложения
    const newMessages = wsMessages.map(wsMsg => this.convertWSMessageToMessage(wsMsg));
    
    // По документации сообщения приходят отсортированными от новых к старым
    // Переворачиваем, чтобы получить от старых к новым
    newMessages.reverse();
    
    // Получаем существующие сообщения
    const existingMessages = this.messagesByChatId.get(chatId) || [];
    
    // Объединяем сообщения, избегая дубликатов
    const messageMap = new Map<string, Message>();
    
    // Сначала добавляем существующие сообщения
    existingMessages.forEach(msg => {
      if (msg.id) {
        messageMap.set(msg.id, msg);
      }
    });
    
    // Затем добавляем новые сообщения (они перезапишут существующие, если есть дубликаты)
    newMessages.forEach(msg => {
      if (msg.id) {
        messageMap.set(msg.id, msg);
      } else {
        // Если нет id, добавляем с временным ключом
        messageMap.set(`temp-${Date.now()}-${Math.random()}`, msg);
      }
    });
    
    // Преобразуем Map обратно в массив и сортируем по времени
    const allMessages = Array.from(messageMap.values());
    allMessages.sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
    });

    // Сохраняем сообщения
    this.messagesByChatId.set(chatId, allMessages);

    // Обновляем UI, если это текущий чат
    if (this.selectedChat && this.selectedChat.id === chatId && this.view) {
      this.view.setProps({
        messages: [...allMessages]
      });
    }
  }

  // Конвертировать сообщение из WebSocket в формат приложения
  private convertWSMessageToMessage(wsMessage: WSMessage): Message {
    const isMine = this.currentUserId !== null && 
                   wsMessage.user_id !== undefined && 
                   String(wsMessage.user_id) === String(this.currentUserId);

    // Форматируем время
    let formattedTime = wsMessage.time || new Date().toISOString();
    try {
      if (wsMessage.time) {
        const date = new Date(wsMessage.time);
        if (!isNaN(date.getTime())) {
          formattedTime = date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      }
    } catch {
      // Используем исходное время, если не удалось распарсить
      formattedTime = wsMessage.time || new Date().toISOString();
    }

    return {
      id: wsMessage.id || '',
      content: wsMessage.content,
      time: formattedTime,
      isMine,
      type: wsMessage.type === 'message' ? 'message' : wsMessage.type === 'file' ? 'file' : 'sticker',
      file: wsMessage.file,
    };
  }

  // Обработчик клика по чату
  onChatClick = (chat: Chat): void => {
    this.selectChat(chat);
  };

  // Обработчик отправки сообщения
  onMessageSubmit = (e: Event, messageContent?: string): void => {
    e.preventDefault();
    
    // Используем переданное значение сообщения, если оно есть
    // Иначе пытаемся найти input в форме (для обратной совместимости)
    let content = messageContent;
    
    if (!content) {
      const form = e.target as HTMLFormElement;
      const messageInput = form.querySelector('input[name="message"]') as HTMLInputElement;
      
      if (messageInput && messageInput.value.trim()) {
        content = messageInput.value.trim();
      }
    }
    
    if (content && content.trim()) {
      const selectedChat = this.selectedChat;
      
      if (selectedChat) {
        this.sendMessage(selectedChat.id, content);
      }
    }
  };

  // Обработчик изменения поля сообщения
  onMessageChange = (): void => {
    // Можно добавить логику для live-typing или валидации
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

  // Загрузить больше старых сообщений
  loadMoreOldMessages(): void {
    // Защита от множественных одновременных запросов
    if (this.isLoadingOldMessages) {
      return;
    }

    const chatId = ChatWebSocket.getCurrentChatId();
    if (!chatId || !ChatWebSocket.isConnected()) {
      return;
    }

    const currentMessages = this.messagesByChatId.get(chatId) || [];
    
    // Если сообщений нет, загружаем с offset 0
    if (currentMessages.length === 0) {
      this.isLoadingOldMessages = true;
      ChatWebSocket.getOldMessages(0);
      // Сбрасываем флаг через небольшую задержку
      window.setTimeout(() => {
        this.isLoadingOldMessages = false;
      }, 1000);
      return;
    }

    // По документации: content="{offset}" - строковое представление числа offset
    // offset - это id последнего полученного сообщения (самого старого из уже загруженных)
    // Используем id первого (самого старого) сообщения в массиве как offset
    const oldestMessage = currentMessages[0];
    if (oldestMessage && oldestMessage.id) {
      const offset = parseInt(oldestMessage.id, 10);
      if (!isNaN(offset)) {
        this.isLoadingOldMessages = true;
        ChatWebSocket.getOldMessages(offset);
        // Сбрасываем флаг через небольшую задержку
        window.setTimeout(() => {
          this.isLoadingOldMessages = false;
        }, 1000);
      } else {
        // Если id не число, используем 0 (начнем с начала)
        this.isLoadingOldMessages = true;
        ChatWebSocket.getOldMessages(0);
        window.setTimeout(() => {
          this.isLoadingOldMessages = false;
        }, 1000);
      }
    } else {
      // Если нет id, используем 0 (начнем с начала)
      this.isLoadingOldMessages = true;
      ChatWebSocket.getOldMessages(0);
      window.setTimeout(() => {
        this.isLoadingOldMessages = false;
      }, 1000);
    }
  }

  // Обработчик загрузки файла
  onFileChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (file) {
      // В реальном приложении здесь была бы загрузка файла
    }
  };

  // Создать чат с пользователем (по логину)
  async createChatWithUser(userLogin: string): Promise<void> {
    try {
      // Ищем пользователя по логину
      const users = await this.searchUsers(userLogin);
      if (users.length === 0) {
        throw new Error('Пользователь не найден');
      }

      const user = users[0];
      
      // Создаем название чата: Имя + Фамилия
      const chatTitle = `${user.first_name} ${user.second_name}`;
      
      // Создаем чат
      const chatResult = await ChatAPI.createChat({ title: chatTitle });
      
      // Сохраняем аватар пользователя для этого чата в localStorage
      if (user.avatar) {
        const avatarUrl = `${RESOURCES_BASE_URL}${user.avatar}`;
        this.saveChatAvatarToStorage(String(chatResult.id), avatarUrl);
      }
      
      // Добавляем пользователя в чат
      await ChatAPI.addUserToChat({
        chatId: chatResult.id,
        users: [user.id],
      });
      
      // Перезагружаем список чатов
      await this.loadChats();
    } catch (error) {
      console.error('Error creating chat with user:', error);
      throw error;
    }
  };

  // Поиск пользователей по логину
  async searchUsers(login: string): Promise<User[]> {
    try {
      return await UserAPI.searchUsers(login);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Обработчик добавления пользователя в чат
  onAddUserToChat = async (chatId: number, userLogin: string): Promise<void> => {
    try {
      // Сначала ищем пользователя по логину
      const users = await this.searchUsers(userLogin);
      if (users.length === 0) {
        window.alert('Пользователь не найден');
        return;
      }
      
      // Добавляем первого найденного пользователя
      await this.addUserToChat(chatId, users[0].id);
      window.alert('Пользователь успешно добавлен в чат');
    } catch (error) {
      console.error('Error adding user to chat:', error);
      window.alert('Ошибка при добавлении пользователя в чат');
    }
  };

  // Обработчик удаления пользователя из чата
  onRemoveUserFromChat = async (chatId: number, userLogin: string): Promise<void> => {
    try {
      // Сначала ищем пользователя по логину
      const users = await this.searchUsers(userLogin);
      if (users.length === 0) {
        window.alert('Пользователь не найден');
        return;
      }
      
      // Удаляем первого найденного пользователя
      await this.removeUserFromChat(chatId, users[0].id);
      window.alert('Пользователь успешно удален из чата');
    } catch (error) {
      console.error('Error removing user from chat:', error);
      window.alert('Ошибка при удалении пользователя из чата');
    }
  };
}

