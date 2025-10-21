import Block from "../../core/block";
import Link from "../../components/Link";
import error500Template from "./500.hbs?raw";

export default class Error500Page extends Block {
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
    return error500Template;
  }
}

export { Error500Page };

