export interface ValidationResult {
    isValid: boolean;
    errorMessage: string;
  }
  
  export class Validator {
    static validate(fieldName: string, value: string, allData?: Record<string, string>): ValidationResult {
      const validators: Record<string, (value: string, allData?: Record<string, string>) => ValidationResult> = {
        // Регистрация (RegisterPage) и редактирование профиля (EditProfilePage)
        first_name: this.validateName,        // Имя - регистрация, редактирование профиля
        second_name: this.validateName,       // Фамилия - регистрация, редактирование профиля
        login: this.validateLogin,           // Логин - авторизация, регистрация, редактирование профиля
        email: this.validateEmail,           // Email - регистрация, редактирование профиля
        phone: this.validatePhone,           // Телефон - регистрация, редактирование профиля
        
        // Авторизация (LoginPage) и регистрация (RegisterPage)
        password: this.validatePassword,     // Пароль - авторизация, регистрация
        
        // Регистрация (RegisterPage)
        password_repeat: this.validatePasswordRepeat,  // Повтор пароля - регистрация
        
        // Смена пароля (EditPasswordPage)
        oldPassword: this.validateOldPassword,        // Старый пароль - смена пароля
        newPassword: this.validateNewPassword,        // Новый пароль - смена пароля
        confirmPassword: this.validateConfirmPassword, // Подтверждение пароля - смена пароля
        
        // Отправка сообщений (ChatArea)
        message: this.validateMessage,        // Сообщение - чат
      };
  
      const validator = validators[fieldName];
      if (validator) {
        return validator(value, allData);
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    // Валидация имени и фамилии
    // Используется в: RegisterPage (регистрация), EditProfilePage (редактирование профиля)
    // Правила: латиница или кириллица, первая буква заглавная, без пробелов и цифр, только дефис
    private static validateName(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      const regex = /^[A-ZА-Я][a-zA-Zа-яА-Я-]*$/;
      if (!regex.test(value)) {
        return { 
          isValid: false, 
          errorMessage: 'Латиница или кириллица, первая буква заглавная, без пробелов, цифр и спецсимволов (кроме дефиса)' 
        };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    // Валидация логина
    // Используется в: LoginPage (авторизация), RegisterPage (регистрация), EditProfilePage (редактирование профиля)
    // Правила: от 3 до 20 символов, латиница, может содержать цифры, но не состоять из них, без пробелов, только дефис и подчёркивание
    private static validateLogin(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      if (value.length < 3 || value.length > 20) {
        return { isValid: false, errorMessage: 'Длина должна быть от 3 до 20 символов' };
      }
      
      const regex = /^[a-zA-Z0-9_-]*$/;
      if (!regex.test(value)) {
        return { 
          isValid: false, 
          errorMessage: 'Латиница, может содержать цифры, дефис и нижнее подчёркивание' 
        };
      }
      
      // Проверка, что логин не состоит только из цифр
      const onlyDigits = /^\d+$/;
      if (onlyDigits.test(value)) {
        return { isValid: false, errorMessage: 'Логин не может состоять только из цифр' };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    // Валидация email
    // Используется в: RegisterPage (регистрация), EditProfilePage (редактирование профиля)
    // Правила: латиница, может включать цифры и спецсимволы, обязательно @ и точка после неё, перед точкой должны быть буквы
    private static validateEmail(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!regex.test(value)) {
        return { 
          isValid: false, 
          errorMessage: 'Латиница, может включать цифры и спецсимволы, должна быть @ и точка после неё' 
        };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    // Валидация пароля
    // Используется в: LoginPage (авторизация), RegisterPage (регистрация)
    // Правила: от 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра
    private static validatePassword(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      if (value.length < 8 || value.length > 40) {
        return { isValid: false, errorMessage: 'Длина должна быть от 8 до 40 символов' };
      }
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasDigit = /\d/.test(value);
      
      if (!hasUpperCase || !hasDigit) {
        return { 
          isValid: false, 
          errorMessage: 'Пароль должен содержать хотя бы одну заглавную букву и цифру' 
        };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    // Валидация телефона
    // Используется в: RegisterPage (регистрация), EditProfilePage (редактирование профиля)
    // Правила: от 10 до 15 символов, состоит из цифр, может начинаться с плюса
    private static validatePhone(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      const regex = /^\+?[0-9]{10,15}$/;
      if (!regex.test(value)) {
        return { 
          isValid: false, 
          errorMessage: 'Телефон должен содержать от 10 до 15 цифр, может начинаться с плюса' 
        };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    // Валидация сообщения
    // Используется в: ChatArea (отправка сообщений в чате)
    // Правила: не должно быть пустым
    private static validateMessage(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Сообщение не должно быть пустым' };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    // Валидация повторного ввода пароля
    // Используется в: RegisterPage (регистрация) - поле "password_repeat"
    // Правила: не должно быть пустым, должно совпадать с основным паролем
    private static validatePasswordRepeat(value: string, allData?: Record<string, string>): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      // Проверяем соответствие паролей только если основной пароль тоже заполнен
      if (allData?.password && allData.password.trim()) {
        if (value !== allData.password) {
          return { isValid: false, errorMessage: 'Пароли не совпадают' };
        }
      }
      
      return { isValid: true, errorMessage: '' };
    }

    // Валидация старого пароля
    // Используется в: EditPasswordPage (смена пароля) - поле "oldPassword"
    // Правила: не должно быть пустым
    private static validateOldPassword(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      return { isValid: true, errorMessage: '' };
    }

    // Валидация нового пароля
    // Используется в: EditPasswordPage (смена пароля) - поле "newPassword"
    // Правила: от 8 до 40 символов, обязательно хотя бы одна заглавная буква и цифра
    private static validateNewPassword(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      if (value.length < 8 || value.length > 40) {
        return { isValid: false, errorMessage: 'Длина должна быть от 8 до 40 символов' };
      }
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasDigit = /\d/.test(value);
      
      if (!hasUpperCase || !hasDigit) {
        return { 
          isValid: false, 
          errorMessage: 'Пароль должен содержать хотя бы одну заглавную букву и цифру' 
        };
      }
      
      return { isValid: true, errorMessage: '' };
    }

    // Валидация подтверждения пароля
    // Используется в: EditPasswordPage (смена пароля) - поле "confirmPassword"
    // Правила: не должно быть пустым, должно совпадать с новым паролем
    private static validateConfirmPassword(value: string, allData?: Record<string, string>): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      // Проверяем соответствие паролей только если новый пароль тоже заполнен
      if (allData?.newPassword && allData.newPassword.trim()) {
        if (value !== allData.newPassword) {
          return { isValid: false, errorMessage: 'Пароли не совпадают' };
        }
      }
      
      return { isValid: true, errorMessage: '' };
    }
  }