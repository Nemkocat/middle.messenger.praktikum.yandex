import Block from "../../../core/block";
import Avatar from "../../components/Avatar";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link";
import Button from "../../components/Button";
import { Validator } from "../../../utils/validation";
import AuthController from "../../../controllers/AuthController";
import UserAPI from "../../../services/UserAPI";
import { Router } from "../../../core/router";
import editProfileTemplate from "./editProfile.hbs?raw";

export default class EditProfilePage extends Block {
  constructor(props: object = {}) {
    const user = AuthController.getUser();
    super("div", {
      ...props,
      formState: {
        email: user?.email || "",
        login: user?.login || "",
        first_name: user?.first_name || "",
        second_name: user?.second_name || "",
        display_name: user?.display_name || user?.first_name || "",
        phone: user?.phone || "",
      },
      errors: {
        email: "",
        login: "",
        first_name: "",
        second_name: "",
        display_name: "",
        phone: "",
      },
      AvatarComponent: new Avatar({
        class: "profile__avatar",
        name: "avatar",
        img: user?.avatar 
          ? `https://ya-praktikum.tech/api/v2/resources${user.avatar}` 
          : "/images/default-avatar.png",
        imgClass: "profile__avatar_img",
        imgAlt: "Аватар",
        isLoading: false,
        onChange: async (e: Event) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          
          if (!file) {
            return;
          }
          
          // Показываем индикатор загрузки
              const avatarComponent = this.children.AvatarComponent;
              if (avatarComponent && !Array.isArray(avatarComponent)) {
                avatarComponent.setProps({
              isLoading: true,
            });
          }
          
          try {
            const updatedUser = await UserAPI.updateAvatar(file);
            
            // Обновляем аватар в компоненте
            if (avatarComponent && !Array.isArray(avatarComponent)) {
              const newAvatarUrl = updatedUser.avatar 
                    ? `https://ya-praktikum.tech/api/v2/resources${updatedUser.avatar}` 
                : "/images/default-avatar.png";
              
              avatarComponent.setProps({
                img: newAvatarUrl,
                isLoading: false,
                });
              }
            
              // Обновляем пользователя в AuthController
              await AuthController.checkAuth();
              
            // Обновляем список чатов, если ChatController доступен
            // Это нужно для отображения нового аватара в списке чатов
            const { ChatController } = await import('../../../controllers/ChatController');
            const chatController = ChatController.getInstance();
            if (chatController) {
              await chatController.loadChats();
            }
            } catch (error) {
            console.error('[EditProfilePage] Avatar update error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Ошибка обновления аватара';
            
            // Скрываем индикатор загрузки
            if (avatarComponent && !Array.isArray(avatarComponent)) {
              avatarComponent.setProps({
                isLoading: false,
              });
            }
            
            // Показываем ошибку пользователю
              window.alert(errorMessage);
            } finally {
              // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
              target.value = '';
          }
        },
      }),
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
        id: "edit-profile-btn",
        text: "Сохранить",
        type: "button",
        disabled: false, // Явно устанавливаем disabled: false
        onClick: (e: Event) => {
          this.handleSubmit(e);
        },
      }),
      EmailItem: new ProfileDataItem({
        title: "Почта",
        value: user?.email || "",
        name: "email",
        type: "email",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("email", e),
        onBlur: (e: Event) => this.handleFieldBlur("email", e),
      }),
      LoginItem: new ProfileDataItem({
        title: "Логин",
        value: user?.login || "",
        name: "login",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("login", e),
        onBlur: (e: Event) => this.handleFieldBlur("login", e),
      }),
      NameItem: new ProfileDataItem({
        title: "Имя",
        value: user?.first_name || "",
        name: "first_name",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("first_name", e),
        onBlur: (e: Event) => this.handleFieldBlur("first_name", e),
      }),
      SurnameItem: new ProfileDataItem({
        title: "Фамилия",
        value: user?.second_name || "",
        name: "second_name",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("second_name", e),
        onBlur: (e: Event) => this.handleFieldBlur("second_name", e),
      }),
      DisplayNameItem: new ProfileDataItem({
        title: "Имя в чате",
        value: user?.display_name || user?.first_name || "",
        name: "display_name",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("display_name", e),
        onBlur: (e: Event) => this.handleFieldBlur("display_name", e),
      }),
      PhoneItem: new ProfileDataItem({
        title: "Телефон",
        value: user?.phone || "",
        name: "phone",
        type: "tel",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("phone", e),
        onBlur: (e: Event) => this.handleFieldBlur("phone", e),
      }),
      events: {
        submit: (e: Event) => {
          this.handleSubmit(e);
        },
      },
    });
  }

  handleFieldChange(fieldName: string, e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const validation = Validator.validate(fieldName, value, this.props.formState);
    
    // Обновляем соответствующий ProfileDataItem компонент
    const componentName = fieldName === "display_name" ? "DisplayNameItem" : `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Item`;
    const itemComponent = this.children[componentName];
    if (itemComponent && !Array.isArray(itemComponent)) {
      itemComponent.setProps({
        value,
        error: validation.isValid ? "" : validation.errorMessage,
      });
    }

    this.setProps({
      formState: {
        ...this.props.formState,
        [fieldName]: value
      },
      errors: {
        ...this.props.errors,
        [fieldName]: validation.isValid ? "" : validation.errorMessage,
      }
    });
  }

  handleFieldBlur(fieldName: string, e: Event) {
    const target = e.target as HTMLInputElement;
    const value = target.value;
    const validation = Validator.validate(fieldName, value, this.props.formState);
    
    // Обновляем соответствующий ProfileDataItem компонент
    const componentName = fieldName === "display_name" ? "DisplayNameItem" : `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Item`;
    const itemComponent = this.children[componentName];
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

  async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();
    e.stopPropagation();
    
    // Валидация всех полей при submit
    const fields = ['email', 'login', 'first_name', 'second_name', 'display_name', 'phone'];
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    fields.forEach(fieldName => {
      const value = this.props.formState[fieldName];
      const validation = Validator.validate(fieldName, value, this.props.formState);
      
      if (!validation.isValid) {
        hasErrors = true;
        newErrors[fieldName] = validation.errorMessage;
        
        // Обновляем соответствующий ProfileDataItem компонент
        const componentName = fieldName === "display_name" ? "DisplayNameItem" : `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Item`;
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
    const updateData = {
      first_name: this.props.formState.first_name,
      second_name: this.props.formState.second_name,
      display_name: this.props.formState.display_name,
      login: this.props.formState.login,
      email: this.props.formState.email,
      phone: this.props.formState.phone,
    };
    
    try {
      await UserAPI.updateProfile(updateData);
      
      // Обновляем данные пользователя в AuthController
      await AuthController.checkAuth();
      
      // Перенаправляем на страницу профиля
      const router = Router.getInstance();
      if (router) {
        router.go('/settings');
      }
    } catch (error) {
      console.error('[EditProfilePage] Profile update error:', error);
      let errorMessage = error instanceof Error ? error.message : 'Ошибка обновления профиля';
      
      // Пытаемся определить, какое поле вызвало ошибку
      let errorField = 'email'; // По умолчанию показываем ошибку на email
      const errorLower = errorMessage.toLowerCase();
      
      if (errorLower.includes('логин') || errorLower.includes('login') || 
          errorLower.includes('username')) {
        errorField = 'login';
      } else if (errorLower.includes('телефон') || errorLower.includes('phone')) {
        errorField = 'phone';
      } else if (errorLower.includes('email') || errorLower.includes('почт')) {
        errorField = 'email';
      } else if (errorLower.includes('user already') || 
                 errorLower.includes('уже существует') ||
                 errorLower.includes('already in system')) {
        // Если ошибка "User already in system", проверяем, какие поля изменились
        // и показываем ошибку на том поле, которое могло вызвать конфликт
        const originalUser = AuthController.getUser();
        if (originalUser) {
          const loginChanged = this.props.formState.login !== originalUser.login;
          const emailChanged = this.props.formState.email !== originalUser.email;
          
          // Если оба изменились, показываем на email (более вероятный конфликт)
          if (loginChanged && emailChanged) {
            errorField = 'email';
          } 
          // Если изменился только логин
          else if (loginChanged) {
            errorField = 'login';
          } 
          // Если изменился только email
          else if (emailChanged) {
            errorField = 'email';
          }
          // Если ничего не изменилось, но ошибка есть - возможно, данные уже заняты другим пользователем
          // Показываем на email по умолчанию
        }
        // Улучшаем сообщение об ошибке
        errorMessage = 'Пользователь с таким логином или email уже существует. Пожалуйста, используйте другие значения.';
      }
      
      this.setProps({
        errors: {
          ...this.props.errors,
          [errorField]: errorMessage,
        }
      });
      
      // Обновляем соответствующий компонент
      const componentName = errorField === "display_name" ? "DisplayNameItem" : `${errorField.charAt(0).toUpperCase() + errorField.slice(1)}Item`;
      const itemComponent = this.children[componentName];
      if (itemComponent && !Array.isArray(itemComponent)) {
        itemComponent.setProps({
          error: errorMessage,
        });
      }
    }
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
    return editProfileTemplate;
  }
}

export { EditProfilePage };

