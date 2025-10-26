import Block from "../../../core/block";
import ChatArea from "../../components/ChatArea";
import ChatList from "../../components/ChatList";
import Link from "../../components/Link";
import Input from "../../components/Input";
import mainTemplate from "./main.hbs?raw";
import registerComponent from "../../../core/registerComponent";
import { ChatController } from "../../../controllers/ChatController";

interface MainPageProps {
  chatController?: ChatController;
}

export default class MainPage extends Block {
  private chatController: ChatController;

  constructor(props: MainPageProps) {
    super("div", {
      ...props,
      chats: props.chatController?.getChats() || [],
      selectedChat: null, 
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
        onChange: props.chatController?.onSearchChange,
      }),
      ChatListComponent: new ChatList({
        chats: props.chatController?.getChats() || [],
        onChatClick: props.chatController?.onChatClick,
      }),
      ChatAreaComponent: new ChatArea({
        isEmpty: true,
        onSubmit: props.chatController?.onMessageSubmit,
        onFileChange: props.chatController?.onFileChange,
        onMessageChange: props.chatController?.onMessageChange,
      }),
    });

    this.chatController = props.chatController!;

    // Регистрируем компоненты-хелперы, используемые в шаблоне
    registerComponent(ChatList);
    registerComponent(ChatArea);
  }

  componentDidUpdate(oldProps: unknown, newProps: unknown): boolean {
    // Приводим к нужному типу для безопасного доступа к свойствам
    const oldPropsTyped = oldProps as { selectedChat?: unknown };
    const newPropsTyped = newProps as { selectedChat?: unknown };
    
    if (oldPropsTyped.selectedChat !== newPropsTyped.selectedChat) {
      const { ChatAreaComponent } = this.children;
      if (ChatAreaComponent && !Array.isArray(ChatAreaComponent)) {
        if (newPropsTyped.selectedChat) {
          // Приводим selectedChat к нужному типу
          const selectedChat = newPropsTyped.selectedChat as { id: string; avatar: string; title: string };
          
          // Получаем сообщения из Controller
          const messages = this.chatController.getMessagesForChat(selectedChat.id);
          
          ChatAreaComponent.setProps({
            isEmpty: false,
            chat: {
              avatar: selectedChat.avatar,
              title: selectedChat.title,
              messages: messages
            },
            onSubmit: this.chatController.onMessageSubmit,
            onFileChange: this.chatController.onFileChange,
            onMessageChange: this.chatController.onMessageChange,
          });
        } else {
          ChatAreaComponent.setProps({ 
            isEmpty: true,
            onSubmit: this.chatController.onMessageSubmit,
            onFileChange: this.chatController.onFileChange,
            onMessageChange: this.chatController.onMessageChange,
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

