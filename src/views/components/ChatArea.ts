import Block from "../../core/block";
import Input from "./Input";
import { Validator } from "../../utils/validation";

interface ChatAreaFormState {
  message: string;
}

interface ChatAreaErrors {
  message: string;
}

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
  formState?: ChatAreaFormState;
  errors?: ChatAreaErrors;
  onSubmit?: (e: Event, messageContent?: string) => void;
  onFileChange?: (e: Event) => void;
  onMessageChange?: (e: Event) => void;
  onAddUserClick?: () => void;
  onRemoveUserClick?: () => void;
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

          const currentFormState = (this.props.formState || { message: "" }) as ChatAreaFormState;
          const currentErrors = (this.props.errors || { message: "" }) as ChatAreaErrors;
          
          this.setProps({
            formState: {
              ...currentFormState,
              message: value
            },
            errors: {
              ...currentErrors,
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

          const currentErrors = (this.props.errors || { message: "" }) as ChatAreaErrors;
          
          this.setProps({
            errors: {
              ...currentErrors,
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
    const formState = (this.props.formState || { message: "" }) as ChatAreaFormState;
    const messageValidation = Validator.validate("message", formState.message);
    
    // Обновляем ошибку
    const messageInput = this.children.MessageInput;
    if (messageInput && !Array.isArray(messageInput)) {
      messageInput.setProps({
        error: messageValidation.isValid ? "" : messageValidation.errorMessage,
      });
    }

    const currentErrorsForSubmit = (this.props.errors || { message: "" }) as ChatAreaErrors;
    
    this.setProps({
      errors: {
        ...currentErrorsForSubmit,
        message: messageValidation.isValid ? "" : messageValidation.errorMessage,
      }
    });

    // Если есть ошибки, не отправляем форму
    if (!messageValidation.isValid) {
      this.isSubmitting = false;
      return;
    }

    // Если валидация прошла успешно
    const formStateForSubmit = (this.props.formState || { message: "" }) as ChatAreaFormState;
    const messageContent = formStateForSubmit.message;
    
    // Вызываем обработчик onSubmit, если он есть, передавая значение сообщения
    if (this.props.onSubmit && typeof this.props.onSubmit === 'function') {
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

    const formStateForClear = (this.props.formState || { message: "" }) as ChatAreaFormState;
    const errorsForClear = (this.props.errors || { message: "" }) as ChatAreaErrors;
    
    this.setProps({
      formState: {
        ...formStateForClear,
        message: ""
      },
      errors: {
        ...errorsForClear,
        message: "",
      }
    });
    
    // Сбрасываем флаг после небольшой задержки
    window.setTimeout(() => {
      this.isSubmitting = false;
    }, 100);
  }

  handleMenuClick(e: Event) {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    const menuBtn = target.closest('[data-action="menu"]');
    const menuItem = target.closest('[data-action]');
    const menu = this._element?.querySelector('.chat-header__menu-dropdown') as HTMLElement;
    
    if (menuBtn) {
      // Переключаем видимость выпадающего меню
      if (menu) {
        menu.classList.toggle('chat-header__menu-dropdown--open');
      }
      return;
    }
    
    if (menuItem) {
      const action = menuItem.getAttribute('data-action');
      
      if (action === 'add-user' && this.props.onAddUserClick && typeof this.props.onAddUserClick === 'function') {
        this.props.onAddUserClick();
        // Закрываем меню
        if (menu) {
          menu.classList.remove('chat-header__menu-dropdown--open');
        }
      } else if (action === 'remove-user' && this.props.onRemoveUserClick && typeof this.props.onRemoveUserClick === 'function') {
        this.props.onRemoveUserClick();
        // Закрываем меню
        if (menu) {
          menu.classList.remove('chat-header__menu-dropdown--open');
        }
      } else if (action === 'delete-chat' && this.props.onDeleteChatClick && typeof this.props.onDeleteChatClick === 'function') {
        this.props.onDeleteChatClick();
        // Закрываем меню
        if (menu) {
          menu.classList.remove('chat-header__menu-dropdown--open');
        }
      }
    }
  }

  componentDidMount() {
    // Закрываем меню при клике вне его
    const handleDocumentClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.chat-header__menu')) {
        const menu = this._element?.querySelector('.chat-header__menu-dropdown') as HTMLElement;
        if (menu) {
          menu.classList.remove('chat-header__menu-dropdown--open');
        }
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    
    // Сохраняем обработчик для последующего удаления
    (this as unknown as { _documentClickHandler?: (e: Event) => void })._documentClickHandler = handleDocumentClick;
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
            <div class="chat-header__menu-dropdown">
              <button class="chat-header__menu-item" type="button" data-action="add-user">
                Добавить пользователя
              </button>
              <button class="chat-header__menu-item" type="button" data-action="remove-user">
                Удалить пользователя
              </button>
              <button class="chat-header__menu-item" type="button" data-action="delete-chat">
                Удалить чат
              </button>
            </div>
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

