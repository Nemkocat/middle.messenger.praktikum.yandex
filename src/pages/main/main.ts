import Block from "../../core/block";
import ChatList from "../../components/ChatList";
import ChatArea from "../../components/ChatArea";
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
    });

    // Регистрируем компоненты-хелперы, используемые в шаблоне
    registerComponent(ChatList);
    registerComponent(ChatArea);
  }

  render(): string {
    return mainTemplate;
  }
}

export { MainPage };

