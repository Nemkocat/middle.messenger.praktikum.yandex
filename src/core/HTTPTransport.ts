import { HTTPMethod } from './httpMethods';

export interface HTTPTransportOptions {
  timeout?: number;
  headers?: Record<string, string>;
  data?: unknown;
}

export interface HTTPTransportResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
}

export default class HTTPTransport {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private createRequest<T = unknown>(
    method: HTTPMethod,
    url: string,
    options: HTTPTransportOptions = {}
  ): Promise<HTTPTransportResponse<T>> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fullUrl = this.baseURL + url;

      // Настройка timeout
      if (options.timeout) {
        xhr.timeout = options.timeout;
      }

      // Обработка query string для GET запросов
      let requestUrl = fullUrl;
      if (method === HTTPMethod.GET && options.data && typeof options.data === 'object' && options.data !== null) {
        const queryString = this.buildQueryString(options.data as Record<string, unknown>);
        requestUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }

      xhr.open(method, requestUrl, true);
      
      // Включаем отправку cookies для авторизации
      xhr.withCredentials = true;

      // Установка заголовков
      // Для FormData НЕ устанавливаем Content-Type - браузер установит его сам с boundary
      // Также НЕ устанавливаем никакие другие заголовки для FormData, чтобы избежать preflight запроса
      const isFormData = options.data instanceof FormData;
      
      // Для FormData не устанавливаем НИКАКИЕ заголовки вручную
      // Браузер сам установит Content-Type с boundary, и это не вызовет preflight
      if (options.headers && !isFormData) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      // Обработка событий
      xhr.onload = () => {
        let responseData: unknown;
        try {
          // Пытаемся распарсить JSON, даже если статус не 200
          const text = xhr.responseText || '';
          if (text.trim()) {
            responseData = JSON.parse(text);
          } else {
            responseData = null;
          }
        } catch {
          // Если не JSON, возвращаем текст как есть
          responseData = xhr.responseText || null;
        }


        resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          data: responseData as T,
        });
      };

      xhr.onerror = () => {
        // Проверяем, не является ли это CORS ошибкой
        const errorMessage = xhr.statusText || 'Network error';
        let detailedError = `Network error: ${errorMessage}`;
        
        // Если статус 0 и нет ответа, это может быть CORS ошибка
        if (xhr.status === 0 && !xhr.responseText) {
          detailedError = 'CORS error: Запрос заблокирован политикой CORS. Проверьте настройки сервера и убедитесь, что запрос отправляется с правильными заголовками.';
        }
        
        console.error(`[HTTPTransport] Request error:`, {
          status: xhr.status,
          statusText: xhr.statusText,
          readyState: xhr.readyState,
          method,
          url: requestUrl,
          isFormData: options.data instanceof FormData,
        });
        
        reject(new Error(detailedError));
      };

      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      // Отправка данных для POST, PUT, DELETE
      if (method !== HTTPMethod.GET && options.data) {
        if (options.headers?.['Content-Type'] === 'application/json') {
          xhr.send(JSON.stringify(options.data));
        } else if (typeof options.data === 'string' || options.data instanceof FormData || options.data instanceof Blob) {
          xhr.send(options.data as XMLHttpRequestBodyInit);
        } else {
          xhr.send(JSON.stringify(options.data));
        }
      } else {
        xhr.send();
      }
    });
  }

  private buildQueryString(data: Record<string, unknown>): string {
    const params = new URLSearchParams();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }

  get<T = unknown>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest<T>(HTTPMethod.GET, url, options);
  }

  post<T = unknown>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    // Если данные - FormData, не устанавливаем Content-Type (браузер установит автоматически)
    const isFormData = options.data instanceof FormData;
    return this.createRequest<T>(HTTPMethod.POST, url, {
      ...options,
      headers: isFormData
        ? options.headers
        : {
            'Content-Type': 'application/json',
            ...options.headers,
          },
    });
  }

  put<T = unknown>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    // Если данные - FormData, НЕ передаем НИКАКИЕ заголовки, чтобы избежать CORS preflight
    const isFormData = options.data instanceof FormData;
    return this.createRequest<T>(HTTPMethod.PUT, url, {
      ...options,
      headers: isFormData
        ? undefined // Для FormData не передаем заголовки вообще
        : {
            'Content-Type': 'application/json',
            ...options.headers,
          },
    });
  }

  delete<T = unknown>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    // Если данные - FormData, не устанавливаем Content-Type (браузер установит автоматически)
    const isFormData = options.data instanceof FormData;
    return this.createRequest<T>(HTTPMethod.DELETE, url, {
      ...options,
      headers: isFormData
        ? options.headers
        : options.data
          ? {
              'Content-Type': 'application/json',
              ...options.headers,
            }
          : options.headers,
    });
  }
}


