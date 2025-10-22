export interface HTTPTransportOptions {
  timeout?: number;
  headers?: Record<string, string>;
  data?: any;
}

export interface HTTPTransportResponse<T = any> {
  status: number;
  statusText: string;
  data: T;
}

export default class HTTPTransport {
  private baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private createRequest(
    method: string,
    url: string,
    options: HTTPTransportOptions = {}
  ): Promise<HTTPTransportResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fullUrl = this.baseURL + url;

      // Настройка timeout
      if (options.timeout) {
        xhr.timeout = options.timeout;
      }

      // Обработка query string для GET запросов
      let requestUrl = fullUrl;
      if (method === 'GET' && options.data) {
        const queryString = this.buildQueryString(options.data);
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
        let responseData: any;
        try {
          responseData = JSON.parse(xhr.responseText);
        } catch {
          responseData = xhr.responseText;
        }

        resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          data: responseData,
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
        } else {
          xhr.send(options.data);
        }
      } else {
        xhr.send();
      }
    });
  }

  private buildQueryString(data: Record<string, any>): string {
    const params = new URLSearchParams();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    });

    return params.toString();
  }

  get<T = any>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest('GET', url, options);
  }

  post<T = any>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest('POST', url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  put<T = any>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest('PUT', url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  delete<T = any>(url: string, options: HTTPTransportOptions = {}): Promise<HTTPTransportResponse<T>> {
    return this.createRequest('DELETE', url, options);
  }
}
