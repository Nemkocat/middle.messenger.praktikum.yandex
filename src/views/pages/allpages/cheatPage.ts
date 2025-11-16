import Block from "../../../core/block";
import Link from "../../components/Link";
import cheatPageTemplate from "./cheatPage.hbs?raw";

export default class CheatPage extends Block {
  constructor(props: object = {}) {
    super("div", {
      ...props,
      className: "container",
      LoginLink: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "login",
        text: "Войти",
      }),
      RegisterLink: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "register",
        text: "Регистрация",
      }),
      MainLink: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "main",
        text: "Главная",
      }),
      ProfileLink: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "profile",
        text: "Профиль",
      }),
      EditProfileLink: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "editProfile",
        text: "Редактировать профиль",
      }),
      EditPasswordLink: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "editPassword",
        text: "Изменить пароль",
      }),
      Error404Link: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "error404",
        text: "404",
      }),
      Error500Link: new Link({
        href: "#",
        class: "cheatpages-list__page_link",
        page: "error500",
        text: "500",
      }),
    });
  }

  render(): string {
    return cheatPageTemplate;
  }
}

export { default as CheatPage } from "./cheatPage";

