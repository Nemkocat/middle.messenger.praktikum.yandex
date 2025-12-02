import HTTPTransport from '../core/HTTPTransport';
import { BaseAPI } from '../core/http/BaseAPI';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;

export interface Chat {
  id: number;
  title: string;
  avatar: string | null;
  created_by: number;
  unread_count: number;
  last_message: {
    user: {
      first_name: string;
      second_name: string;
      avatar: string | null;
      email: string;
      login: string;
      phone: string;
    };
    time: string;
    content: string;
  } | null;
}

export interface CreateChatData {
  title: string;
}

export interface AddUserToChatData {
  users: number[];
  chatId: number;
}

export interface RemoveUserFromChatData {
  users: number[];
  chatId: number;
}

const chatAPIInstance = new HTTPTransport(`${BASE_URL}/chats`);

class ChatAPI extends BaseAPI {
  // request() - получение списка чатов
  // Переопределяем метод базового класса с другой сигнатурой
  // @ts-expect-error - переопределение метода базового класса с другой сигнатурой необходимо для API
  async request(): Promise<Chat[]> {
    const response = await chatAPIInstance.get<Chat[]>('/');
    
    if (response.status === 401) {
      // 401 означает, что пользователь не авторизован - возвращаем пустой массив
      return [];
    }
    
    if (response.status !== 200) {
      throw new Error(`Get chats failed: ${response.statusText}`);
    }
    
    return response.data;
  }

  // create() - создание нового чата
  // Переопределяем метод базового класса с другой сигнатурой
  // @ts-expect-error - переопределение метода базового класса с другой сигнатурой необходимо для API
  async create(data: CreateChatData): Promise<{ id: number }> {
    const response = await chatAPIInstance.post<{ id: number }>('/', {
      data,
    });
    
    if (response.status !== 200) {
      throw new Error(`Create chat failed: ${response.statusText}`);
    }
    
    return response.data;
  }

  // Для обратной совместимости оставляем старые методы
  async getChats(): Promise<Chat[]> {
    return this.request();
  }

  async createChat(data: CreateChatData): Promise<{ id: number }> {
    return this.create(data);
  }

  async addUserToChat(data: AddUserToChatData): Promise<void> {
    const response = await chatAPIInstance.put('/users', {
      data,
    });
    
    if (response.status !== 200) {
      throw new Error(`Add user to chat failed: ${response.statusText}`);
    }
  }

  async removeUserFromChat(data: RemoveUserFromChatData): Promise<void> {
    const response = await chatAPIInstance.delete('/users', {
      data,
    });
    
    if (response.status !== 200) {
      throw new Error(`Remove user from chat failed: ${response.statusText}`);
    }
  }

  async getChatToken(chatId: number): Promise<string> {
    const response = await chatAPIInstance.post<{ token: string }>(`/token/${chatId}`);
    
    if (response.status !== 200) {
      throw new Error(`Get chat token failed: ${response.statusText}`);
    }
    
    return response.data.token;
  }
}

export default new ChatAPI();


