import Block from "../../../core/block";
import Avatar from "../../components/Avatar";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link"; 
import profileTemplate from "./profile.hbs?raw";

export default class ProfilePage extends Block {
  constructor(props: object = {}) {
    super("div", {
      ...props,
      AvatarComponent: new Avatar({
        class: "profile-data__avatar",
        name: "avatar",
        img: "/images/default-avatar.png",
        imgClass: "profile__avatar_img",
        imgAlt: "Аватар",
      }),
      BackLink: new Link({
        href: "",
        class: "link-back",
        page: "main",
        text: "",
        img: "./images/arrow.png",
        imgClass: "",
        imgAlt: "←"
      }),
      EditProfileLink: new Link({
        href: "#",
        class: "profile-data__settings_edit-data",
        page: "editProfile",
        text: "Изменить данные",
      }),
      EditPasswordLink: new Link({
        href: "#",
        class: "profile-data__settings_edit-password",
        page: "editPassword",
        text: "Изменить пароль",
      }),
      LogoutButton: new Link({
        href: "#",
        class: "profile-data__settings_exit",
        page: "login",
        text: "Выйти",
      }),
      EmailItem: new ProfileDataItem({
        title: "Почта",
        value: "pochta@yandex.ru",
        name: "email",
        type: "email",
        editable: false,
      }),
      LoginItem: new ProfileDataItem({
        title: "Логин",
        value: "ivanivanov",
        name: "login",
        type: "text",
        editable: false,
      }),
      NameItem: new ProfileDataItem({
        title: "Имя",
        value: "Иван",
        name: "first_name",
        type: "text",
        editable: false,
      }),
      SurnameItem: new ProfileDataItem({
        title: "Фамилия",
        value: "Иванов",
        name: "second_name",
        type: "text",
        editable: false,
      }),
      DisplayNameItem: new ProfileDataItem({
        title: "Имя в чате",
        value: "Иван",
        name: "display_name",
        type: "text",
        editable: false,
      }),
      PhoneItem: new ProfileDataItem({
        title: "Телефон",
        value: "+7 (909) 123 45 67",
        name: "phone",
        type: "tel",
        editable: false,
      }),
    });
  }

  render(): string {
    return profileTemplate;
  }
}

export { ProfilePage };

