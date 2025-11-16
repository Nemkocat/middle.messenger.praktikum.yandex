import HTTPTransport from '../core/HTTPTransport';
import { BaseAPI } from '../core/http/BaseAPI';
import { API_BASE_URL } from '../config';

const BASE_URL = API_BASE_URL;

export interface UpdateProfileData {
  first_name: string;
  second_name: string;
  display_name: string;
  login: string;
  email: string;
  phone: string;
}

export interface UpdatePasswordData {
  oldPassword: string;
  newPassword: string;
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

const userAPIInstance = new HTTPTransport(`${BASE_URL}/user`);

class UserAPI extends BaseAPI {
  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await userAPIInstance.put<User>('/profile', {
        data,
      });
      
      if (response.status === 400) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || 'Неверные данные профиля';
        throw new Error(reason);
      }

      if (response.status === 401) {
        throw new Error('Необходима авторизация');
      }

      if (response.status === 409) {
        const errorData = response.data as { reason?: string };
        let reason = errorData?.reason || 'Пользователь с таким логином или email уже существует';

        // Переводим английские сообщения на русский
        if (reason.toLowerCase().includes('user already in system') ||
            reason.toLowerCase().includes('user already exists')) {
          reason = 'Пользователь с таким логином или email уже существует';
        }

        throw new Error(reason);
      }

      if (response.status !== 200) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || response.statusText || `Ошибка обновления профиля (статус: ${response.status})`;
        throw new Error(reason);
      }

      return response.data;
    } catch (error) {
      console.error('[UserAPI] updateProfile exception:', error);
      throw error;
    }
  }

  async updatePassword(data: UpdatePasswordData): Promise<void> {
    try {
      const response = await userAPIInstance.put('/password', {
        data,
      });
      
      if (response.status === 400) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || 'Неверный старый пароль';
        throw new Error(reason);
      }
      
      if (response.status === 401) {
        throw new Error('Необходима авторизация');
      }
      
      if (response.status !== 200) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || response.statusText || `Ошибка обновления пароля (статус: ${response.status})`;
        throw new Error(reason);
      }
    } catch (error) {
      console.error('[UserAPI] updatePassword error:', error);
      throw error;
    }
  }

  async updateAvatar(file: File): Promise<User> {
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      throw new Error('Файл должен быть изображением');
    }
    
    // Проверка размера файла (например, максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Размер файла не должен превышать 10MB');
    }
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Согласно документации API, для загрузки аватара используется PUT запрос
      // Важно: не устанавливаем никаких заголовков для FormData - браузер установит Content-Type с boundary сам
      const response = await userAPIInstance.put<User>('/profile/avatar', {
        data: formData,
      });
      
      if (response.status === 400) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || 'Неверный формат файла';
        throw new Error(reason);
      }
      
      if (response.status === 401) {
        throw new Error('Необходима авторизация');
      }
      
      if (response.status !== 200) {
        const errorData = response.data as { reason?: string };
        const reason = errorData?.reason || response.statusText || `Ошибка обновления аватара (статус: ${response.status})`;
        throw new Error(reason);
      }
      
      return response.data;
    } catch (error) {
      console.error('[UserAPI] updateAvatar error:', error);
      throw error;
    }
  }

  async searchUsers(login: string): Promise<User[]> {
    // Поиск пользователей - пробуем POST запрос, так как API может требовать POST
    try {
      const response = await userAPIInstance.post<User[]>('/search', {
        data: { login },
      });
      
      if (response.status !== 200) {
        const errorData = response.data as { reason?: string };
        const errorMessage = errorData?.reason || response.statusText || 'Ошибка поиска пользователя';
        throw new Error(`Search users failed: ${errorMessage}`);
      }
      
      return response.data;
    } catch (error) {
      console.error('[UserAPI] searchUsers error:', error);
      throw error;
    }
  }
}

export default new UserAPI();

