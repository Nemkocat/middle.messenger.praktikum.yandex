export default `
<div class="profile-data__info {{class}}">
    <span class="profile-data__info_title">{{title}}</span>
    <input class="profile-data__info_text" 
           type="{{type}}" 
           value="{{value}}" 
           name="{{name}}"
           {{#unless editable}}disabled{{/unless}}
           {{#unless editable}}readonly{{/unless}}>
</div>
`;

