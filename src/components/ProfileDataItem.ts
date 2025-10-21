import Block from "../core/block";

interface ProfileDataItemProps {
  class?: string;
  title: string;
  type?: string;
  value?: string;
  name?: string;
  editable?: boolean;
  onChange?: (e: Event) => void;
}

export default class ProfileDataItem extends Block {
  constructor(props: ProfileDataItemProps) {
    super("div", {
      ...props,
      
      className: `profile-data__info ${props.class || ""}`,
    });
  }

  render(): string {
    return `
      <span class="profile-data__info_title">{{title}}</span>
      <input class="profile-data__info_text" 
            type="{{type}}" 
            value="{{value}}" 
            name="{{name}}"
            {{#unless editable}}disabled{{/unless}}
            {{#unless editable}}readonly{{/unless}}>
    `;
  }
}

