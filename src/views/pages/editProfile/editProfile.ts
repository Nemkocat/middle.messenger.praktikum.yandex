import Block from "../../../core/block";
import Avatar from "../../components/Avatar";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link";
import Button from "../../components/Button";
import { Validator } from "../../../utils/validation";
import editProfileTemplate from "./editProfile.hbs?raw";

export default class EditProfilePage extends Block {
  constructor(props: object = {}) {
    super("div", {
      ...props,
      formState: {
        email: "pochta@yandex.ru",
        login: "ivanivanov",
        first_name: "Иван",
        second_name: "Иванов",
        nickname: "Иван",
        phone: "+7 (909) 123 45 67",
      },
      errors: {
        email: "",
        login: "",
        first_name: "",
        second_name: "",
        nickname: "",
        phone: "",
      },
      AvatarComponent: new Avatar({
        class: "profile__avatar",
        name: "avatar",
        img: "/images/default-avatar.png",
        imgClass: "profile__avatar_img",
        imgAlt: "Аватар",
      }),
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
        id: "edit-profile-btn",
        text: "Сохранить",
        onClick: (e: Event) => this.handleSubmit(e),
      }),
      EmailItem: new ProfileDataItem({
        title: "Почта",
        value: "pochta@yandex.ru",
        name: "email",
        type: "email",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("email", e),
        onBlur: (e: Event) => this.handleFieldBlur("email", e),
      }),
      LoginItem: new ProfileDataItem({
        title: "Логин",
        value: "ivanivanov",
        name: "login",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("login", e),
        onBlur: (e: Event) => this.handleFieldBlur("login", e),
      }),
      NameItem: new ProfileDataItem({
        title: "Имя",
        value: "Иван",
        name: "first_name",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("first_name", e),
        onBlur: (e: Event) => this.handleFieldBlur("first_name", e),
      }),
      SurnameItem: new ProfileDataItem({
        title: "Фамилия",
        value: "Иванов",
        name: "second_name",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("second_name", e),
        onBlur: (e: Event) => this.handleFieldBlur("second_name", e),
      }),
      NicknameItem: new ProfileDataItem({
        title: "Имя в чате",
        value: "Иван",
        name: "nickname",
        type: "text",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("nickname", e),
        onBlur: (e: Event) => this.handleFieldBlur("nickname", e),
      }),
      PhoneItem: new ProfileDataItem({
        title: "Телефон",
        value: "+7 (909) 123 45 67",
        name: "phone",
        type: "tel",
        editable: true,
        error: "",
        onChange: (e: Event) => this.handleFieldChange("phone", e),
        onBlur: (e: Event) => this.handleFieldBlur("phone", e),
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
    const fields = ['email', 'login', 'first_name', 'second_name', 'phone'];
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
    console.log("Profile updated:", this.props.formState);
  }

  render(): string {
    return editProfileTemplate;
  }
}

export { EditProfilePage };

