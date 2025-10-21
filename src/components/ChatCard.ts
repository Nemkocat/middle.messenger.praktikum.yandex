import Block from "../core/block";

interface Chat {
  id: string;
  avatar: string;
  title: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
}

interface ChatCardProps {
  chat: Chat;
  active?: boolean;
  onClick?: (chatId: string) => void;
}

export default class ChatCard extends Block {
  constructor(props: ChatCardProps) {
    super("li", {
      ...props,
      className: "chat-card",
      attrs: {
        "data-chat-id": props.chat.id,
      },
      events: {
        click: () => props.onClick?.(props.chat.id),
      },
    });
  }

  render(): string {
    const { chat } = this.props;
    console.log('ChatCard render called with chat:', chat);
    
    return `
      <div class="chat-card__avatar-wrapper">
        <img src="${chat.avatar}" class="chat-card__avatar-wrapper_image" alt="Фото профиля">
      </div>
      <div class="chat-card__text">
        <h4 class="chat-card__text_name">${chat.title}</h4>
        <p class="chat-card__text_last-message">${chat.lastMessage}</p>
      </div>
      <div class="chat-card__numbers">
        <time class="chat-card__numbers_message-time">${chat.time}</time>
        ${chat.unreadCount ? `<span class="chat-card__numbers_unread-count">${chat.unreadCount}</span>` : ''}
      </div>
    `;
  }
}
