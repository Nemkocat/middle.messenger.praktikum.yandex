import Block from "../../../core/block";
import Avatar from "../../components/Avatar";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link";
import AuthController from "../../../controllers/AuthController";
import { RESOURCES_BASE_URL } from "../../../config";
import profileTemplate from "./profile.hbs?raw";

export default class ProfilePage extends Block {
  constructor(props: object = {}) {
    const user = AuthController.getUser();
    const avatarUrl = user?.avatar 
      ? `${RESOURCES_BASE_URL}${user.avatar}` 
      : "/images/default-avatar.png";
    
    super("div", {
      user: user,
      ...props,
      AvatarComponent: new Avatar({
        class: "profile-data__avatar",
        name: "avatar",
        img: avatarUrl,
        imgClass: "profile__avatar_img",
        imgAlt: "Аватар",
      }),
      BackLink: new Link({
        href: "",
        class: "link-back",
        page: "main",
        text: "",
        img: "/images/arrow.png",
        imgClass: "pointer",
        imgAlt: "←"
      }),
      EditProfileLink: new Link({
        href: "#",
        class: "profile-data__settings_edit-data pointer",
        page: "editProfile",
        text: "Изменить данные",
      }),
      EditPasswordLink: new Link({
        href: "#",
        class: "profile-data__settings_edit-password pointer",
        page: "editPassword",
        text: "Изменить пароль",
      }),
      LogoutButton: new Link({
        href: "#",
        class: "profile-data__settings_exit pointer",
        page: "login",
        text: "Выйти",
        onClick: async () => {
          try {
            await AuthController.logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      }),
      EmailItem: new ProfileDataItem({
        title: "Почта",
        value: user?.email || "",
        name: "email",
        type: "email",
        editable: false,
      }),
      LoginItem: new ProfileDataItem({
        title: "Логин",
        value: user?.login || "",
        name: "login",
        type: "text",
        editable: false,
      }),
      NameItem: new ProfileDataItem({
        title: "Имя",
        value: user?.first_name || "",
        name: "first_name",
        type: "text",
        editable: false,
      }),
      SurnameItem: new ProfileDataItem({
        title: "Фамилия",
        value: user?.second_name || "",
        name: "second_name",
        type: "text",
        editable: false,
      }),
      DisplayNameItem: new ProfileDataItem({
        title: "Имя в чате",
        value: user?.display_name || user?.first_name || "",
        name: "display_name",
        type: "text",
        editable: false,
      }),
      PhoneItem: new ProfileDataItem({
        title: "Телефон",
        value: user?.phone || "",
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

