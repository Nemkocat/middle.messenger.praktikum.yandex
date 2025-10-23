import Block from "../core/block";

interface InputProps {
  id?: string;
  type?: string;
  class?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange?: (e: Event) => void;
  onBlur?: (e: Event) => void;
}

export default class Input extends Block {
  constructor(props: InputProps) {
    super("div", {
      ...props,
      className: "input-component",
      attrs: {
        class: props.class || "input-component",
      },
      events: {
        change: props.onChange,
        blur: props.onBlur,
      },
    });
  }

  render(): string {
    const errorClass = this.props.error ? "input-component--error" : "";
    const inputClass = `input-component__element ${errorClass}`.trim();
    
    return `
      <div class="input-component ${errorClass}">
        <label class="input-component__container">
          <input
            class="${inputClass}"
            type="${this.props.type || "text"}"
            placeholder="${this.props.placeholder || ""}"
            name="${this.props.name || ""}"
            value="${this.props.value || ""}"
            ${this.props.required ? "required" : ""}
          />
        </label> 
        ${this.props.error ? `<div class="input-component__error">${this.props.error}</div>` : ""}
      </div>
    `;
  }
}

