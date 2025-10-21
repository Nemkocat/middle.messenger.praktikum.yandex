import Block from "../core/block";
import MessageForm from "./MessageForm";

interface ChatAreaProps {
  isEmpty?: boolean;
  chat?: {
    avatar: string;
    title: string;
    messages: Array<{
      content: string;
      time: string;
      isMine: boolean;
    }>;
  };
  onSubmit?: (e: Event) => void;
  onFileChange?: (e: Event) => void;
  onMessageChange?: (e: Event) => void;
}

export default class ChatArea extends Block {
  constructor(props: ChatAreaProps) {
    super("div", {
      ...props,
      MessageForm: new MessageForm({
        onSubmit: props.onSubmit,
        onFileChange: props.onFileChange,
        onMessageChange: props.onMessageChange,
      }),
    });
  }

  render(): string {
    return `
      {{#if isEmpty}}
        <div class="picked-chat__nothing-picked">
          <p class="picked-chat__nothing-picked_text">Выберите чат чтобы отправить сообщение</p>
        </div>
      {{else}}
        <div class="chat-header">
          <div class="chat-header__avatar">
            <img src="{{chat.avatar}}" alt="Аватар чата">
          </div>
          <div class="chat-header__info">
            <h2 class="chat-header__title">{{chat.title}}</h2>
            <p class="chat-header__status">в сети</p>
          </div>
        </div>
        
        <div class="chat-messages">
          {{#each chat.messages}}
            <div class="message {{#if isMine}}message--mine{{/if}}">
              <p class="message__content">{{content}}</p>
              <time class="message__time">{{time}}</time>
            </div>
          {{/each}}
        </div>
        
        {{{ MessageForm }}}
      {{/if}}
    `;
  }
}