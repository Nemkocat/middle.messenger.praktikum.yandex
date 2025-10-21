import Block from "../core/block";
import Input from "./Input";

interface MessageFormProps {
  onSubmit?: (e: Event) => void;
  onFileChange?: (e: Event) => void;
  onMessageChange?: (e: Event) => void;
}

export default class MessageForm extends Block {
  constructor(props: MessageFormProps) {
    super("form", {
      ...props,
      className: "picked-chat__message-form",
      events: {
        submit: props.onSubmit,
      },
      FileInput: new Input({
        id: "message-file",
        class: "picked-chat__message-form_file-input-hidden",
        type: "file",
        name: "file",
        onChange: props.onFileChange,
      }),
      MessageInput: new Input({
        id: "new-message",
        class: "picked-chat__message-form_input",
        type: "text",
        placeholder: "Сообщение",
        name: "message",
        required: true,
        onChange: props.onMessageChange,
      }),
    });
  }

  render(): string {
    return `
      <label for="message-file" class="picked-chat__message-form_file-img">
        <img src="/images/clip.png" alt="Прикрепить файл">
      </label>
      {{{ FileInput }}}

      {{{ MessageInput }}}
      
      <button class="picked-chat__message-form_send-message-btn" type="submit">
        <img src="/images/send-arrow.png" alt="Отправить сообщение">
      </button>
    `;
  }
}