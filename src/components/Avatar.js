export default `
<label class="avatar-upload {{class}}">
    <input type="file" 
        accept="image/*" 
        name="{{name}}" 
        style="display: none;"
        class="avatar-upload__input"> 

    {{#if img}}
        <img src="{{img}}" class="{{img-class}}" alt="{{img-alt}}">
    {{else}}
        <span class="avatar-upload__text">{{text}}</span>
    {{/if}}

</label>
`;