import App from './App.ts';
import registerComponent from './core/registerComponent';

// Импорт компонентов
import Button from './components/Button';
import Input from './components/Input';
import Link from './components/Link';
import Avatar from './components/Avatar';
import ProfileDataItem from './components/ProfileDataItem';
import ChatList from './components/ChatList';
import ChatArea from './components/ChatArea';


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

