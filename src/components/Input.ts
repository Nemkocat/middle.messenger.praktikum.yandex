import Block from "../core/block";

interface InputProps {
  id?: string;
  type?: string;
  class?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  onChange?: (e: Event) => void;
  onBlur?: (e: Event) => void;
}

export default class Input extends Block {
  constructor(props: InputProps) {
    super("input", {
      ...props,
      attrs: {
        class: props.class , 
        type: props.type || "text",
        placeholder: props.placeholder || "",
        name: props.name || "",
        required: props.required || false,
      },
      events: {
        change: props.onChange,
        blur: props.onBlur,
      },
    });
  }

  render(): string {
    return ``;
  }
}

