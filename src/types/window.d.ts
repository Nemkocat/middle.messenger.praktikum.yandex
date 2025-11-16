// Расширение типа Window для глобального роутера
import { Router } from '../core/router';

declare global {
  interface Window {
    router?: Router;
  }
}

export {};

