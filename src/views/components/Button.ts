import Block from "../../core/block";

interface ButtonProps {
  id?: string;
  class?: string;
  text: string;
  onClick?: (e: Event) => void;
  disabled?: boolean;
  type?: string;
}

export default class Button extends Block {
  constructor(props: ButtonProps) {
    super("button", {
      ...props,
      attrs: {
        class: props.class ,
        id: props.id || "",
        disabled: props.disabled || false,
        type: props.type || "submit", // Используем переданный type или по умолчанию "submit"
      },
      events: {
        click: (e: Event) => {
          this.handleClick(e);
        },
      },
    });
  }

  handleClick(e: Event) {
    // Проверяем актуальное состояние disabled из элемента
    const buttonElement = e.target as HTMLButtonElement;
    if (buttonElement && buttonElement.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Используем this.props.onClick, чтобы всегда использовать актуальные props
    const onClickHandler = this.props.onClick as ((e: Event) => void) | undefined;
    if (onClickHandler) {
      try {
        onClickHandler(e);
      } catch (error) {
        console.error('[Button] Error in onClick handler:', error);
      }
    }
    // Если onClick нет и кнопка типа submit, форма обработает submit событие естественным образом
  }

  componentDidUpdate(oldProps: unknown, newProps: unknown): boolean {
    const oldPropsTyped = oldProps as ButtonProps;
    const newPropsTyped = newProps as ButtonProps;
    if (!this._element) {
      return false;
    }

    // Обновляем атрибут disabled в DOM при изменении props
    if (oldPropsTyped.disabled !== newPropsTyped.disabled) {
      if (newPropsTyped.disabled) {
        this._element.setAttribute('disabled', '');
      } else {
        this._element.removeAttribute('disabled');
      }
    }
    
    // Обновляем текст кнопки напрямую, если он изменился
    if (oldPropsTyped.text !== newPropsTyped.text) {
      // Очищаем содержимое и устанавливаем новый текст
      this._element.textContent = newPropsTyped.text;
    }
    
    // Обновляем класс, если он изменился
    if (oldPropsTyped.class !== newPropsTyped.class) {
      if (oldPropsTyped.class) {
        this._element.classList.remove(...oldPropsTyped.class.split(' ').filter(Boolean));
      }
      if (newPropsTyped.class) {
        this._element.classList.add(...newPropsTyped.class.split(' ').filter(Boolean));
      }
    }
    
    // Не перерисовываем весь компонент - обновляем только необходимые атрибуты
    return false;
  }

  componentDidMount() {
    // Компонент смонтирован
  }

  render(): string {
    return `{{text}}`;
  }
}

