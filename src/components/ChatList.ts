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
      activeChatIndex: -1,
      events: {
        click: (e: Event) => {
          const target = e.target as HTMLElement;
          const chatCard = target.closest('.chat-card') as HTMLElement;
          if (chatCard) {
            const chatId = chatCard.dataset.chatId;
            const chatIndex = props.chats?.findIndex(chat => chat.id === chatId);
            if (chatIndex !== undefined && chatIndex >= 0) {
              this.setProps({ activeChatIndex: chatIndex });
              props.onChatClick?.(chatId!);
            }
          }
        },
      },
    });
  }

  render(): string {
    console.log('ChatList render called!');
    const { activeChatIndex, chats } = this.props;

    console.log('chats:', chats);
    console.log('activeChatIndex:', activeChatIndex);

    if (!chats || chats.length === 0) {
      return '<li>Нет чатов</li>';
    }

    return chats.map((chat: Chat, index: number) => {
      const isActive = index === activeChatIndex ? 'chat-card_active' : '';
      
      return `
        <li class="chat-card ${isActive}" data-chat-id="${chat.id}">
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
        </li>
      `;
    }).join('');
  }
}
