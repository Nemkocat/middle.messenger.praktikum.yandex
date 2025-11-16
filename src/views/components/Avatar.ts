import Block from "../../core/block";

interface AvatarProps {
  class?: string;
  name?: string;
  img?: string;
  imgClass?: string;
  imgAlt?: string;
  text?: string;
  onChange?: (e: Event) => void;
  isLoading?: boolean;
}

export default class Avatar extends Block {
  constructor(props: AvatarProps) {
    super("div", {
      ...props,
      attrs: {
        class: props.class,
        name: props.name,
        img: props.img,
        imgClass: props.imgClass,
        imgAlt: props.imgAlt,
        text: props.text,
        isLoading: props.isLoading || false,
      },
    });
  }

  componentDidMount() {
    // Привязываем событие change к input[type="file"] напрямую
    if (this.props.onChange) {
      this.attachFileInputListener();
    }
  }

  componentDidUpdate() {
    // При обновлении компонента нужно перепривязать событие, если input был пересоздан
    if (this.props.onChange) {
      this.attachFileInputListener();
    }
    return false; // Не перерисовываем, так как используем прямую манипуляцию DOM
  }

  private attachFileInputListener() {
    const fileInput = this._element?.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      // Проверяем, не привязан ли уже обработчик (используем data-атрибут как флаг)
      if (fileInput.dataset.listenerAttached === 'true') {
        return;
      }
      
      fileInput.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        
        if (file && this.props.onChange && typeof this.props.onChange === 'function') {
          // Показываем предпросмотр изображения перед загрузкой
          this.showPreview(file);
          this.props.onChange(e);
        }
      });
      
      // Помечаем, что обработчик привязан
      fileInput.dataset.listenerAttached = 'true';
    }
  }

  private showPreview(file: File) {
    // Создаем предпросмотр изображения
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      if (result) {
        // Обновляем изображение предпросмотра
        const img = this._element?.querySelector('img') as HTMLImageElement;
        if (img) {
          img.src = result;
        }
      }
    };
    reader.readAsDataURL(file);
  }

  render(): string {
    const isLoading = this.props.isLoading || false;
    const imgSrc = this.props.img || '';
    const imgClass = this.props.imgClass || '';
    const loadingClass = isLoading ? 'profile__avatar_img--loading' : '';
    
    return `
      <div class="avatar-upload__wrapper">
        <label class="avatar-upload__label ${isLoading ? 'avatar-upload__label--loading' : ''}">
          <input type="file" 
            accept="image/*" 
            name="${this.props.name || 'avatar'}" 
            class="avatar-upload__input"
            ${isLoading ? 'disabled' : ''}> 

          ${isLoading ? `
            <div class="avatar-upload__loader">
              <div class="avatar-upload__spinner"></div>
              <span class="avatar-upload__loading-text">Загрузка...</span>
            </div>
          ` : ''}
          
          ${imgSrc ? `
            <img src="${imgSrc}" class="${imgClass} ${loadingClass}" alt="${this.props.imgAlt || 'Аватар'}">
          ` : `
            <span class="avatar-upload__text">${this.props.text || ''}</span>
          `}
        </label>
      </div>
    `;
  }
}

