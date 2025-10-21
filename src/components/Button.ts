import Block from "../core/block";

interface ButtonProps {
  id?: string;
  class?: string;
  text: string;
  onClick?: (e: Event) => void;
}

export default class Button extends Block {
  constructor(props: ButtonProps) {
    super("button", {
      ...props,
      attrs: {
        class: props.class ,
        id: props.id || "",
      },
      events: {
        click: props.onClick,
      },
    });
  }

  render(): string {
    return `{{text}}`;
  }
}

