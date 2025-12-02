import { JSDOM } from 'jsdom';

// Создаем фейковое браузерное окружение
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
});

// Глобальные объекты для Node.js окружения
(global as any).window = dom.window as unknown as Window & typeof globalThis;
(global as any).document = dom.window.document;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).XMLHttpRequest = dom.window.XMLHttpRequest;
(global as any).FormData = dom.window.FormData;
(global as any).Blob = dom.window.Blob;
(global as any).File = dom.window.File;
(global as any).ProgressEvent = dom.window.ProgressEvent;
(global as any).Event = dom.window.Event;

// Мокаем History API
(global as any).history = dom.window.history;
(global as any).location = dom.window.location;

// navigator уже существует в JSDOM, не нужно переопределять

// Расширяем Window для поддержки window.router
import { Router } from '../src/core/router.js';

declare global {
  interface Window {
    router?: Router;
  }
}
