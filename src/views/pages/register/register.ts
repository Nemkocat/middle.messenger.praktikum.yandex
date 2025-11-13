import Block from "../../../core/block";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
import AuthController from "../../../controllers/AuthController";
import { Validator } from "../../../utils/validation";
import registerTemplate from "./register.hbs?raw";

interface RegisterPageProps {
  onSubmit?: (e: Event) => void;
  onFieldChange?: (field: string, e: Event) => void;
}

export default class RegisterPage extends Block {
  constructor(props: RegisterPageProps) {
    super("div", {
      ...props,
      formState: {
        email: "",
        login: "",
        first_name: "",
        second_name: "",
        phone: "",
        password: "",
        password_repeat: "",
      },
      errors: {
        email: "",
        login: "",
        first_name: "",
        second_name: "",
        phone: "",
        password: "",
        password_repeat: "",
      },
      className: "container",
      EmailInput: new Input({
        id: "register-email",
        class: "auth-form__input-wrapper",
        type: "email",
        placeholder: "Почта",
        name: "email",
        value: "",
        error: "",
        onChange: (e: Event) => this.handleFieldChange("email", e),
        onBlur: (e: Event) => this.handleFieldBlur("email", e),
      }),
      UsernameInput: new Input({
        id: "register-username",
        class: "auth-form__input-wrapper",
        type: "text",
        placeholder: "Логин",
        name: "login",
        value: "",
        error: "",
        onChange: (e: Event) => this.handleFieldChange("login", e),
        onBlur: (e: Event) => this.handleFieldBlur("login", e),
      }),
      NameInput: new Input({
        id: "register-name",
        class: "auth-form__input-wrapper",
        type: "text",
        placeholder: "Имя",
        name: "first_name",
        value: "",
        error: "",
        onChange: (e: Event) => this.handleFieldChange("first_name", e),
        onBlur: (e: Event) => this.handleFieldBlur("first_name", e),
      }),
      SurnameInput: new Input({
        id: "register-surname",
        class: "auth-form__input-wrapper",
        type: "text",
        placeholder: "Фамилия",
        name: "second_name",
        value: "",
        error: "",
        onChange: (e: Event) => this.handleFieldChange("second_name", e),
        onBlur: (e: Event) => this.handleFieldBlur("second_name", e),
      }),
      PhoneInput: new Input({
        id: "register-tel",
        class: "auth-form__input-wrapper",
        type: "tel",
        placeholder: "Телефон",
        name: "phone",
        value: "",
        error: "",
        onChange: (e: Event) => this.handleFieldChange("phone", e),
        onBlur: (e: Event) => this.handleFieldBlur("phone", e),
      }),
      PasswordInput: new Input({
        id: "login-password",
        class: "auth-form__input-wrapper",
        type: "password",
        placeholder: "Пароль",
        name: "password",
        value: "",
        error: "",
        onChange: (e: Event) => this.handleFieldChange("password", e),
        onBlur: (e: Event) => this.handleFieldBlur("password", e),
      }),
      PasswordRepeatInput: new Input({
        id: "login-password-repeat",
        class: "auth-form__input-wrapper",
        type: "password",
        placeholder: "Пароль (ещё раз)",
        name: "password_repeat",
        value: "",
        error: "",
        onChange: (e: Event) => this.handleFieldChange("password_repeat", e),
        onBlur: (e: Event) => this.handleFieldBlur("password_repeat", e),
      }),
      SubmitButton: new Button({
        id: "submit-btn",
        class: "auth-form__btn register-btn",
        text: "Зарегистрироваться",
        disabled: true,
        type: "submit",
      }),
      LoginLink: new Link({
        href: "#",
        class: "auth-form__link",
        page: "login",
        text: "Войти",
      }),
      events: {
        submit: (e: Event) => this.handleSubmit(e),
      },
    });
  }

