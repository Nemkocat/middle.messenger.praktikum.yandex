import Block from "../../../core/block";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
import AuthController from "../../../controllers/AuthController";
import { Validator } from "../../../utils/validation";
import loginTemplate from "./login.hbs?raw";

interface LoginPageFormState {
  login: string;
  password: string;
}

interface LoginPageErrors {
  login: string;
  password: string;
}

interface LoginPageProps {
  onSubmit?: (e: Event) => void;
  onLoginChange?: (e: Event) => void;
  onPasswordChange?: (e: Event) => void;
  formState?: LoginPageFormState;
  errors?: LoginPageErrors;
}

export default class LoginPage extends Block {
  constructor(props: LoginPageProps) {
    super("div", {
      ...props,
      formState: {
        login: "",
        password: "",
      },
      errors: {
        login: "",
        password: "",
      },
      className: "container",
      LoginInput: new Input({
        id: "login-username",
        class: "auth-form__input-wrapper",
        type: "text",
        placeholder: "Логин",
        name: "login",
        value: "",
        error: "",
        onChange: (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          const validation = Validator.validate("login", value);
          
          const loginInput = this.children.LoginInput;
          if (loginInput && !Array.isArray(loginInput)) {
            loginInput.setProps({
              value,
              error: validation.isValid ? "" : validation.errorMessage,
            });
          }

          const currentFormState = (this.props.formState || { login: "", password: "" }) as LoginPageFormState;
          const currentErrors = (this.props.errors || { login: "", password: "" }) as LoginPageErrors;
          
          const newFormState = {
              ...currentFormState,
              login: value
          };
          const newErrors = {
              ...currentErrors,
              login: validation.isValid ? "" : validation.errorMessage,
          };

          this.setProps({
            formState: newFormState,
            errors: newErrors
          });

          // Обновляем состояние кнопки отправки
          this.updateSubmitButton(newFormState, newErrors);
        },
        onBlur: (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          const validation = Validator.validate("login", value);
          
          const loginInput = this.children.LoginInput;
          if (loginInput && !Array.isArray(loginInput)) {
            loginInput.setProps({
              error: validation.isValid ? "" : validation.errorMessage,
            });
          }

          const currentFormState = (this.props.formState || { login: "", password: "" }) as LoginPageFormState;
          const currentErrors = (this.props.errors || { login: "", password: "" }) as LoginPageErrors;
          
          const newErrors = {
            ...currentErrors,
            login: validation.isValid ? "" : validation.errorMessage,
          };

          this.setProps({
            errors: newErrors
          });

          // Обновляем состояние кнопки отправки
          this.updateSubmitButton(currentFormState as unknown as Record<string, string>, newErrors);
        },
      }),
      PasswordInput: new Input({
        id: "login-password",
        class: "auth-form__input-wrapper",
        type: "password",
        placeholder: "Пароль",
        name: "password",
        value: "",
        error: "",
        onChange: (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          const validation = Validator.validate("password", value);
          
          const passwordInput = this.children.PasswordInput;
          if (passwordInput && !Array.isArray(passwordInput)) {
            passwordInput.setProps({
              value,
              error: validation.isValid ? "" : validation.errorMessage,
            });
          }

          const currentFormState = (this.props.formState || { login: "", password: "" }) as LoginPageFormState;
          const currentErrors = (this.props.errors || { login: "", password: "" }) as LoginPageErrors;
          
          const newFormState = {
              ...currentFormState,
              password: value
          };
          const newErrors = {
              ...currentErrors,
              password: validation.isValid ? "" : validation.errorMessage,
          };

          this.setProps({
            formState: newFormState,
            errors: newErrors
          });

          // Обновляем состояние кнопки отправки
          this.updateSubmitButton(newFormState, newErrors);
        },
        onBlur: (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          const validation = Validator.validate("password", value);
          
          const passwordInput = this.children.PasswordInput;
          if (passwordInput && !Array.isArray(passwordInput)) {
            passwordInput.setProps({
              error: validation.isValid ? "" : validation.errorMessage,
            });
          }

          const currentFormState = (this.props.formState || { login: "", password: "" }) as LoginPageFormState;
          const currentErrors = (this.props.errors || { login: "", password: "" }) as LoginPageErrors;
          
          const newErrors = {
            ...currentErrors,
            password: validation.isValid ? "" : validation.errorMessage,
          };

          this.setProps({
            errors: newErrors
          });

          // Обновляем состояние кнопки отправки
          this.updateSubmitButton(currentFormState as unknown as Record<string, string>, newErrors);
        },
      }),
      SubmitButton: new Button({
        id: "submit-btn",
        class: "auth-form__btn login-btn",
        text: "Авторизироваться",
        disabled: true,
        type: "submit",
      }),
      RegisterLink: new Link({
        href: "#",
        class: "auth-form__link",
        page: "register",
        text: "Нет аккаунта?",
      }),
      events: {
        submit: (e: Event) => this.handleSubmit(e),
      },
    });
  }

