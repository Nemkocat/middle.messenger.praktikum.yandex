export interface ValidationResult {
    isValid: boolean;
    errorMessage: string;
  }
  
  export class Validator {
    static validate(fieldName: string, value: string, allData?: Record<string, string>): ValidationResult {
      const validators: Record<string, (value: string, allData?: Record<string, string>) => ValidationResult> = {
        first_name: this.validateName,
        second_name: this.validateName,
        login: this.validateLogin,
        email: this.validateEmail,
        password: this.validatePassword,
        phone: this.validatePhone,
        message: this.validateMessage,
        password_repeat: this.validatePasswordRepeat,
      };
  
      const validator = validators[fieldName];
      if (validator) {
        return validator(value, allData);
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
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
  
    private static validateEmail(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.[a-zA-Z]+$/;
      if (!regex.test(value)) {
        return { 
          isValid: false, 
          errorMessage: 'Латиница, может включать цифры и спецсимволы, должна быть @ и точка после неё' 
        };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
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
  
    private static validateMessage(value: string): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Сообщение не должно быть пустым' };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  
    private static validatePasswordRepeat(value: string, allData?: Record<string, string>): ValidationResult {
      if (!value.trim()) {
        return { isValid: false, errorMessage: 'Поле не должно быть пустым' };
      }
      
      if (allData?.password && value !== allData.password) {
        return { isValid: false, errorMessage: 'Пароли не совпадают' };
      }
      
      return { isValid: true, errorMessage: '' };
    }
  }