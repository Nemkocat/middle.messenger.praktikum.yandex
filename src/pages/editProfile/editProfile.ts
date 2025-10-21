import Block from "../../core/block";
import Avatar from "../../components/Avatar";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link";
import Button from "../../components/Button";
import editProfileTemplate from "./editProfile.hbs?raw";

export default class EditProfilePage extends Block {
  constructor(props: any = {}) {
    super("div", {
      ...props,
      Avatar: new Avatar({
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
      }),
      EmailItem: new ProfileDataItem({
        title: "Почта",
        value: "pochta@yandex.ru",
        name: "email",
        type: "email",
        editable: true,
      }),
      LoginItem: new ProfileDataItem({
        title: "Логин",
        value: "ivanivanov",
        name: "login",
        type: "text",
        editable: true,
      }),
      NameItem: new ProfileDataItem({
        title: "Имя",
        value: "Иван",
        name: "first_name",
        type: "text",
        editable: true,
      }),
      SurnameItem: new ProfileDataItem({
        title: "Фамилия",
        value: "Иванов",
        name: "second_name",
        type: "text",
        editable: true,
      }),
      NicknameItem: new ProfileDataItem({
        title: "Имя в чате",
        value: "Иван",
        name: "nickname",
        type: "text",
        editable: true,
      }),
      PhoneItem: new ProfileDataItem({
        title: "Телефон",
        value: "+7 (909) 123 45 67",
        name: "phone",
        type: "tel",
        editable: true,
      }),
    });
  }

  render(): string {
    return editProfileTemplate;
  }
}

export { EditProfilePage };

