import { expect } from 'chai';
import HTTPTransport from './HTTPTransport.js';
import { HTTPMethod } from './httpMethods.js';

// Простой мок XMLHttpRequest (используем свой мок, так как useFakeXMLHttpRequest устарел в новых версиях Sinon)
class MockXMLHttpRequest {
  method: string = '';
  url: string = '';
  requestBody: string | null = null;
  requestHeaders: Record<string, string> = {};
  status: number = 0;
  statusText: string = '';
  responseText: string = '';
  timeout: number = 0;
  withCredentials: boolean = false;
  readyState: number = 0;
  onload: ((this: XMLHttpRequest, ev: ProgressEvent<XMLHttpRequestEventTarget>) => any) | null = null;
  onerror: ((this: XMLHttpRequest, ev: ProgressEvent<XMLHttpRequestEventTarget>) => any) | null = null;
  ontimeout: ((this: XMLHttpRequest, ev: ProgressEvent<XMLHttpRequestEventTarget>) => any) | null = null;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
    this.readyState = 1;
  }

  setRequestHeader(name: string, value: string) {
    this.requestHeaders[name] = value;
  }

  send(body?: string | FormData | Blob) {
    this.requestBody = typeof body === 'string' ? body : null;
    this.readyState = 2;
  }

  // Методы для управления ответом в тестах
  respond(status: number, _headers: Record<string, string>, responseText: string) {
    this.status = status;
    this.statusText = status === 200 ? 'OK' : 'Error';
    this.responseText = responseText;
    this.readyState = 4;
    
    if (this.onload) {
      const event = new ProgressEvent('load') as ProgressEvent<XMLHttpRequestEventTarget>;
      this.onload.call(this as any, event);
    }
  }

  error() {
    this.status = 0;
    this.statusText = 'Network Error';
    this.readyState = 4;
    
    if (this.onerror) {
      const event = new ProgressEvent('error') as ProgressEvent<XMLHttpRequestEventTarget>;
      this.onerror.call(this as any, event);
    }
  }
}

