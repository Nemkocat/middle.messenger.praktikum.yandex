import Block from "../../core/block";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
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
      className: "container",
      LoginInput: new Input({
        id: "login-username",
        class: "auth-form__input",
        type: "text",
        placeholder: "Логин",
        name: "login",
        onChange: props.onLoginChange,
      }),
      PasswordInput: new Input({
        id: "login-password",
        class: "auth-form__input",
        type: "password",
        placeholder: "Пароль",
        name: "password",
        onChange: props.onPasswordChange,
      }),
      SubmitButton: new Button({
        id: "submit-btn",
        class: "auth-form__btn login-btn",
        text: "Авторизироваться",
        onClick: props.onSubmit,
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

  // Реализация отправки формы в консоль

  handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData: Record<string, string> = {};

    for (const element of form.elements) {
      if (element instanceof HTMLInputElement && element.name) {
        formData[element.name] = element.value;
      }
    }

    console.log("Form Data:", formData);
  }

  render(): string {
    return loginTemplate;
  }
}

export { LoginPage };

