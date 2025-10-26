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
    method: string,
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
      if (method === 'GET' && options.data && typeof options.data === 'object' && options.data !== null) {
        const queryString = this.buildQueryString(options.data as Record<string, unknown>);
        requestUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
      }

      xhr.open(method, requestUrl, true);

      // Установка заголовков
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      // Обработка событий
      xhr.onload = () => {
        let responseData: unknown;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch {
          responseData = xhr.responseText;
        }

        resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          data: responseData as T,
        });
      };

      xhr.onerror = () => {
        reject(new Error(`Network error: ${xhr.statusText}`));
      };

      xhr.ontimeout = () => {
        reject(new Error('Request timeout'));
      };

      // Отправка данных для POST, PUT, DELETE
      if (method !== 'GET' && options.data) {
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
    return this.createRequest<T>('GET', url, options);
  }

  post<T = unknown>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest<T>('POST', url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  put<T = unknown>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest<T>('PUT', url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  delete<T = unknown>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest<T>('DELETE', url, options);
  }
}

