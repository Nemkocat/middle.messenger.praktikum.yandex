import Block from "../../core/block";

interface LinkProps {
  href?: string;
  class?: string;
  page?: string;
  text: string;
  img?: string;
  imgClass?: string;
  imgAlt?: string;
  onClick?: (e: Event) => void;
}

export default class Link extends Block {
  constructor(props: LinkProps) {
    super("a", {
      ...props,
      attrs: {
        href: props.href || "#",
        class: props.class ,
        "data-page": props.page || "",
        img: props.img || "",
        imgClass: props.imgClass || "",
        imgAlt: props.imgAlt || "img"
      },
      events: {
        click: props.onClick,
      },
    });
  }

  render(): string {
    return `
      {{text}}
      {{#if img}}<img src="{{img}}" class="{{imgClass}}" alt="{{imgAlt}}">{{/if}}
    `;
  }
}

