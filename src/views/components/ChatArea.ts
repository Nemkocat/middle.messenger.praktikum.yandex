import Block from "../../core/block";
import Input from "./Input";
import { Validator } from "../../utils/validation";

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
    id?: string | number;
  };
  onSubmit?: (e: Event, messageContent?: string) => void;
  onFileChange?: (e: Event) => void;
  onMessageChange?: (e: Event) => void;
  onAddUser?: (chatId: number, userLogin: string) => Promise<void>;
  onRemoveUser?: (chatId: number, userLogin: string) => Promise<void>;
  onDeleteChat?: (chatId: number) => Promise<void>;
  onDeleteChatClick?: () => void;
}

export default class ChatArea extends Block {
  constructor(props: ChatAreaProps) {
    super("div", {
      ...props,
      formState: {
        message: "",
      },
      errors: {
        message: "",
      },
      className: "picked-chat",
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
        value: "",
        error: "",
        onChange: (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          const validation = Validator.validate("message", value);
          
          const messageInput = this.children.MessageInput;
          if (messageInput && !Array.isArray(messageInput)) {
            messageInput.setProps({
              value,
              error: validation.isValid ? "" : validation.errorMessage,
            });
          }

          this.setProps({
            formState: {
              ...this.props.formState,
              message: value
            },
            errors: {
              ...this.props.errors,
              message: validation.isValid ? "" : validation.errorMessage,
            }
          });
        },
        onBlur: (e: Event) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          const validation = Validator.validate("message", value);
          
          const messageInput = this.children.MessageInput;
          if (messageInput && !Array.isArray(messageInput)) {
            messageInput.setProps({
              error: validation.isValid ? "" : validation.errorMessage,
            });
          }

          this.setProps({
            errors: {
              ...this.props.errors,
              message: validation.isValid ? "" : validation.errorMessage,
            }
          });
        },
      }),
      events: {
        submit: (e: Event) => this.handleSubmit(e),
        click: (e: Event) => this.handleMenuClick(e),
      },
    });
  }

  private isSubmitting: boolean = false;

  handleSubmit(e: Event) {
    e.preventDefault();
    e.stopPropagation(); // Предотвращаем всплытие события
    
    // Защита от повторных вызовов
    if (this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    // Валидация поля message при submit
    const messageValidation = Validator.validate("message", this.props.formState.message);
    
    // Обновляем ошибку
    const messageInput = this.children.MessageInput;
    if (messageInput && !Array.isArray(messageInput)) {
      messageInput.setProps({
        error: messageValidation.isValid ? "" : messageValidation.errorMessage,
      });
    }

    this.setProps({
      errors: {
        ...this.props.errors,
        message: messageValidation.isValid ? "" : messageValidation.errorMessage,
      }
    });

    // Если есть ошибки, не отправляем форму
    if (!messageValidation.isValid) {
      this.isSubmitting = false;
      return;
    }

    // Если валидация прошла успешно
    const messageContent = this.props.formState.message;
    
    // Вызываем обработчик onSubmit, если он есть, передавая значение сообщения
    if (this.props.onSubmit) {
      this.props.onSubmit(e, messageContent);
    }
    
    // Очищаем поле после отправки
    const messageInputForClear = this.children.MessageInput;
    if (messageInputForClear && !Array.isArray(messageInputForClear)) {
      messageInputForClear.setProps({
        value: "",
        error: "",
      });
    }

    this.setProps({
      formState: {
        ...this.props.formState,
        message: ""
      },
      errors: {
        ...this.props.errors,
        message: "",
      }
    });
    
    // Сбрасываем флаг после небольшой задержки
    setTimeout(() => {
      this.isSubmitting = false;
    }, 100);
  }

  handleMenuClick(e: Event) {
    const target = e.target as HTMLElement;
    const menuBtn = target.closest('[data-action="menu"]');
    
    if (menuBtn && this.props.onDeleteChatClick) {
      // Открываем модальное окно для удаления чата
      this.props.onDeleteChatClick();
    }
  }

  componentDidUpdate(): boolean {
    return true;
  }

  render(): string {
    return `
      {{#if isEmpty}}
        <div class="picked-chat__nothing-picked">
          <p class="picked-chat__nothing-picked_text">Выберите чат чтобы отправить сообщение</p>
        </div>
      {{else}}
        <div class="chat-header">
          <div class="chat-header__info">
            <div class="chat-header__avatar">
              <img src="{{chat.avatar}}" alt="Аватар чата" onerror="this.src='/images/default-avatar.png'">
            </div>
            <div class="chat-header__user-info">
              <h2 class="chat-header__title">{{chat.title}}</h2>
              <p class="chat-header__status">в сети</p>
            </div>
          </div>
          <div class="chat-header__menu">
            <button class="chat-header__menu-btn" type="button" data-action="menu">
              <span class="chat-header__menu-dots">⋯</span>
            </button>
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
        
        <form class="picked-chat__message-form">
          <label for="message-file" class="picked-chat__message-form_file-img">
            <img src="/images/clip.png" alt="Прикрепить файл">
          </label>

          {{{ FileInput }}}

          {{{ MessageInput }}}
      
          <button class="picked-chat__message-form_send-message-btn" type="submit">
            <img src="/images/send-arrow.png" alt="Отправить сообщение">
          </button>
        </form>
      {{/if}}
    `;
  }
}

