import Handlebars from 'handlebars';
import { LoginPage } from './pages/login/index.js';
import { RegisterPage } from './pages/register/index.js';
import { Error404Page } from './pages/404/index.js';
import { Error500Page } from './pages/500/index.js';
import { MainPage } from './pages/main/index.js';
import { ProfilePage } from './pages/profile/index.js';
import { EditPasswordPage } from './pages/edit-password/index.js';
import { EditProfilePage } from './pages/edit-profile/index.js';
import { CheatPage } from './pages/allpages/index.js';

// Импорт компонентов для регистрации в Handlebars
import Button from './components/Button.js';
import Input from './components/Input.js';
import Link from './components/Link.js';
import ProfileDataItem from './components/ProfileDataItem.js';



// Регистрация компонентов как частичных шаблонов Handlebars
Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);
Handlebars.registerPartial('Link', Link);
Handlebars.registerPartial('ProfileDataItem', ProfileDataItem);

export default class App {
    constructor() {
        // Инициализация состояния приложения
        this.state = {
            currentPage: 'cheatPage', // Текущая активная страница, весь список доступных страниц внутри render в switch 
        };
        
        // Получение корневого элемента приложения
        this.appElement = document.getElementById('app');
        
        // Коллекция доступных страниц
        this.Pages = {
            LoginPage,
            RegisterPage,
            Error404Page,
            Error500Page,
            MainPage,
            ProfilePage,
            EditProfilePage,
            EditPasswordPage,
            CheatPage
        };
    
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
        // Обработка кликов по ссылкам с data-page атрибутом
        this.appElement.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-page]');
            if (link) {
                e.preventDefault(); // Предотвращаем переход по ссылке
                this.changePage(link.dataset.page); // Меняем страницу
            }
        });
    }

    // Метод для смены страницы
    changePage(page) {
        this.state.currentPage = page; // Обновляем состояние
        this.render(); // Перерисовываем интерфейс
    }

    // Основной метод рендеринга
    render() {
        let template;
        
        // Выбор шаблона в зависимости от текущей страницы
        switch (this.state.currentPage) {
            case 'login':
                template = Handlebars.compile(this.Pages.LoginPage);
                break;
            case 'register':
                template = Handlebars.compile(this.Pages.RegisterPage);
                break;
            case 'error404':
                template = Handlebars.compile(this.Pages.Error404Page);
                break;
            case 'error500':
                template = Handlebars.compile(this.Pages.Error500Page);
                break;
            case 'main':
                template = Handlebars.compile(this.Pages.MainPage);
                break;
            case 'profile':
                template = Handlebars.compile(this.Pages.ProfilePage);
                break;
            case 'editProfile':
                template = Handlebars.compile(this.Pages.EditProfilePage);
                break;
            case 'editPassword':
                template = Handlebars.compile(this.Pages.EditPasswordPage);
                break;
            case 'cheatPage':
                template = Handlebars.compile(this.Pages.CheatPage);
                break;
            default:
                template = Handlebars.compile(this.Pages.LoginPage);
        }

        // Безопасное обновление DOM
        this.safeRender(template({}));
    }

    // Безопасный метод рендеринга
    safeRender(htmlString) {
        // Создаём DocumentFragment для безопасного парсинга HTML
        const fragment = document.createRange().createContextualFragment(htmlString);
        
        // Очищаем основной контейнер
        while (this.appElement.firstChild) {
            this.appElement.removeChild(this.appElement.firstChild);
        }
        
        // Добавляем все элементы из фрагмента в основной контейнер
        this.appElement.appendChild(fragment);
    }
}

