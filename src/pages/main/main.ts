import Block from "../../core/block";
import ChatList from "../../components/ChatList";
import ChatArea from "../../components/ChatArea";
import Link from "../../components/Link";
import Input from "../../components/Input";
import mainTemplate from "./main.hbs?raw";
import mockChats from "./mockChats";

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
    console.log('MainPage constructor called with props:', props);
    console.log('mockChats:', mockChats);
    
    super("div", {
      ...props,
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
      ChatList: new ChatList({
        chats: mockChats, 
        onChatClick: props.onChatClick,
      }),
      ChatArea: new ChatArea({
        isEmpty: !props.selectedChat,
        chat: props.selectedChat,
        onSubmit: props.onMessageSubmit,
        onFileChange: props.onFileChange,
        onMessageChange: props.onMessageChange,
      }),
    });
  }

  render(): string {
    return mainTemplate;
  }
}

export { MainPage };

