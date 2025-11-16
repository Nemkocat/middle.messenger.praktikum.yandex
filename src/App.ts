import { Router } from './core/router';
import LoginPage from './views/pages/login/login.ts';
import RegisterPage from './views/pages/register/register.ts';
import Error404Page from './views/pages/404/404.ts';
import Error500Page from './views/pages/500/505.ts';
import MainPage from './views/pages/main/main.ts';
import ProfilePage from './views/pages/profile/profile.ts';
import EditPasswordPage from './views/pages/editPassword/editPassword.ts';
import EditProfilePage from './views/pages/editProfile/editProfile.ts';
// import CheatPage from './views/pages/allpages/cheatPage.ts';
import { ChatController } from './controllers/ChatController';
import AuthController from './controllers/AuthController';

export default class App {
    private router: Router;
    private chatController: ChatController;

    constructor() {
        // Инициализация Controller'ов
        this.chatController = new ChatController();
        
        // Инициализация роутера
        this.router = new Router("#app");
        
        // Устанавливаем роутер в AuthController
        AuthController.setRouter(this.router);
        
        // Настройка маршрутов
        this.setupRoutes();
        
        // Запуск роутера
        this.router.start();
    }

    // Настройка маршрутов согласно ТЗ
    private setupRoutes() {
        this.router
            .use("/", () => new LoginPage({}))                    // / — страница входа
            .use("/sign-up", () => new RegisterPage({}))           // /sign-up — страница регистрации
            .use("/messenger", () => {               // /messenger — чат
                const mainPage = new MainPage({ chatController: this.chatController });
                this.chatController.setView(mainPage);
                return mainPage;
            })
            .use("/settings", ProfilePage)           // /settings — настройки профиля пользователя
            .use("/edit-profile", EditProfilePage)   // Дополнительные страницы
            .use("/profile/password", EditPasswordPage)
            .use("/500", Error500Page)
            .use("/404", Error404Page);
        
        // Для страницы 404 используем catch-all
        // Если маршрут не найден, роутер автоматически перенаправит на /404
    }

    // Метод для получения роутера (может понадобиться для компонентов)
    getRouter(): Router {
        return this.router;
    }
}

