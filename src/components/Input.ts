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
      className: "input",
      attrs: {
        class: props.class || "input",
      },
      events: {
        change: props.onChange,
        blur: props.onBlur,
      },
    });
  }

  render(): string {
    const errorClass = this.props.error ? "input--error" : "";
    const inputClass = `input__element ${errorClass}`.trim();
    
    return `
      <div class="input ${errorClass}">
        <label class="input__container">
          <input
            class="${inputClass}"
            type="${this.props.type || "text"}"
            placeholder="${this.props.placeholder || ""}"
            name="${this.props.name || ""}"
            value="${this.props.value || ""}"
            ${this.props.required ? "required" : ""}
          />
          ${this.props.placeholder ? `<div class="input__label">${this.props.placeholder}</div>` : ""}
        </label> 
        ${this.props.error ? `<div class="input__error">${this.props.error}</div>` : ""}
      </div>
    `;
  }
}

