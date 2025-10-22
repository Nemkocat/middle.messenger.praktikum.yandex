export default class EventBus<E extends string> {
    private listeners: Record<string, ((...args: unknown[]) => void)[]>;
    constructor() {
      this.listeners = {}; // создаёт пустой объект для хранения подписчиков listeners = {}
    }

    on(event: E, callback: (...args: unknown[]) => void) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    }

    off(event: E, callback: (...args: unknown[]) => void) {
      if (!this.listeners[event]) {
        throw new Error(`Нет события: ${event}`);
      }
      this.listeners[event] = this.listeners[event].filter(
        (listener) => listener !== callback,
      );
    }

    emit<T extends unknown[] = []>(event: E, ...args: T) {
      if (!this.listeners[event]) {
        return;
        // throw new Error(`Нет события: ${event}`);
      }
      this.listeners[event].forEach(function (listener) {
        listener(...args);
      });
    }
}

