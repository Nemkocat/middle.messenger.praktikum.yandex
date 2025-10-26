import App from './App.ts';
import registerComponent from './core/registerComponent';

// Импорт компонентов
import Button from './views/components/Button';
import Input from './views/components/Input';
import Link from './views/components/Link';
import Avatar from './views/components/Avatar';
import ProfileDataItem from './views/components/ProfileDataItem';
import ChatList from './views/components/ChatList';
import ChatArea from './views/components/ChatArea';


// Регистрация компонентов в Handlebars
registerComponent(Button);
registerComponent(Input);
registerComponent(Link);
registerComponent(Avatar);
registerComponent(ProfileDataItem);
registerComponent(ChatList);
registerComponent(ChatArea);

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

