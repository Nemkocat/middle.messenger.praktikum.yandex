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

  componentDidUpdate(oldProps: ButtonProps, newProps: ButtonProps): boolean {
    if (!this._element) {
      return false;
    }

    // Обновляем атрибут disabled в DOM при изменении props
    if (oldProps.disabled !== newProps.disabled) {
      if (newProps.disabled) {
        this._element.setAttribute('disabled', '');
      } else {
        this._element.removeAttribute('disabled');
      }
    }
    
    // Обновляем текст кнопки напрямую, если он изменился
    if (oldProps.text !== newProps.text) {
      // Очищаем содержимое и устанавливаем новый текст
      this._element.textContent = newProps.text;
    }
    
    // Обновляем класс, если он изменился
    if (oldProps.class !== newProps.class) {
      if (oldProps.class) {
        this._element.classList.remove(...oldProps.class.split(' ').filter(Boolean));
      }
      if (newProps.class) {
        this._element.classList.add(...newProps.class.split(' ').filter(Boolean));
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

