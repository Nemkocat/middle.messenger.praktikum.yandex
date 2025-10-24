import Block from "../../core/block";

interface ProfileDataItemProps {
  class?: string;
  title: string;
  type?: string;
  value?: string;
  name?: string;
  editable?: boolean;
  error?: string;
  onChange?: (e: Event) => void;
  onBlur?: (e: Event) => void;
}

export default class ProfileDataItem extends Block {
  constructor(props: ProfileDataItemProps) {
    super("div", {
      ...props,
      className: `profile-data__info ${props.class || ""}`,
      events: {
        change: props.onChange,
        blur: props.onBlur,
      },
    });
  }

  render(): string {
    const errorClass = this.props.error ? "profile-data__info_text--error" : "";
    const inputClass = `profile-data__info_text ${errorClass}`.trim();
    
    return `
      <span class="profile-data__info_title">{{title}}</span>
      <input class="${inputClass}" 
            type="{{type}}" 
            value="{{value}}" 
            name="{{name}}"
            {{#unless editable}}disabled{{/unless}}
            {{#unless editable}}readonly{{/unless}}>
      ${this.props.error ? `<div class="profile-data__error">{{error}}</div>` : ""}
    `;
  }
}

