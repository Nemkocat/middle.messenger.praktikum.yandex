import Block from "../../../core/block";
import ChatArea from "../../components/ChatArea";
import ChatList from "../../components/ChatList";
import Link from "../../components/Link";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
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
      isCreateChatModalOpen: false,
      isDeleteChatModalOpen: false,
      currentChatId: null as number | null,
      events: {
        click: (e: Event) => {
          const target = e.target as HTMLElement;
          const createChatBtn = target.closest('.chats-menu-nav__create-chat-btn');
          if (createChatBtn) {
            e.preventDefault();
            e.stopPropagation();
            this.setProps({ isCreateChatModalOpen: true });
          }
        },
      },
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
      CreateChatModal: new Modal({
        isOpen: false,
        title: "Добавить пользователя",
        onClose: () => {
          this.setProps({ isCreateChatModalOpen: false });
        },
        onSubmit: async (login: string) => {
          await this.chatController.createChatWithUser(login);
          // Обновляем список чатов в MainPage после создания
          const updatedChats = this.chatController.getChats();
          this.setProps({ chats: updatedChats });
        },
      } as any),
      DeleteChatModal: new Modal({
        isOpen: false,
        title: "Удалить чат",
        showForm: false,
        buttonText: "Удалить",
        onClose: () => {
          this.setProps({ isDeleteChatModalOpen: false, currentChatId: null });
        },
        onSubmit: async () => {
          const chatId = (this.props as any).currentChatId;
          if (chatId !== null && chatId !== undefined) {
            try {
              await this.chatController.deleteChat(chatId);
              // Обновляем список чатов в MainPage после удаления
              const updatedChats = this.chatController.getChats();
              this.setProps({ 
                chats: updatedChats,
                selectedChat: null,
                isDeleteChatModalOpen: false,
                currentChatId: null,
              });
            } catch (error) {
              console.error('[MainPage] Error deleting chat:', error);
              throw error; // Пробрасываем ошибку, чтобы Modal показал alert
            }
          }
        },
      } as any),
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
    
    // После загрузки чатов обновляем ChatListComponent с актуальными данными
    // Это нужно, потому что чаты загружаются асинхронно в ChatController.setView
    // Но мы полагаемся на componentDidUpdate, который сработает когда updateChatsList() обновит props
    // Здесь просто инициализируем ChatListComponent с текущими чатами (которые могут быть пустыми)
    if (this.chatController) {
      const { ChatListComponent } = this.children;
      if (ChatListComponent && !Array.isArray(ChatListComponent)) {
        const chats = this.chatController.getChats();
        ChatListComponent.setProps({
          chats,
          onChatClick: this.chatController.onChatClick,
        });
      }
    }
  }

  componentDidUpdate(oldProps: unknown, newProps: unknown): boolean {
    // Приводим к нужному типу для безопасного доступа к свойствам
    const oldPropsTyped = oldProps as { selectedChat?: unknown; isCreateChatModalOpen?: boolean; chats?: unknown[] };
    const newPropsTyped = newProps as { selectedChat?: unknown; isCreateChatModalOpen?: boolean; chats?: unknown[] };
    
    let shouldRerender = false;
    
    // Обновляем состояние модального окна создания чата
    if (oldPropsTyped.isCreateChatModalOpen !== newPropsTyped.isCreateChatModalOpen) {
      const { CreateChatModal } = this.children;
      if (CreateChatModal && !Array.isArray(CreateChatModal)) {
        const isOpen = newPropsTyped.isCreateChatModalOpen || false;
        CreateChatModal.setProps({ isOpen });
        shouldRerender = true;
      }
    }

    // Обновляем состояние модального окна удаления чата
    const oldDeleteModalOpen = (oldPropsTyped as any).isDeleteChatModalOpen;
    const newDeleteModalOpen = (newPropsTyped as any).isDeleteChatModalOpen;
    if (oldDeleteModalOpen !== newDeleteModalOpen) {
      const { DeleteChatModal } = this.children;
      if (DeleteChatModal && !Array.isArray(DeleteChatModal)) {
        const isOpen = newDeleteModalOpen || false;
        DeleteChatModal.setProps({ isOpen });
        shouldRerender = true;
      }
    }
    
    // Обновляем список чатов, если он изменился
    if (oldPropsTyped.chats !== newPropsTyped.chats) {
      const { ChatListComponent } = this.children;
      if (ChatListComponent && !Array.isArray(ChatListComponent)) {
        const chats = newPropsTyped.chats || [];
        // Обновляем и chats, и onChatClick, чтобы обработчик всегда был актуальным
        ChatListComponent.setProps({ 
          chats,
          onChatClick: this.chatController.onChatClick,
        });
        shouldRerender = true;
      }
    }
    
    // Проверяем изменения в сообщениях
    const oldMessages = (oldPropsTyped as any).messages;
    const newMessages = (newPropsTyped as any).messages;
    if (oldMessages !== newMessages) {
      const { ChatAreaComponent } = this.children;
      if (ChatAreaComponent && !Array.isArray(ChatAreaComponent)) {
        const currentChat = (newPropsTyped as any).selectedChat;
        if (currentChat) {
          ChatAreaComponent.setProps({
            chat: {
              ...(ChatAreaComponent.props.chat || {}),
              messages: newMessages || []
            }
          });
          shouldRerender = true;
        }
      }
    }
    
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
              id: selectedChat.id,
              avatar: selectedChat.avatar,
              title: selectedChat.title,
              messages: messages
            },
            onSubmit: this.chatController.onMessageSubmit,
            onFileChange: this.chatController.onFileChange,
            onMessageChange: this.chatController.onMessageChange,
            onAddUser: this.chatController.onAddUserToChat,
            onRemoveUser: this.chatController.onRemoveUserFromChat,
            onDeleteChatClick: () => {
              // Используем текущий selectedChat из props, а не из newProps
              const currentSelectedChat = this.props.selectedChat as { id: string | number } | null;
              if (currentSelectedChat) {
                const chatId = typeof currentSelectedChat.id === 'string' ? parseInt(currentSelectedChat.id) : currentSelectedChat.id;
                this.setProps({ 
                  isDeleteChatModalOpen: true,
                  currentChatId: chatId,
                });
              }
            },
          });
        } else {
          ChatAreaComponent.setProps({ 
            isEmpty: true,
            onSubmit: this.chatController.onMessageSubmit,
            onFileChange: this.chatController.onFileChange,
            onMessageChange: this.chatController.onMessageChange,
            onDeleteChatClick: undefined,
          });
        }
      }
      shouldRerender = true;
    }
    
    return shouldRerender;
  }

  render(): string {
    return mainTemplate;
  }
}

export { MainPage };

