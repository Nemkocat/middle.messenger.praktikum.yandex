import App from './App.ts';
import registerComponent, { type BlockConstructable, type PropsBlock } from './core/registerComponent';

// Импорт компонентов
import Button from './views/components/Button';
import Input from './views/components/Input';
import Link from './views/components/Link';
import Avatar from './views/components/Avatar';
import ProfileDataItem from './views/components/ProfileDataItem';
import ChatList from './views/components/ChatList';
import ChatArea from './views/components/ChatArea';


// Регистрация компонентов в Handlebars
// Используем приведение к BlockConstructable<PropsBlock> для совместимости с registerComponent
registerComponent(Button as unknown as BlockConstructable<PropsBlock>);
registerComponent(Input as unknown as BlockConstructable<PropsBlock>);
registerComponent(Link as unknown as BlockConstructable<PropsBlock>);
registerComponent(Avatar as unknown as BlockConstructable<PropsBlock>);
registerComponent(ProfileDataItem as unknown as BlockConstructable<PropsBlock>);
registerComponent(ChatList as unknown as BlockConstructable<PropsBlock>);
registerComponent(ChatArea as unknown as BlockConstructable<PropsBlock>);

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    
    // Для удобства отладки: делаем роутер доступным глобально
    // В консоли браузера можно использовать: window.router.go("/messenger")
    const router = app.getRouter();
    if (router) {
        window.router = router;
    }
});

