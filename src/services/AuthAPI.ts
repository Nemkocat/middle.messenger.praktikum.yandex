import HTTPTransport from '../core/HTTPTransport';
import { BaseAPI } from '../core/http/BaseAPI';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;

export interface SignUpData {
  first_name: string;
  second_name: string;
  login: string;
  email: string;
  password: string;
  phone: string;
}

export interface SignInData {
  login: string;
  password: string;
}

export interface User {
  id: number;
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
  avatar: string;
}

const authAPIInstance = new HTTPTransport(`${BASE_URL}/auth`);

class AuthAPI extends BaseAPI {
  async signUp(data: SignUpData): Promise<{ id: number }> {
    try {
      const response = await authAPIInstance.post<{ id: number } | { reason: string }>('/signup', {
        data: data, // Данные передаются напрямую в HTTPTransport
      });
      
      // Обработка ошибок по статусам
      if (response.status === 409) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || 'Пользователь с таким логином или email уже существует';
        throw new Error(reason);
      }
      
      // API может возвращать 200 или 201 для успешной регистрации
      if (response.status !== 200 && response.status !== 201) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || response.statusText || `Ошибка регистрации (статус: ${response.status})`;
        throw new Error(reason);
      }
      
      // Проверяем, что данные есть и содержат id
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Неверный формат ответа от сервера');
      }
      
      const responseData = response.data as { id?: number; reason?: string };
      if (responseData.reason) {
        throw new Error(responseData.reason);
      }
      
      if (typeof responseData.id !== 'number') {
        throw new Error('Ответ от сервера не содержит id пользователя');
      }
      
      return { id: responseData.id };
    } catch (error) {
      console.error('[AuthAPI] signUp error:', error);
      throw error;
    }
  }

  async signIn(data: SignInData): Promise<void> {
    try {
      const response = await authAPIInstance.post<{ reason?: string }>('/signin', {
        data,
      });
      
      if (response.status === 401) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || 'Неверный логин или пароль';
        throw new Error(reason);
      }
      
      if (response.status !== 200) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || response.statusText || `Ошибка входа (статус: ${response.status})`;
        throw new Error(reason);
      }
    } catch (error) {
      console.error('[AuthAPI] signIn error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    const response = await authAPIInstance.post('/logout');
    
    if (response.status !== 200) {
      throw new Error(`Logout failed: ${response.statusText}`);
    }
  }

  async getUser(): Promise<User> {
    const response = await authAPIInstance.get<User>('/user');
    
    if (response.status === 401) {
      // 401 означает, что пользователь не авторизован - это нормальная ситуация
      throw new Error('Unauthorized');
    }
    
    if (response.status !== 200) {
      throw new Error(`Get user failed: ${response.statusText}`);
    }
    
    return response.data;
  }
}

export default new AuthAPI();


