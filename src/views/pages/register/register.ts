import Block from "../../../core/block";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Link from "../../components/Link";
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
        onClick: (e: Event) => this.handleSubmit(e),
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

    this.setProps({
      errors: {
        ...this.props.errors,
        [fieldName]: validation.isValid ? "" : validation.errorMessage,
      }
    });
  }

  handleSubmit(e: Event) {
    e.preventDefault();
    
    // Валидация всех полей при submit
    const fields = ['email', 'login', 'first_name', 'second_name', 'phone', 'password', 'password_repeat'];
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    fields.forEach(fieldName => {
      const value = this.props.formState[fieldName];
      const validation = Validator.validate(fieldName, value, this.props.formState);
      
      if (!validation.isValid) {
        hasErrors = true;
        newErrors[fieldName] = validation.errorMessage;
        
        // Обновляем соответствующий Input компонент
        const inputComponent = this.children[`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Input`];
        if (inputComponent && !Array.isArray(inputComponent)) {
          inputComponent.setProps({
            error: validation.errorMessage,
          });
        }
      } else {
        newErrors[fieldName] = "";
      }
    });

    this.setProps({
      errors: newErrors
    });

    // Если есть ошибки, не отправляем форму
    if (hasErrors) {
      console.log("Form has validation errors");
      return;
    }

    // Если валидация прошла успешно
    console.log("Form Data:", this.props.formState);
  }

  render(): string {
    return registerTemplate;
  }
}

export { RegisterPage };

