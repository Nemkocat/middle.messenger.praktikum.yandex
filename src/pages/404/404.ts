import Block from "../../core/block";
import Link from "../../components/Link";
import error404Template from "./404.hbs?raw";

export default class Error404Page extends Block {
  constructor(props: any = {}) {
    super("div", {
      ...props,
      className: "container",
      BackLink: new Link({
        href: "#",
        class: "error-page__link",
        page: "main",
        text: "Назад к чатам",
      }),
    });
  }

  render(): string {
    return error404Template;
  }
}

export { Error404Page };