describe('HTTPTransport', () => {
  let httpTransport: HTTPTransport;
  let requests: MockXMLHttpRequest[];
  let originalXHR: typeof XMLHttpRequest;

  beforeEach(() => {
    requests = [];
    originalXHR = (global as any).XMLHttpRequest;
    
    // Заменяем XMLHttpRequest на мок
    (global as any).XMLHttpRequest = class extends MockXMLHttpRequest {
      constructor() {
        super();
        requests.push(this);
      }
    } as any;

    httpTransport = new HTTPTransport();
  });

  afterEach(() => {
    // Восстанавливаем оригинальный XMLHttpRequest
    (global as any).XMLHttpRequest = originalXHR;
  });

  describe('Конструктор', () => {
    it('должен создать экземпляр HTTPTransport', () => {
      // Assert
      expect(httpTransport).to.exist;
      expect(httpTransport).to.be.instanceOf(HTTPTransport);
    });

    it('должен установить baseURL', () => {
      // Arrange & Act
      const transport = new HTTPTransport('https://api.example.com');

      // Assert
      expect(transport).to.exist;
    });
  });

  describe('GET запросы', () => {
    it('должен выполнить GET запрос', async () => {
      // Arrange
      const responseData = { id: 1, name: 'Test' };
      const url = '/test';

      // Act
      const promise = httpTransport.get(url);
      requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(responseData));
      const response = await promise;

      // Assert
      expect(requests).to.have.length(1);
      expect(requests[0].method).to.equal(HTTPMethod.GET);
      expect(requests[0].url).to.include(url);
      expect(response.status).to.equal(200);
      expect(response.data).to.deep.equal(responseData);
    });

    it('должен добавить query параметры для GET запроса', async () => {
      // Arrange
      const url = '/test';
      const data = { page: 1, limit: 10 };

      // Act
      const promise = httpTransport.get(url, { data });
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');
      await promise;

      // Assert
      expect(requests[0].url).to.include('page=1');
      expect(requests[0].url).to.include('limit=10');
    });
  });

  describe('POST запросы', () => {
    it('должен выполнить POST запрос с JSON данными', async () => {
      // Arrange
      const url = '/test';
      const requestData = { name: 'Test', value: 123 };
      const responseData = { id: 1, ...requestData };

      // Act
      const promise = httpTransport.post(url, { data: requestData });
      requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(responseData));
      const response = await promise;

      // Assert
      expect(requests[0].method).to.equal(HTTPMethod.POST);
      expect(requests[0].requestBody).to.equal(JSON.stringify(requestData));
      expect(requests[0].requestHeaders['Content-Type']).to.equal('application/json');
      expect(response.status).to.equal(200);
      expect(response.data).to.deep.equal(responseData);
    });

    it('должен установить кастомные заголовки', async () => {
      // Arrange
      const url = '/test';
      const headers = { 'Authorization': 'Bearer token123', 'X-Custom-Header': 'value' };

      // Act
      const promise = httpTransport.post(url, { headers });
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');
      await promise;

      // Assert
      expect(requests[0].requestHeaders['Authorization']).to.equal('Bearer token123');
      expect(requests[0].requestHeaders['X-Custom-Header']).to.equal('value');
    });
  });

  describe('PUT запросы', () => {
    it('должен выполнить PUT запрос с JSON данными', async () => {
      // Arrange
      const url = '/test/1';
      const requestData = { name: 'Updated' };
      const responseData = { id: 1, ...requestData };

      // Act
      const promise = httpTransport.put(url, { data: requestData });
      requests[0].respond(200, { 'Content-Type': 'application/json' }, JSON.stringify(responseData));
      const response = await promise;

      // Assert
      expect(requests[0].method).to.equal(HTTPMethod.PUT);
      expect(requests[0].requestBody).to.equal(JSON.stringify(requestData));
      expect(response.status).to.equal(200);
    });
  });

  describe('DELETE запросы', () => {
    it('должен выполнить DELETE запрос', async () => {
      // Arrange
      const url = '/test/1';

      // Act
      const promise = httpTransport.delete(url);
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');
      const response = await promise;

      // Assert
      expect(requests[0].method).to.equal(HTTPMethod.DELETE);
      expect(response.status).to.equal(200);
    });
  });

  describe('Обработка ошибок', () => {
    it('должен обработать сетевую ошибку', async () => {
      // Arrange
      const url = '/test';

      // Act
      const promise = httpTransport.get(url);
      requests[0].error();

      // Assert
      try {
        await promise;
        expect.fail('Должна была быть выброшена ошибка');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        // Проверяем, что ошибка содержит информацию о сетевой ошибке или CORS
        const errorMessage = (error as Error).message;
        expect(errorMessage).to.satisfy((msg: string) => 
          msg.includes('Network error') || msg.includes('CORS error')
        );
      }
    });

    it('должен обработать timeout', async () => {
      // Arrange
      const url = '/test';

      // Act
      const promise = httpTransport.get(url, { timeout: 100 });
      if (requests[0].ontimeout) {
        requests[0].ontimeout.call(requests[0] as any, new ProgressEvent('timeout') as any);
      }

      // Assert
      try {
        await promise;
        expect.fail('Должна была быть выброшена ошибка');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.equal('Request timeout');
      }
    });

    it('должен обработать не-JSON ответ', async () => {
      // Arrange
      const url = '/test';
      const textResponse = 'Plain text response';

      // Act
      const promise = httpTransport.get(url);
      requests[0].respond(200, { 'Content-Type': 'text/plain' }, textResponse);
      const response = await promise;

      // Assert
      expect(response.data).to.equal(textResponse);
    });

    it('должен обработать пустой ответ', async () => {
      // Arrange
      const url = '/test';

      // Act
      const promise = httpTransport.get(url);
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '');
      const response = await promise;

      // Assert
      expect(response.data).to.be.null;
    });
  });

  describe('baseURL', () => {
    it('должен добавить baseURL к URL запроса', async () => {
      // Arrange
      const baseURL = 'https://api.example.com';
      const transport = new HTTPTransport(baseURL);
      const url = '/test';

      // Act
      const promise = transport.get(url);
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');
      await promise;

      // Assert
      expect(requests[0].url).to.equal(`${baseURL}${url}`);
    });
  });

  describe('withCredentials', () => {
    it('должен установить withCredentials в true', async () => {
      // Arrange
      const url = '/test';

      // Act
      const promise = httpTransport.get(url);
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');
      await promise;

      // Assert
      expect(requests[0].withCredentials).to.be.true;
    });
  });

  describe('timeout', () => {
    it('должен установить timeout', async () => {
      // Arrange
      const url = '/test';
      const timeout = 5000;

      // Act
      const promise = httpTransport.get(url, { timeout });
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');
      await promise;

      // Assert
      expect(requests[0].timeout).to.equal(timeout);
    });
  });

  describe('buildQueryString', () => {
    it('должен правильно построить query string', async () => {
      // Arrange
      const url = '/test';
      const data = {
        page: 1,
        limit: 10,
        search: 'test query',
        active: true,
        nullValue: null,
        undefinedValue: undefined,
      };

      // Act
      const promise = httpTransport.get(url, { data });
      requests[0].respond(200, { 'Content-Type': 'application/json' }, '{}');
      await promise;

      // Assert
      const urlObj = new URL(requests[0].url, 'http://localhost');
      expect(urlObj.searchParams.get('page')).to.equal('1');
      expect(urlObj.searchParams.get('limit')).to.equal('10');
      expect(urlObj.searchParams.get('search')).to.equal('test query');
      expect(urlObj.searchParams.get('active')).to.equal('true');
      expect(urlObj.searchParams.has('nullValue')).to.be.false;
      expect(urlObj.searchParams.has('undefinedValue')).to.be.false;
    });
  });
});
