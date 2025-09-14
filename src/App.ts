import * as Handlebars from 'handlebars';
import { LoginPage } from './pages/login/index';
import { RegisterPage } from './pages/register/index';
import { Error404Page } from './pages/404/index';
import { Error500Page } from './pages/500/index';
import { MainPage } from './pages/main/index';
import { ProfilePage } from './pages/profile/index';
import { EditPasswordPage } from './pages/edit-password/index';
import { EditProfilePage } from './pages/edit-profile/index';
import { CheatPage } from './pages/allpages/index';

// Импорт и регистрация компонентов для регистрации в Handlebars
import Button from './components/Button';
import Input from './components/Input';
import Link from './components/Link';
import ProfileDataItem from './components/ProfileDataItem';

Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('Input', Input);
Handlebars.registerPartial('Link', Link);
Handlebars.registerPartial('ProfileDataItem', ProfileDataItem);

// Определение интерфейса для состояния приложения
interface AppState {
  currentPage: string;
}

// Определение интерфейса для страниц
interface PagesCollection {
  [key: string]: string;
}

export default class App {
  // Объявление свойств класса с типами
  private state: AppState;
  private appElement: HTMLElement;
  private Pages: PagesCollection;

  constructor() {
    // Инициализация состояния приложения
    this.state = {
      currentPage: 'main',
    };
    
    // Получение корневого элемента приложения
    const appElement = document.getElementById('app');
    if (!appElement) {
      throw new Error('Element with id "app" not found');
    }
    this.appElement = appElement;
    
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
  private init(): void {
    this.render(); // Первоначальный рендеринг
    this.setupEventListeners(); // Настройка обработчиков событий
  }

  // Настройка обработчиков событий
  private setupEventListeners(): void {
    // Обработка кликов по ссылкам с data-page атрибутом
    this.appElement.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[data-page]') as HTMLAnchorElement;
      if (link) {
        e.preventDefault(); // Предотвращаем переход по ссылке
        this.changePage(link.dataset.page as string); // Меняем страницу
      }
    });
  }

  // Метод для смены страницы
  private changePage(page: string): void {
    this.state.currentPage = page; // Обновляем состояние
    this.render(); // Перерисовываем интерфейс
  }

  // Основной метод рендеринга
  private render(): void {
    let template: HandlebarsTemplateDelegate;
    
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
  private safeRender(htmlString: string): void {
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