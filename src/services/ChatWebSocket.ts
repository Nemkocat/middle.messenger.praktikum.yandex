/**
 * WebSocket сервис для работы с чатами
 * Документация: https://ya-praktikum.tech/api/v2/openapi/ws
 */

import { WS_BASE_URL } from '../config';

export interface WSMessage {
  id?: string;
  chat_id?: string;
  time?: string;
  type: 'message' | 'file' | 'sticker' | 'get old' | 'ping' | 'pong' | 'user connected';
  user_id?: string;
  content: string;
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

export type WSMessageHandler = (message: WSMessage | WSMessage[]) => void;
export type WSConnectionHandler = () => void;
export type WSErrorHandler = (error: Event) => void;

class ChatWebSocket {
  private socket: WebSocket | null = null;
  private chatId: string | null = null;
  private pingInterval: number | null = null;

  private messageHandlers: WSMessageHandler[] = [];
  private connectionHandlers: WSConnectionHandler[] = [];
  private errorHandlers: WSErrorHandler[] = [];

  /**
   * Подключиться к чату
   * @param userId ID пользователя
   * @param chatId ID чата
   * @param token Токен для подключения (получается через POST /chats/token/{id})
   */
  connect(userId: string | number, chatId: string, token: string): void {
    // Если уже подключены к этому чату, ничего не делаем
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.chatId === chatId) {
      return;
    }

    // Закрываем предыдущее соединение, если есть
    this.disconnect();

    this.chatId = chatId;

    // Формируем URL для WebSocket согласно документации
    // Формат: wss://ya-praktikum.tech/ws/chats/<USER_ID>/<CHAT_ID>/<TOKEN_VALUE>
    // Cookie передаются автоматически браузером при WebSocket подключении
    const wsUrl = `${WS_BASE_URL}/ws/chats/${userId}/${chatId}/${token}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.startPing();
        this.connectionHandlers.forEach(handler => handler());
      };

      this.socket.onmessage = (event) => {
        // Проверяем, является ли сообщение валидным JSON
        const messageText = event.data.toString();
        
        // Если сообщение начинается не с JSON символов, это может быть текстовая ошибка
        if (!messageText.trim().startsWith('{') && !messageText.trim().startsWith('[')) {
          // Проверяем, является ли это ошибкой токена
          if (messageText.toLowerCase().includes('token') || messageText.toLowerCase().includes('invalid')) {
            this.errorHandlers.forEach(handler => handler(new Error(messageText) as unknown as Event));
            this.disconnect();
            return;
          }
          
          // Для других текстовых сообщений просто игнорируем
          return;
        }
        
        try {
          const data = JSON.parse(messageText);
          
          // Обрабатываем массив сообщений (get old) или одно сообщение
          if (Array.isArray(data)) {
            this.messageHandlers.forEach(handler => handler(data));
          } else {
            // Обрабатываем ping/pong
            if (data.type === 'pong') {
              return;
            }
            
            // Обрабатываем user connected
            if (data.type === 'user connected') {
              return;
            }
            
            // Обрабатываем обычные сообщения
            this.messageHandlers.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('[ChatWebSocket] Error parsing JSON message:', error, messageText);
          this.errorHandlers.forEach(handler => handler(error as unknown as Event));
        }
      };

      this.socket.onerror = (error) => {
        console.error('[ChatWebSocket] WebSocket error:', error);
        this.errorHandlers.forEach(handler => handler(error));
      };

      this.socket.onclose = () => {
        this.stopPing();
        
        // Пытаемся переподключиться, если это не было намеренное закрытие
        // НЕ переподключаемся при коде 1000 (нормальное закрытие) или 1008 (политика)
        // Примечание: для переподключения нужны userId и token, которые не сохраняются
        // Переподключение должно быть инициировано извне (из ChatController)
      };
    } catch (error) {
      console.error('[ChatWebSocket] Error creating WebSocket:', error);
      this.errorHandlers.forEach(handler => handler(error as Event));
    }
  }

  /**
   * Отключиться от чата
   */
  disconnect(): void {
    this.stopPing();
    
    if (this.socket) {
      this.socket.close(1000, 'Disconnect');
      this.socket = null;
    }
    
    this.chatId = null;
  }

  /**
   * Отправить сообщение
   */
  sendMessage(content: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WSMessage = {
      type: 'message',
      content,
      time: new Date().toISOString(),
    };

    const messageString = JSON.stringify(message);
    this.socket.send(messageString);
  }

  /**
   * Получить старые сообщения
   * @param offset Смещение (0 для первых 20 сообщений)
   */
  getOldMessages(offset: number = 0): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: WSMessage = {
      type: 'get old',
      content: String(offset),
      time: new Date().toISOString(),
    };

    this.socket.send(JSON.stringify(message));
  }

  /**
   * Отправить ping для поддержания соединения
   */
  private sendPing(): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    const ping: WSMessage = {
      type: 'ping',
      content: '',
      time: new Date().toISOString(),
    };

    this.socket.send(JSON.stringify(ping));
  }

  /**
   * Запустить ping интервал (каждые 30 секунд)
   */
  private startPing(): void {
    this.stopPing();
    this.pingInterval = window.setInterval(() => {
      this.sendPing();
    }, 30000); // 30 секунд
  }

  /**
   * Остановить ping интервал
   */
  private stopPing(): void {
    if (this.pingInterval !== null) {
      window.clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Подписаться на сообщения
   */
  onMessage(handler: WSMessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Отписаться от сообщений
   */
  offMessage(handler: WSMessageHandler): void {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  /**
   * Подписаться на подключение
   */
  onConnect(handler: WSConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  /**
   * Отписаться от подключения
   */
  offConnect(handler: WSConnectionHandler): void {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }

  /**
   * Подписаться на ошибки
   */
  onError(handler: WSErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Отписаться от ошибок
   */
  offError(handler: WSErrorHandler): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }

  /**
   * Проверить, подключены ли мы
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Получить текущий chatId
   */
  getCurrentChatId(): string | null {
    return this.chatId;
  }
}

// Экспортируем singleton
export default new ChatWebSocket();
