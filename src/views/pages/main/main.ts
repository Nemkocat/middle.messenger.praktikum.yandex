import Block from "../../../core/block";
import ChatArea from "../../components/ChatArea";
import ChatList from "../../components/ChatList";
import Link from "../../components/Link";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import mainTemplate from "./main.hbs?raw";
import registerComponent, { type BlockConstructable, type PropsBlock } from "../../../core/registerComponent";
import { ChatController } from "../../../controllers/ChatController";

interface MainPageProps {
  chatController?: ChatController;
}

interface MainPageState {
  chats?: unknown[];
  selectedChat?: unknown;
  isCreateChatModalOpen?: boolean;
  isDeleteChatModalOpen?: boolean;
  isAddUserModalOpen?: boolean;
  isRemoveUserModalOpen?: boolean;
  currentChatId?: number | null;
  messages?: unknown[];
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
      isAddUserModalOpen: false,
      isRemoveUserModalOpen: false,
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
        onSubmit: async (login?: string) => {
          if (login) {
            try {
              await this.chatController.createChatWithUser(login);
              // Обновляем список чатов в MainPage после создания
              const updatedChats = this.chatController.getChats();
              this.setProps({ chats: updatedChats });
            } catch (error) {
              console.error('[MainPage] Error creating chat with user:', error);
              throw error; // Пробрасываем ошибку, чтобы Modal показал alert
            }
          }
        },
      }),
      DeleteChatModal: new Modal({
        isOpen: false,
        title: "Удалить чат",
        showForm: false,
        buttonText: "Удалить",
        onClose: () => {
          this.setProps({ isDeleteChatModalOpen: false, currentChatId: null });
        },
        onSubmit: async () => {
          const props = this.props as MainPageState;
          const chatId = props.currentChatId;
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
      }),
      AddUserModal: new Modal({
        isOpen: false,
        title: "Добавить пользователя в чат",
        onClose: () => {
          this.setProps({ isAddUserModalOpen: false });
        },
        onSubmit: async (login?: string) => {
          if (login) {
            const props = this.props as MainPageState;
            const chatId = props.currentChatId;
            if (chatId !== null && chatId !== undefined) {
              try {
                await this.chatController.onAddUserToChat(chatId, login);
                this.setProps({ isAddUserModalOpen: false });
              } catch (error) {
                console.error('[MainPage] Error adding user to chat:', error);
                throw error; // Пробрасываем ошибку, чтобы Modal показал alert
              }
            }
          }
        },
      }),
      RemoveUserModal: new Modal({
        isOpen: false,
        title: "Удалить пользователя из чата",
        onClose: () => {
          this.setProps({ isRemoveUserModalOpen: false });
        },
        onSubmit: async (login?: string) => {
          if (login) {
            const props = this.props as MainPageState;
            const chatId = props.currentChatId;
            if (chatId !== null && chatId !== undefined) {
              try {
                await this.chatController.onRemoveUserFromChat(chatId, login);
                this.setProps({ isRemoveUserModalOpen: false });
              } catch (error) {
                console.error('[MainPage] Error removing user from chat:', error);
                throw error; // Пробрасываем ошибку, чтобы Modal показал alert
              }
            }
          }
        },
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
    // Используем приведение к BlockConstructable<PropsBlock> для совместимости с registerComponent
    registerComponent(ChatList as unknown as BlockConstructable<PropsBlock>);
    registerComponent(ChatArea as unknown as BlockConstructable<PropsBlock>);
    
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
    const oldPropsTyped = oldProps as MainPageState;
    const newPropsTyped = newProps as MainPageState;
    
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
    const oldDeleteModalOpen = oldPropsTyped.isDeleteChatModalOpen;
    const newDeleteModalOpen = newPropsTyped.isDeleteChatModalOpen;
    if (oldDeleteModalOpen !== newDeleteModalOpen) {
      const { DeleteChatModal } = this.children;
      if (DeleteChatModal && !Array.isArray(DeleteChatModal)) {
        const isOpen = newDeleteModalOpen || false;
        DeleteChatModal.setProps({ isOpen });
        shouldRerender = true;
      }
    }

    // Обновляем состояние модального окна добавления пользователя
    if (oldPropsTyped.isAddUserModalOpen !== newPropsTyped.isAddUserModalOpen) {
      const { AddUserModal } = this.children;
      if (AddUserModal && !Array.isArray(AddUserModal)) {
        const isOpen = newPropsTyped.isAddUserModalOpen || false;
        AddUserModal.setProps({ isOpen });
        shouldRerender = true;
      }
    }

    // Обновляем состояние модального окна удаления пользователя
    if (oldPropsTyped.isRemoveUserModalOpen !== newPropsTyped.isRemoveUserModalOpen) {
      const { RemoveUserModal } = this.children;
      if (RemoveUserModal && !Array.isArray(RemoveUserModal)) {
        const isOpen = newPropsTyped.isRemoveUserModalOpen || false;
        RemoveUserModal.setProps({ isOpen });
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
    const oldMessages = oldPropsTyped.messages;
    const newMessages = newPropsTyped.messages;
    if (oldMessages !== newMessages) {
      const { ChatAreaComponent } = this.children;
      if (ChatAreaComponent && !Array.isArray(ChatAreaComponent)) {
        const currentChat = newPropsTyped.selectedChat;
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
            onAddUserClick: () => {
              // Используем текущий selectedChat из props
              const currentSelectedChat = this.props.selectedChat as { id: string | number } | null;
              if (currentSelectedChat) {
                const chatId = typeof currentSelectedChat.id === 'string' ? parseInt(currentSelectedChat.id) : currentSelectedChat.id;
                this.setProps({ 
                  isAddUserModalOpen: true,
                  currentChatId: chatId,
                });
              }
            },
            onRemoveUserClick: () => {
              // Используем текущий selectedChat из props
              const currentSelectedChat = this.props.selectedChat as { id: string | number } | null;
              if (currentSelectedChat) {
                const chatId = typeof currentSelectedChat.id === 'string' ? parseInt(currentSelectedChat.id) : currentSelectedChat.id;
                this.setProps({ 
                  isRemoveUserModalOpen: true,
                  currentChatId: chatId,
                });
              }
            },
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

