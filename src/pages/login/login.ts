import Block from "../../core/block";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
import { Validator } from "../../utils/validation";
import loginTemplate from "./login.hbs?raw";

interface LoginPageProps {
  onSubmit?: (e: Event) => void;
  onLoginChange?: (e: Event) => void;
  onPasswordChange?: (e: Event) => void;
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

          this.setProps({
            formState: {
              ...this.props.formState,
              login: value
            },
            errors: {
              ...this.props.errors,
              login: validation.isValid ? "" : validation.errorMessage,
            }
          });
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

          this.setProps({
            errors: {
              ...this.props.errors,
              login: validation.isValid ? "" : validation.errorMessage,
            }
          });
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

          this.setProps({
            formState: {
              ...this.props.formState,
              password: value
            },
            errors: {
              ...this.props.errors,
              password: validation.isValid ? "" : validation.errorMessage,
            }
          });
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

          this.setProps({
            errors: {
              ...this.props.errors,
              password: validation.isValid ? "" : validation.errorMessage,
            }
          });
        },
      }),
      SubmitButton: new Button({
        id: "submit-btn",
        class: "auth-form__btn login-btn",
        text: "Авторизироваться",
        onClick: (e: Event) => this.handleSubmit(e),
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

  handleSubmit(e: Event) {
    e.preventDefault();
    
    // Валидация всех полей при submit
    const loginValidation = Validator.validate("login", this.props.formState.login);
    const passwordValidation = Validator.validate("password", this.props.formState.password);
    
    // Обновляем ошибки
    const loginInput = this.children.LoginInput;
    if (loginInput && !Array.isArray(loginInput)) {
      loginInput.setProps({
        error: loginValidation.isValid ? "" : loginValidation.errorMessage,
      });
    }
    
    const passwordInput = this.children.PasswordInput;
    if (passwordInput && !Array.isArray(passwordInput)) {
      passwordInput.setProps({
        error: passwordValidation.isValid ? "" : passwordValidation.errorMessage,
      });
    }

    this.setProps({
      errors: {
        login: loginValidation.isValid ? "" : loginValidation.errorMessage,
        password: passwordValidation.isValid ? "" : passwordValidation.errorMessage,
      }
    });

    // Если есть ошибки, не отправляем форму
    if (!loginValidation.isValid || !passwordValidation.isValid) {
      console.log("Form has validation errors");
      return;
    }

    // Если валидация прошла успешно
    console.log("Form Data:", this.props.formState);
  }

  render(): string {
    return loginTemplate;
  }
}

export { LoginPage };

