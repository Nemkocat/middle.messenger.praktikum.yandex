import renderDOM from './core/renderDom';
import LoginPage from './pages/login/login.ts';
import RegisterPage from './pages/register/register.ts';
import Error404Page from './pages/404/404.ts';
import Error500Page from './pages/500/505.ts';
import MainPage from './pages/main/main.ts';
import ProfilePage from './pages/profile/profile.ts';
import EditPasswordPage from './pages/editPassword/editPassword.ts';
import EditProfilePage from './pages/editProfile/editProfile.ts';
import CheatPage from './pages/allpages/cheatPage.ts';
import mockChats from './pages/main/mockChats';

// Типы для TypeScript
import Block from './core/block';

// Ограничения для выбора страницы
type PageKey = 
    | 'login'
    | 'register'
    | 'error404'
    | 'error500'
    | 'main'
    | 'profile'
    | 'editProfile'
    | 'editPassword'
    | 'cheatPage';

// Состояние страницы приложения
type AppState = {
    currentPage: PageKey;
};



export default class App {
    private state: AppState;
    private appElement: HTMLElement | null;
    private currentPageInstance: Block | null = null;

    constructor() {
        // Инициализация состояния приложения
        this.state = {
            currentPage: 'main', 
            // Текущая активная страница, весь список доступных страниц внутри PageKey 
        };
        
        // Получение корневого элемента приложения
        this.appElement = document.getElementById('app');

        if (this.appElement === null) {
            throw new Error('App не найден, перезагрузите страницу');
        } 
    
        // Запуск инициализации приложения
        this.init();
    }

    // Инициализация приложения
    init() {
        this.render(); // Первоначальный рендеринг
        this.setupEventListeners(); // Настройка обработчиков событий
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        if (!this.appElement) return; // Проверка на null
        
        // Обработка кликов по ссылкам с data-page атрибутом
        this.appElement.addEventListener('click', (e) => {
            const target = e.target as HTMLElement; 
            const link = target.closest('a[data-page]') as HTMLAnchorElement | null;

            if (link && link.dataset.page) { // Проверка на всякий случай 0_0
                e.preventDefault(); // Предотвращаем переход по ссылке
                this.changePage(link.dataset.page as PageKey); // Меняем страницу, насильно приводим к типу PageKey потомучто выше использованы union типы, если будет ошибка, то будет выброшено исключение которое ловится в changePage
            }
        });
    }

    // Метод для смены страницы
    changePage(page: PageKey) {
        const validPages: PageKey[] = ['login', 'register', 'error404', 'error500', 'main', 'profile', 'editProfile', 'editPassword', 'cheatPage'];

        if (!validPages.includes(page)) { // Если такой странице нет кинет пользователя на 404
            this.state.currentPage = 'error404';
        } else {
            this.state.currentPage = page; // Обновляем состояние
        }
        
        this.render(); // Перерисовываем интерфейс
    }

    // Получение класса страницы по ключу
    private getPageClass(page: PageKey): new (props?: any) => Block {
        switch (page) {
            case 'login':
                return LoginPage;
            case 'register':
                return RegisterPage;
            case 'error404':
                return Error404Page;
            case 'error500':
                return Error500Page;
            case 'main':
                return MainPage;
            case 'profile':
                return ProfilePage;
            case 'editProfile':
                return EditProfilePage;
            case 'editPassword':
                return EditPasswordPage;
            case 'cheatPage':
                return CheatPage;
            default:
                return LoginPage;
        }
    }

    // Основной метод рендеринга
    render() {
        // Создаем экземпляр страницы
        const PageClass = this.getPageClass(this.state.currentPage);
        
        // Передаем данные чатов для MainPage
        const pageProps = this.state.currentPage === 'main' ? { chats: mockChats } : {};
        this.currentPageInstance = new PageClass(pageProps);
        
        // Монтируем страницу в DOM
        renderDOM(this.currentPageInstance);
    }
}

