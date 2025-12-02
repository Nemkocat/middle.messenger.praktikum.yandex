import Block from "../../../core/block";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link";
import Button from "../../components/Button";
import { Validator } from "../../../utils/validation";
import UserAPI from "../../../services/UserAPI";
import { Router } from "../../../core/router";
import editPasswordTemplate from "./editPassword.hbs?raw";

interface EditPasswordFormState {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface EditPasswordErrors {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default class EditPasswordPage extends Block {
  constructor(tagName?: string, props?: Record<string, unknown>) {
    super(tagName || "div", {
      ...(props || {}),
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
        img: "/images/arrow.png",
        imgClass: "pointer",
        imgAlt: "←"
      }),
      SaveButton: new Button({
        class: "profile-data__submit-btn",
        id: "edit-password-btn",
        text: "Сохранить",
        type: "button",
        disabled: false,
        onClick: (e: Event) => {
          this.handleSubmit(e);
        },
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
    const currentFormState = (this.props.formState || {
      oldPassword: "", newPassword: "", confirmPassword: ""
    }) as EditPasswordFormState;
    const validation = Validator.validate(fieldName, value, currentFormState as unknown as Record<string, string>);
    
    // Обновляем соответствующий ProfileDataItem компонент
    const componentName = this.getComponentName(fieldName);
    const itemComponent = this.children[componentName];
    if (itemComponent && !Array.isArray(itemComponent)) {
      itemComponent.setProps({
        value,
        error: validation.isValid ? "" : validation.errorMessage,
      });
    }

    // Обновляем состояние формы
    const newFormState = {
      ...currentFormState,
      [fieldName]: value
    } as EditPasswordFormState;

    const currentErrors = (this.props.errors || {
      oldPassword: "", newPassword: "", confirmPassword: ""
    }) as EditPasswordErrors;
    const newErrors = {
      ...currentErrors,
      [fieldName]: validation.isValid ? "" : validation.errorMessage,
    } as EditPasswordErrors;

    // Если изменился новый пароль, перевалидируем подтверждение пароля
    if (fieldName === "newPassword" && currentFormState.confirmPassword) {
      const confirmPasswordValidation = Validator.validate("confirmPassword", currentFormState.confirmPassword, newFormState as unknown as Record<string, string>);
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
    if (fieldName === "confirmPassword" && currentFormState.newPassword) {
      const newPasswordValidation = Validator.validate("newPassword", currentFormState.newPassword, newFormState as unknown as Record<string, string>);
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
    const currentFormState = (this.props.formState || {
      oldPassword: "", newPassword: "", confirmPassword: ""
    }) as EditPasswordFormState;
    const validation = Validator.validate(fieldName, value, currentFormState as unknown as Record<string, string>);
    
    // Обновляем соответствующий ProfileDataItem компонент
    const componentName = this.getComponentName(fieldName);
    const itemComponent = this.children[componentName];
    if (itemComponent && !Array.isArray(itemComponent)) {
      itemComponent.setProps({
        error: validation.isValid ? "" : validation.errorMessage,
      });
    }

    const currentErrors = (this.props.errors || {
      oldPassword: "", newPassword: "", confirmPassword: ""
    }) as EditPasswordErrors;

    this.setProps({
      errors: {
        ...currentErrors,
        [fieldName]: validation.isValid ? "" : validation.errorMessage,
      } as EditPasswordErrors
    });
  }

  async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    
    // Валидация всех полей при submit
    const formState = (this.props.formState || {
      oldPassword: "", newPassword: "", confirmPassword: ""
    }) as EditPasswordFormState;
    const fields = ['oldPassword', 'newPassword', 'confirmPassword'];
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    fields.forEach(fieldName => {
      const value = formState[fieldName as keyof EditPasswordFormState];
      const validation = Validator.validate(fieldName, value, formState as unknown as Record<string, string>);
      
      if (!validation.isValid) {
        hasErrors = true;
        newErrors[fieldName] = validation.errorMessage;
        
        // Обновляем соответствующий ProfileDataItem компонент
        const componentName = this.getComponentName(fieldName);
        const itemComponent = this.children[componentName];
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
      return;
    }

    // Если валидация прошла успешно
    const currentFormState = (this.props.formState || {
      oldPassword: "", newPassword: "", confirmPassword: ""
    }) as EditPasswordFormState;
    try {
      await UserAPI.updatePassword({
        oldPassword: currentFormState.oldPassword,
        newPassword: currentFormState.newPassword,
      });
      
      // Перенаправляем на страницу профиля
      const router = Router.getInstance();
      if (router) {
        router.go('/settings');
      }
    } catch (error) {
      console.error('[EditPasswordPage] Password update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления пароля';
      
      // Определяем, какое поле вызвало ошибку
      let errorField = 'oldPassword'; // По умолчанию показываем ошибку на старом пароле
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('новый') || errorLower.includes('new') || 
          errorLower.includes('newpassword')) {
        errorField = 'newPassword';
      } else if (errorLower.includes('старый') || errorLower.includes('old') ||
                 errorLower.includes('oldpassword') || errorLower.includes('неверный')) {
        errorField = 'oldPassword';
      }
      
      const currentErrors = (this.props.errors || {
        oldPassword: "", newPassword: "", confirmPassword: ""
      }) as EditPasswordErrors;
      
      this.setProps({
        errors: {
          ...currentErrors,
          [errorField]: errorMessage,
        } as EditPasswordErrors
      });
      
      // Обновляем соответствующий компонент
      const componentName = this.getComponentName(errorField);
      const itemComponent = this.children[componentName];
      if (itemComponent && !Array.isArray(itemComponent)) {
        itemComponent.setProps({
          error: errorMessage,
        });
      }
    }
  }

  // Вспомогательный метод для получения имени компонента
  private getComponentName(fieldName: string): string {
    const nameMap: Record<string, string> = {
      oldPassword: 'OldPasswordItem',
      newPassword: 'NewPasswordItem',
      confirmPassword: 'ConfirmPasswordItem',
    };
    return nameMap[fieldName] || `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Item`;
  }

  componentDidMount() {
    // Привязываем событие submit к форме напрямую
    const form = this._element?.querySelector('form.profile-data') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', (e: Event) => {
        this.handleSubmit(e);
      });
    }
  }

  render(): string {
    return editPasswordTemplate;
  }
}

export { EditPasswordPage };