  // Проверка валидности всех полей формы
  private isFormValid(formState: Record<string, string>, errors: Record<string, string>): boolean {
    const requiredFields = ['login', 'password'];
    
    // Проверяем, что все обязательные поля заполнены и валидны
    return requiredFields.every(fieldName => {
      const value = formState[fieldName];
      const error = errors[fieldName];
      return value && value.trim() !== '' && !error;
    });
  }

  // Обновление состояния кнопки отправки
  private updateSubmitButton(formState: Record<string, string>, errors: Record<string, string>) {
    const submitButton = this.children.SubmitButton;
    if (submitButton && !Array.isArray(submitButton)) {
      const isValid = this.isFormValid(formState, errors);
      submitButton.setProps({
        disabled: !isValid,
      });
    }
  }

  private isSubmitting: boolean = false;

  async handleSubmit(e: Event) {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события
    
    // Защита от повторных вызовов
    if (this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Блокируем кнопку отправки, чтобы предотвратить повторные запросы
    const submitButton = this.children.SubmitButton;
    if (submitButton && !Array.isArray(submitButton)) {
      submitButton.setProps({
        text: 'Вход...',
        disabled: true,
      });
    }

    try {
      // Вызываем контроллер - валидация и навигация внутри контроллера
      const formState = (this.props.formState || { login: "", password: "" }) as LoginPageFormState;
      const result = await AuthController.signIn({
        login: formState.login,
        password: formState.password,
      });
      
      // Если валидация не прошла, показываем ошибки в UI
      if (!result.isValid && result.errors) {
        const newErrors: Record<string, string> = {};
        
        // Обновляем ошибки в компонентах
        Object.entries(result.errors).forEach(([fieldName, errorMessage]) => {
          newErrors[fieldName] = errorMessage;
          
          // Обновляем соответствующий Input компонент
          const componentName = fieldName === 'login' 
            ? 'LoginInput' 
            : 'PasswordInput';
          const inputComponent = this.children[componentName];
          if (inputComponent && !Array.isArray(inputComponent)) {
            inputComponent.setProps({
              error: errorMessage,
            });
          }
        });
        
        this.setProps({
          errors: newErrors
        });
      }
      // Если валидация прошла, контроллер сам сделает навигацию
    } catch (error) {
      console.error('Login error:', error);
      // Показываем ошибку пользователю
      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа';
      const currentErrors = (this.props.errors || { login: "", password: "" }) as LoginPageErrors;
      this.setProps({
        errors: {
          ...currentErrors,
          login: errorMessage,
        }
      });
      
      const loginInput = this.children.LoginInput;
      if (loginInput && !Array.isArray(loginInput)) {
        loginInput.setProps({
          error: errorMessage,
        });
      }
    } finally {
      // Разблокируем кнопку отправки
      if (submitButton && !Array.isArray(submitButton)) {
        submitButton.setProps({
          text: 'Авторизироваться',
          disabled: false,
        });
      }
      // Сбрасываем флаг после завершения
      this.isSubmitting = false;
    }
  }

  render(): string {
    return loginTemplate;
  }
}

export { LoginPage };

