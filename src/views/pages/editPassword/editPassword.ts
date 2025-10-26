import Block from "../../../core/block";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link";
import Button from "../../components/Button";
import { Validator } from "../../../utils/validation";
import editPasswordTemplate from "./editPassword.hbs?raw";

export default class EditPasswordPage extends Block {
  constructor(props: object = {}) {
    super("div", {
      ...props,
      formState: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      errors: {
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      BackLink: new Link({
        href: "#",
        class: "link-back",
        page: "profile",
        text: "",
        img: "./images/arrow.png",
        imgClass: "",
        imgAlt: "←"
      }),
      SaveButton: new Button({
        class: "profile-data__submit-btn",
        id: "edit-password-btn",
        text: "Сохранить",
        onClick: (e: Event) => this.handleSubmit(e),
      }),
      OldPasswordItem: new ProfileDataItem({
        title: "Старый пароль",
        value: "",
        name: "oldPassword",
        type: "password",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("oldPassword", e),
        onBlur: (e: Event) => this.handleFieldBlur("oldPassword", e),
      }),
      NewPasswordItem: new ProfileDataItem({
        title: "Новый пароль",
        value: "",
        name: "newPassword",
        type: "password",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("newPassword", e),
        onBlur: (e: Event) => this.handleFieldBlur("newPassword", e),
      }),
      ConfirmPasswordItem: new ProfileDataItem({
        title: "Повторите новый пароль",
        value: "",
        name: "confirmPassword",
        type: "password",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("confirmPassword", e),
        onBlur: (e: Event) => this.handleFieldBlur("confirmPassword", e),
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
    
    // Обновляем соответствующий ProfileDataItem компонент
    const itemComponent = this.children[`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Item`];
    if (itemComponent && !Array.isArray(itemComponent)) {
      itemComponent.setProps({
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

    // Если изменился новый пароль, перевалидируем подтверждение пароля
    if (fieldName === "newPassword" && this.props.formState.confirmPassword) {
      const confirmPasswordValidation = Validator.validate("confirmPassword", this.props.formState.confirmPassword, newFormState);
      newErrors.confirmPassword = confirmPasswordValidation.isValid ? "" : confirmPasswordValidation.errorMessage;
      
      // Обновляем компонент подтверждения пароля
      const confirmPasswordComponent = this.children["ConfirmPasswordItem"];
      if (confirmPasswordComponent && !Array.isArray(confirmPasswordComponent)) {
        confirmPasswordComponent.setProps({
          error: confirmPasswordValidation.isValid ? "" : confirmPasswordValidation.errorMessage,
        });
      }
    }

    // Если изменилось подтверждение пароля, перевалидируем новый пароль
    if (fieldName === "confirmPassword" && this.props.formState.newPassword) {
      const newPasswordValidation = Validator.validate("newPassword", this.props.formState.newPassword, newFormState);
      newErrors.newPassword = newPasswordValidation.isValid ? "" : newPasswordValidation.errorMessage;
      
      // Обновляем компонент нового пароля
      const newPasswordComponent = this.children["NewPasswordItem"];
      if (newPasswordComponent && !Array.isArray(newPasswordComponent)) {
        newPasswordComponent.setProps({
          error: newPasswordValidation.isValid ? "" : newPasswordValidation.errorMessage,
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
    
    // Обновляем соответствующий ProfileDataItem компонент
    const itemComponent = this.children[`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Item`];
    if (itemComponent && !Array.isArray(itemComponent)) {
      itemComponent.setProps({
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
    const fields = ['oldPassword', 'newPassword', 'confirmPassword'];
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    fields.forEach(fieldName => {
      const value = this.props.formState[fieldName];
      const validation = Validator.validate(fieldName, value, this.props.formState);
      
      if (!validation.isValid) {
        hasErrors = true;
        newErrors[fieldName] = validation.errorMessage;
        
        // Обновляем соответствующий ProfileDataItem компонент
        const itemComponent = this.children[`${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Item`];
        if (itemComponent && !Array.isArray(itemComponent)) {
          itemComponent.setProps({
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
    console.log("Password updated:", this.props.formState);
  }

  render(): string {
    return editPasswordTemplate;
  }
}

export { EditPasswordPage };

