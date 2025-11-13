import AuthAPI, { User } from '../services/AuthAPI';
import { Router } from '../core/router';
import { Validator } from '../utils/validation';

class AuthController {
  private currentUser: User | null = null;
  private router: Router | null = null;

  constructor() {
    // Не вызываем checkAuth() в конструкторе - он будет вызываться через роутер
    // Это предотвращает ненужные запросы при инициализации
  }

  setRouter(router: Router): void {
    this.router = router;
  }

  // Получить роутер из window или из приватного поля
  private getRouter(): Router | null {
    // Используем window.router согласно архитектуре
    return window.router || this.router;
  }

  async checkAuth(): Promise<boolean> {
    try {
      const user = await AuthAPI.getUser();
      this.currentUser = user;
      return true;
    } catch (error) {
      // Игнорируем ошибку 401 (Unauthorized) - это нормальная ситуация для неавторизованного пользователя
      this.currentUser = null;
      return false;
    }
  }

  async signUp(data: {
    first_name: string;
    second_name: string;
    login: string;
    email: string;
    password: string;
    phone: string;
    password_repeat?: string;
  }): Promise<{ isValid: boolean; errors?: Record<string, string> }> {
    // Валидация данных в контроллере
    const fields = ['email', 'login', 'first_name', 'second_name', 'phone', 'password', 'password_repeat'];
    const errors: Record<string, string> = {};
    let hasErrors = false;

    fields.forEach(fieldName => {
      const value = data[fieldName as keyof typeof data] as string;
      const validation = Validator.validate(fieldName, value, data as Record<string, string>);
      
      if (!validation.isValid) {
        hasErrors = true;
        errors[fieldName] = validation.errorMessage;
      }
    });

    // Если есть ошибки валидации, возвращаем их
    if (hasErrors) {
      return { isValid: false, errors };
    }

    try {
      await AuthAPI.signUp({
        first_name: data.first_name,
        second_name: data.second_name,
        login: data.login,
        email: data.email,
        password: data.password,
        phone: data.phone,
      });
      
      // После успешной регистрации проверяем, авторизован ли пользователь
      // После регистрации API может автоматически авторизовать пользователя
      try {
        const user = await AuthAPI.getUser();
        this.currentUser = user;
        
        // Навигация в контроллере через window.router
        const router = this.getRouter();
        if (router) {
          router.go('/messenger');
        }
        
        return { isValid: true };
      } catch (getUserError) {
        // Если getUser не удался, пытаемся войти вручную
        try {
          const signInResult = await this.signIn({ login: data.login, password: data.password });
          // Если валидация входа не прошла, пробрасываем ошибку
          if (!signInResult.isValid) {
            throw new Error('Ошибка входа после регистрации');
          }
          // signIn уже сделал навигацию, просто возвращаем успех
          return { isValid: true };
        } catch (signInError) {
          // Если вход не удался после регистрации, пробрасываем ошибку входа
          throw signInError;
        }
      }
    } catch (error) {
      // Пробрасываем ошибку регистрации
      throw error;
    }
  }

  async signIn(data: { login: string; password: string }): Promise<{ isValid: boolean; errors?: Record<string, string> }> {
    // Валидация данных в контроллере
    const errors: Record<string, string> = {};
    let hasErrors = false;

    const loginValidation = Validator.validate('login', data.login);
    if (!loginValidation.isValid) {
      hasErrors = true;
      errors.login = loginValidation.errorMessage;
    }

    const passwordValidation = Validator.validate('password', data.password);
    if (!passwordValidation.isValid) {
      hasErrors = true;
      errors.password = passwordValidation.errorMessage;
    }

    // Если есть ошибки валидации, возвращаем их
    if (hasErrors) {
      return { isValid: false, errors };
    }

    try {
      await AuthAPI.signIn(data);
      // Получаем данные пользователя после успешного входа
      const user = await AuthAPI.getUser();
      this.currentUser = user;
      
      // Навигация в контроллере через window.router
      const router = this.getRouter();
      if (router) {
        router.go('/messenger');
      }
      
      return { isValid: true };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AuthAPI.logout();
      this.currentUser = null;
      
      // Навигация в контроллере через window.router
      const router = this.getRouter();
      if (router) {
        router.go('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  getUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export default new AuthController();


