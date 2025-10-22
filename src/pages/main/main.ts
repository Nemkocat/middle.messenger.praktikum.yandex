import Block from "../../core/block";
import ChatArea from "../../components/ChatArea";
import ChatList from "../../components/ChatList";
import Link from "../../components/Link";
import Input from "../../components/Input";
import mainTemplate from "./main.hbs?raw";
import mockChats from "./mockChats";
import registerComponent from "../../core/registerComponent";

interface MainPageProps {
  chats?: any[];
  selectedChat?: any;
  onChatClick?: (chatId: string) => void;
  onMessageSubmit?: (e: Event) => void;
  onFileChange?: (e: Event) => void;
  onMessageChange?: (e: Event) => void;
  onSearchChange?: (e: Event) => void;
}

export default class MainPage extends Block {
  constructor(props: MainPageProps) {
    super("div", {
      ...props,
      // данные для хелперов в шаблоне
      chats: mockChats,
      mockChats: mockChats,
      selectedChat: null, // Спроси почему null
      ProfileLink: new Link({
        href: "#",
        class: "chats-menu-nav__profile-link",
        page: "profile",
        img: "/images/profile-arrow.png",
        imgClass: "chats-menu-nav__profile-link_arrow",
        imgAlt: ">",
        text: "Профиль",
      }),
      SearchInput: new Input({
        id: "chats-search",
        class: "chats-menu-nav__form_input",
        type: "text",
        placeholder: "Поиск",
        name: "search",
        onChange: props.onSearchChange,
      }),
      ChatListComponent: new ChatList({
        chats: mockChats,
        onChatClick: (chat) => {
          this.setProps({ selectedChat: chat });
        },
      }),
      ChatAreaComponent: new ChatArea({
        isEmpty: true,
        onSubmit: props.onMessageSubmit,
        onFileChange: props.onFileChange,
        onMessageChange: props.onMessageChange,
      }),
    });

    // Регистрируем компоненты-хелперы, используемые в шаблоне
    registerComponent(ChatList);
    registerComponent(ChatArea);
  }

  componentDidUpdate(oldProps: any, newProps: any): boolean {
    if (oldProps.selectedChat !== newProps.selectedChat) {
      const { ChatAreaComponent } = this.children;
      if (ChatAreaComponent && !Array.isArray(ChatAreaComponent)) {
        if (newProps.selectedChat) {
          ChatAreaComponent.setProps({
            isEmpty: false,
            chat: {
              avatar: newProps.selectedChat.avatar,
              title: newProps.selectedChat.title,
            messages: [
              {
                content: "Короче анекдот:",
                time: "11:56",
                isMine: false,
              },
              {
                content: "Мама собирает сыну обед в школу. - Вот, положила тебе в ранец хлеб, колбасу и гвозди. - Мам, а нафига?. - Ну как же, берешь хлеб, кладешь на него колбасу и ешь. - А гвозди? - Так вот же они!",
                time: "11:56",
                isMine: false,
              },
              {
                content: "Жесть!",
                time: "12:00",
                isMine: true,
              }
            ]
            },
            onSubmit: newProps.onMessageSubmit,
            onFileChange: newProps.onFileChange,
            onMessageChange: newProps.onMessageChange,
          });
        } else {
          ChatAreaComponent.setProps({ 
            isEmpty: true,
            onSubmit: newProps.onMessageSubmit,
            onFileChange: newProps.onFileChange,
            onMessageChange: newProps.onMessageChange,
          });
        }
      }
    }
    return true;
  }

  render(): string {
    return mainTemplate;
  }
}

export { MainPage };