  // Проверка валидности всех полей формы
  private isFormValid(formState: Record<string, string>, errors: Record<string, string>): boolean {
    const requiredFields = ['email', 'login', 'first_name', 'second_name', 'phone', 'password', 'password_repeat'];
    
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

  handleFieldChange(fieldName: string, e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const validation = Validator.validate(fieldName, value, this.props.formState);
    
    // Обновляем соответствующий Input компонент
    const inputComponent = this.children[`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Input`];
    if (inputComponent && !Array.isArray(inputComponent)) {
      inputComponent.setProps({
        value,
        error: validation.isValid ? "" : validation.errorMessage,
      });
    }

    // Обновляем состояние формы
    const newFormState = {
      ...this.props.formState,
      [fieldName]: value
    };

    const newErrors = {
      ...this.props.errors,
      [fieldName]: validation.isValid ? "" : validation.errorMessage,
    };

    // Если изменился основной пароль, перевалидируем повторный пароль
    if (fieldName === "password" && this.props.formState.password_repeat) {
      const passwordRepeatValidation = Validator.validate("password_repeat", this.props.formState.password_repeat, newFormState);
      newErrors.password_repeat = passwordRepeatValidation.isValid ? "" : passwordRepeatValidation.errorMessage;
      
      // Обновляем компонент повторного пароля
      const passwordRepeatComponent = this.children["PasswordRepeatInput"];
      if (passwordRepeatComponent && !Array.isArray(passwordRepeatComponent)) {
        passwordRepeatComponent.setProps({
          error: passwordRepeatValidation.isValid ? "" : passwordRepeatValidation.errorMessage,
        });
      }
    }

    // Если изменился повторный пароль, перевалидируем основной пароль
    if (fieldName === "password_repeat" && this.props.formState.password) {
      const passwordValidation = Validator.validate("password", this.props.formState.password, newFormState);
      newErrors.password = passwordValidation.isValid ? "" : passwordValidation.errorMessage;
      
      // Обновляем компонент основного пароля
      const passwordComponent = this.children["PasswordInput"];
      if (passwordComponent && !Array.isArray(passwordComponent)) {
        passwordComponent.setProps({
          error: passwordValidation.isValid ? "" : passwordValidation.errorMessage,
        });
      }
    }

    this.setProps({
      formState: newFormState,
      errors: newErrors
    });

    // Обновляем состояние кнопки отправки
    this.updateSubmitButton(newFormState, newErrors);
  }

  handleFieldBlur(fieldName: string, e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const validation = Validator.validate(fieldName, value, this.props.formState);
    
    // Обновляем соответствующий Input компонент
    const inputComponent = this.children[`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Input`];
    if (inputComponent && !Array.isArray(inputComponent)) {
      inputComponent.setProps({
        error: validation.isValid ? "" : validation.errorMessage,
      });
    }

    const newErrors = {
      ...this.props.errors,
      [fieldName]: validation.isValid ? "" : validation.errorMessage,
    };

    this.setProps({
      errors: newErrors
    });

    // Обновляем состояние кнопки отправки
    this.updateSubmitButton(this.props.formState, newErrors);
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
        text: 'Регистрация...',
        disabled: true,
      });
    }

    try {
      // Вызываем контроллер - валидация и навигация внутри контроллера
      const result = await AuthController.signUp({
        first_name: this.props.formState.first_name,
        second_name: this.props.formState.second_name,
        login: this.props.formState.login,
        email: this.props.formState.email,
        password: this.props.formState.password,
        phone: this.props.formState.phone,
        password_repeat: this.props.formState.password_repeat,
      });
      
      // Если валидация не прошла, показываем ошибки в UI
      if (!result.isValid && result.errors) {
        const newErrors: Record<string, string> = {};
        
        // Обновляем ошибки в компонентах
        Object.entries(result.errors).forEach(([fieldName, errorMessage]) => {
          newErrors[fieldName] = errorMessage;
          
          // Обновляем соответствующий Input компонент
          const componentName = fieldName === 'password_repeat' 
            ? 'PasswordRepeatInput' 
            : `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Input`;
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
      console.error('Registration error:', error);
      // Показываем ошибку пользователю
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      
      // Определяем, какое поле показать ошибку (login или email)
      const isLoginError = errorMessage.toLowerCase().includes('login') || 
                          errorMessage.toLowerCase().includes('логин');
      
      this.setProps({
        errors: {
          ...this.props.errors,
          [isLoginError ? 'login' : 'email']: errorMessage,
        }
      });
      
      // Показываем ошибку в соответствующем поле
      if (isLoginError) {
        const usernameInput = this.children.UsernameInput;
        if (usernameInput && !Array.isArray(usernameInput)) {
          usernameInput.setProps({
            error: errorMessage,
          });
        }
      } else {
        const emailInput = this.children.EmailInput;
        if (emailInput && !Array.isArray(emailInput)) {
          emailInput.setProps({
            error: errorMessage,
          });
        }
      }
    } finally {
      // Разблокируем кнопку отправки
      if (submitButton && !Array.isArray(submitButton)) {
        submitButton.setProps({
          text: 'Зарегистрироваться',
          disabled: false,
        });
      }
      // Сбрасываем флаг после завершения
      this.isSubmitting = false;
    }
  }

  render(): string {
    return registerTemplate;
  }
}

export { RegisterPage };

