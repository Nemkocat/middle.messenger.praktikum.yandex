import Block from "../../core/block";
import ProfileDataItem from "../../components/ProfileDataItem";
import Link from "../../components/Link";
import Button from "../../components/Button";
import editPasswordTemplate from "./editPassword.hbs?raw";

export default class EditPasswordPage extends Block {
  constructor(props: any = {}) {
    super("div", {
      ...props,
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
      }),
      OldPasswordItem: new ProfileDataItem({
        title: "Старый пароль",
        value: "",
        name: "oldPassword",
        type: "password",
        editable: true,
      }),
      NewPasswordItem: new ProfileDataItem({
        title: "Новый пароль",
        value: "",
        name: "newPassword",
        type: "password",
        editable: true,
      }),
      ConfirmPasswordItem: new ProfileDataItem({
        title: "Повторите новый пароль",
        value: "",
        name: "confirmPassword",
        type: "password",
        editable: true,
      }),
    });
  }

  render(): string {
    return editPasswordTemplate;
  }
}

export { EditPasswordPage };

