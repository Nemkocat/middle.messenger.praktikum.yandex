import { Route } from "./route";
import Block from "./block";
import AuthController from "../controllers/AuthController";

type BlockConstructor = new (props?: any) => Block; // eslint-disable-line @typescript-eslint/no-explicit-any
type BlockFactory = () => Block;

// Маршруты, которые доступны без авторизации
const PUBLIC_ROUTES = ['/', '/sign-up'];

export class Router {
  private static __instance: Router;
  private routes: Route[] = [];
  private history: History = window.history;
  private _currentRoute: Route | null = null;
  private _rootQuery: string = "";

  constructor(rootQuery: string) {
    if (Router.__instance) {
      return Router.__instance;
    }

    this._rootQuery = rootQuery;
    Router.__instance = this;
  }

  use(pathname: string, block: BlockConstructor | BlockFactory): this {
    const route = new Route(pathname, block, { rootQuery: this._rootQuery });
    this.routes.push(route);
    return this;
  }

  start() {
    // Используем addEventListener вместо onpopstate для более надежной работы
    window.addEventListener("popstate", (event: PopStateEvent) => {
      this._onRoute(window.location.pathname);
    });

    // Проверяем текущий URL при инициализации
    this._onRoute(window.location.pathname);
  }

  async _onRoute(pathname: string) {
    const route = this.getRoute(pathname);

    if (!route) {
      // Если маршрут не найден, можно перенаправить на 404
      const errorRoute = this.getRoute("/404");
      if (errorRoute) {
        if (this._currentRoute && this._currentRoute !== errorRoute) {
          this._currentRoute.leave();
        }
        this._currentRoute = errorRoute;
        errorRoute.render();
      }
      return;
    }

    // Проверка авторизации
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthenticated = await AuthController.checkAuth();

    // Если пользователь не авторизован и пытается зайти на защищенный маршрут
    if (!isAuthenticated && !isPublicRoute) {
      this.go('/');
      return;
    }

    // Если пользователь авторизован и пытается зайти на публичные маршруты (логин/регистрация)
    if (isAuthenticated && isPublicRoute) {
      this.go('/messenger');
      return;
    }

    // Проверяем, что это действительно новый маршрут
    if (this._currentRoute && this._currentRoute !== route) {
      this._currentRoute.leave();
    }

    // Всегда рендерим маршрут, даже если он тот же самый
    // Это гарантирует, что разметка будет отображена правильно
      this._currentRoute = route;
      route.render();
  }

  go(pathname: string) {
    this.history.pushState({}, "", pathname);
    this._onRoute(pathname);
  }

  back() {
    this.history.back();
  }

  forward() {
    this.history.forward();
  }

  getRoute(pathname: string): Route | undefined {
    return this.routes.find((route) => route.match(pathname));
  }

  getCurrentRoute(): Route | null {
    return this._currentRoute;
  }

  // Метод для получения глобального экземпляра роутера
  static getInstance(): Router | null {
    return Router.__instance || null;
  }
}

