import Block from "../../core/block";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
import registerTemplate from "./register.hbs?raw";

interface RegisterPageProps {
  onSubmit?: (e: Event) => void;
  onFieldChange?: (field: string, e: Event) => void;
}

export default class RegisterPage extends Block {
  constructor(props: RegisterPageProps) {
    super("div", {
      ...props,
      className: "container",
      EmailInput: new Input({
        id: "register-email",
        class: "auth-form__input",
        type: "email",
        placeholder: "Почта",
        name: "email",
      }),
      UsernameInput: new Input({
        id: "register-username",
        class: "auth-form__input",
        type: "text",
        placeholder: "Логин",
        name: "login",
      }),
      NameInput: new Input({
        id: "register-name",
        class: "auth-form__input",
        type: "text",
        placeholder: "Имя",
        name: "first_name",
      }),
      SurnameInput: new Input({
        id: "register-surname",
        class: "auth-form__input",
        type: "text",
        placeholder: "Фамилия",
        name: "second_name",

      }),
      PhoneInput: new Input({
        id: "register-tel",
        class: "auth-form__input",
        type: "tel",
        placeholder: "Телефон",
        name: "phone",
      }),
      PasswordInput: new Input({
        id: "login-password",
        class: "auth-form__input",
        type: "password",
        placeholder: "Пароль",
        name: "password",
      }),
      PasswordRepeatInput: new Input({
        id: "login-password-repeat",
        class: "auth-form__input",
        type: "password",
        placeholder: "Пароль (ещё раз)",
        name: "password_repeat",
      }),
      SubmitButton: new Button({
        id: "submit-btn",
        class: "auth-form__btn register-btn",
        text: "Зарегистрироваться",
        onClick: props.onSubmit,
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
    return registerTemplate;
  }
}

export { RegisterPage };

