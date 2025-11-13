import Block from "../../core/block";
import { Validator } from "../../utils/validation";
import { escapeHtml } from "../../utils/escapeHtml";

interface ModalProps {
  isOpen?: boolean;
  title?: string;
  onClose?: () => void;
  onSubmit?: (login?: string) => Promise<void>;
  showForm?: boolean; // Если false, показываем только кнопку без формы
  buttonText?: string; // Текст кнопки
}

export default class Modal extends Block {
  constructor(props: ModalProps) {
    super("div", {
      ...props,
      className: "modal",
      formState: {
        login: "",
      },
      errors: {
        login: "",
      },
      attrs: {
        class: props.isOpen ? "modal modal--open" : "modal",
      },
      events: {
        click: (e: Event) => {
          // Закрываем модальное окно при клике вне его (на backdrop)
          const target = e.target as HTMLElement;
          if (target.classList.contains("modal__backdrop") || target === this._element) {
            if (props.onClose) {
              props.onClose();
            }
          }
        },
        submit: (e: Event) => this.handleSubmit(e),
        input: (e: Event) => this.handleInputChange(e),
      },
    });
  }

  handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.name === "login") {
      const value = target.value;
      const validation = Validator.validate("login", value);
      
      this.setProps({
        formState: {
          ...this.props.formState,
          login: value,
        },
        errors: {
          ...this.props.errors,
          login: validation.isValid ? "" : validation.errorMessage,
        },
      });
    }
  }

  async handleSubmit(e: Event) {
    e.preventDefault();
    
    // Если форма не нужна (например, для удаления чата), просто вызываем onSubmit
    if (this.props.showForm === false) {
      if (this.props.onSubmit) {
        try {
          await this.props.onSubmit();
          // Закрываем модальное окно
          if (this.props.onClose) {
            this.props.onClose();
          }
        } catch (error) {
          console.error('Error submitting:', error);
          const errorMessage = error instanceof Error ? error.message : 'Ошибка';
          // Для модального окна без формы показываем ошибку через alert
          alert(errorMessage);
        }
      }
      return;
    }
    
    // Обычная форма с валидацией логина
    const login = this.props.formState?.login || "";
    const validation = Validator.validate("login", login);
    
    if (!validation.isValid) {
      this.setProps({
        errors: {
          ...this.props.errors,
          login: validation.errorMessage,
        },
      });
      return;
    }

    // Если есть обработчик onSubmit, вызываем его
    if (this.props.onSubmit) {
      try {
        await this.props.onSubmit(login.trim());
        // Очищаем форму после успешной отправки
        this.setProps({
          formState: {
            login: "",
          },
          errors: {
            login: "",
          },
        });
        // Закрываем модальное окно
        if (this.props.onClose) {
          this.props.onClose();
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ошибка при создании чата';
        this.setProps({
          errors: {
            ...this.props.errors,
            login: errorMessage,
          },
        });
      }
    }
  }

  componentDidUpdate(oldProps: ModalProps, newProps: ModalProps): boolean {
    if (!this._element) {
      return false;
    }

    // Сохраняем фокус на инпуте, если он был в фокусе до обновления
    const loginInput = this._element.querySelector('input[name="login"]') as HTMLInputElement;
    const hadFocus = loginInput && document.activeElement === loginInput;
    const cursorPosition = loginInput?.selectionStart || 0;

    // Если изменилось состояние isOpen, нужно перерисовать компонент
    if (oldProps.isOpen !== newProps.isOpen) {
      // Обновляем класс для показа/скрытия модального окна
      if (newProps.isOpen) {
        this._element.classList.add("modal--open");
      } else {
        this._element.classList.remove("modal--open");
        // При закрытии очищаем форму
        if (!newProps.isOpen) {
          this.setProps({
            formState: {
              login: "",
            },
            errors: {
              login: "",
            },
          });
        }
      }
      // Перерисовываем компонент, чтобы показать/скрыть содержимое
      return true;
    }

    // Если изменилось состояние формы или ошибок, перерисовываем
    const oldFormState = (oldProps as any).formState;
    const newFormState = (newProps as any).formState;
    const oldErrors = (oldProps as any).errors;
    const newErrors = (newProps as any).errors;

    const shouldUpdate = oldFormState?.login !== newFormState?.login ||
      oldErrors?.login !== newErrors?.login;

    if (shouldUpdate) {
      // Восстанавливаем фокус и позицию курсора после обновления
      if (hadFocus && loginInput) {
        setTimeout(() => {
          const newInput = this._element?.querySelector('input[name="login"]') as HTMLInputElement;
          if (newInput) {
            newInput.focus();
            // Восстанавливаем позицию курсора
            if (newInput.setSelectionRange) {
              const newPosition = Math.min(cursorPosition, newInput.value.length);
              newInput.setSelectionRange(newPosition, newPosition);
            }
          }
        }, 0);
      }
      return true;
    }

    return false;
  }

  render(): string {
    if (!this.props.isOpen) {
      return `<div class="modal"></div>`;
    }

    // Если форма не нужна, показываем только кнопку
    if (this.props.showForm === false) {
      const buttonText = escapeHtml(this.props.buttonText || "Удалить");
      const title = escapeHtml(this.props.title || "");
      return `
        <div class="modal__backdrop"></div>
        <div class="modal__content">
          <h2 class="modal__title">${title}</h2>
          <form class="modal__form" action="">
            <button type="submit" class="modal__button modal__button--danger">${buttonText}</button>
          </form>
        </div>
      `;
    }

    // Обычная форма с полем ввода
    const loginValue = escapeHtml(this.props.formState?.login || "");
    const loginError = escapeHtml(this.props.errors?.login || "");
    const buttonText = escapeHtml(this.props.buttonText || "Добавить");
    const title = escapeHtml(this.props.title || "");

    return `
      <div class="modal__backdrop"></div>
      <div class="modal__content">
        <h2 class="modal__title">${title}</h2>
        <form class="modal__form" action="">
          <div class="modal__input-wrapper">
            <input 
              type="text" 
              class="modal__input ${loginError ? "modal__input--error" : ""}" 
              name="login" 
              placeholder="Логин"
              value="${loginValue}"
            >
            ${loginError ? `<div class="modal__error">${loginError}</div>` : ""}
          </div>
          <button type="submit" class="modal__button">${buttonText}</button>
        </form>
      </div>
    `;
  }
}

