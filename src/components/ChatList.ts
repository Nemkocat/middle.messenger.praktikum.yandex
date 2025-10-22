import Block from "../core/block";

interface Chat {
  id: string;
  avatar: string;
  title: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
}

interface ChatListProps {
  chats?: Chat[];
  onChatClick?: (chatId: string) => void;
}

export default class ChatList extends Block {
  constructor(props: ChatListProps) {
    super("ul", {
      ...props,
      className: "chats-menu-nav__chats",
    });
  }

  render(): string {
    return `
      {{#if chats}}
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
      {{/if}}
    `;
  }
}
