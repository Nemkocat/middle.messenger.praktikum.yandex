import Block from "../core/block";

interface AvatarProps {
  class?: string;
  name?: string;
  img?: string;
  imgClass?: string;
  imgAlt?: string;
  text?: string;
  // onChange?: (e: Event) => void;
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
      },
    });
  }

  render(): string {
    return `
      <div class="avatar-upload__wrapper">
        <label class="avatar-upload__label">
          <input type="file" 
            accept="image/*" 
            name="{{name}}" 
            style="display: none;"
            class="avatar-upload__input"> 

          {{#if img}}
            <img src="{{img}}" class="{{imgClass}}" alt="{{imgAlt}}">
          {{else}}
            <span class="avatar-upload__text">{{text}}</span>
          {{/if}}
        </label>
      </div>
    `;
  }
}
