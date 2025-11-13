import Block from "../../core/block";

interface Chat {
  id: string;
  avatar: string;
  title: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
}

interface ChatListProps {
  chats: Chat[];
  onChatClick?: (chat: Chat) => void;
}

export default class ChatList extends Block {
  constructor(props: ChatListProps) {
    super("ul", {
      ...props,
      className: "chats-menu-nav__chats",
      events: {
        click: (e: Event) => {
          const target = e.target as HTMLElement;
          const chatCard = target.closest('.chat-card') as HTMLElement;
          if (chatCard) {
            // Используем текущие props, а не props из конструктора
            const currentProps = this.props as ChatListProps;
            if (currentProps.onChatClick) {
              const chatId = chatCard.getAttribute('data-chat-id');
              const chat = currentProps.chats?.find(c => c.id === chatId);
              if (chat) {
                currentProps.onChatClick(chat);
              }
            }
          }
        }
      }
    });
  }

  componentDidUpdate(oldProps: ChatListProps, newProps: ChatListProps): boolean {
    // Если изменился список чатов, перерисовываем компонент
    const chatsChanged = oldProps.chats !== newProps.chats;
    const lengthChanged = oldProps.chats?.length !== newProps.chats?.length;
    
    if (chatsChanged || lengthChanged) {
      // При обновлении нужно перепривязать обработчики ошибок для новых изображений
      // Вызываем attachImageErrorHandlers после перерисовки
      setTimeout(() => {
        this.attachImageErrorHandlers();
      }, 0);
      return true;
    }
    return false;
  }

  componentDidMount() {
    this.attachImageErrorHandlers();
  }

  private attachImageErrorHandlers() {
    // Добавляем обработчики ошибок загрузки изображений
    const images = this._element?.querySelectorAll('img.chat-card__avatar-wrapper_image');
    images?.forEach((img) => {
      const imageElement = img as HTMLImageElement;
      // Проверяем, не привязан ли уже обработчик
      if (!(imageElement as any).__errorHandlerAttached) {
        const errorHandler = () => {
          imageElement.src = '/images/default-avatar.png';
        };
        imageElement.addEventListener('error', errorHandler);
        (imageElement as any).__errorHandlerAttached = true;
      }
    });
  }

  render(): string {
    return `
      {{#each chats}}
        <li class="chat-card" data-chat-id="{{this.id}}">
          <div class="chat-card__avatar-wrapper">
            <img src="{{this.avatar}}" class="chat-card__avatar-wrapper_image" alt="Фото профиля">
          </div>
          <div class="chat-card__text">
            <h4 class="chat-card__text_name">{{this.title}}</h4>
            <p class="chat-card__text_last-message">{{this.lastMessage}}</p>
          </div>
          <div class="chat-card__numbers">
            <time class="chat-card__numbers_message-time">{{this.time}}</time>
            {{#if this.unreadCount}}
              <span class="chat-card__numbers_unread-count">{{this.unreadCount}}</span>
            {{/if}}
          </div>
        </li>
      {{/each}}
    `;
  }
}

