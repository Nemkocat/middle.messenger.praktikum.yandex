# Детальное объяснение роутинга

## Архитектура роутинга

Роутинг состоит из двух основных классов:
1. **Route** - управляет одним маршрутом
2. **Router** - управляет всеми маршрутами приложения

---

## 1. Класс Route (`src/core/route.ts`)

### Назначение
Класс `Route` отвечает за один конкретный маршрут (например, `/login` или `/profile`).

### Основные свойства:
- `_pathname` - путь маршрута (например, "/login")
- `_blockClass` - класс страницы (если передали класс)
- `_blockFactory` - функция-фабрика (если передали функцию)
- `_block` - экземпляр страницы (создается при первом рендере)
- `_props` - свойства маршрута (rootQuery - селектор контейнера)

### Методы:

#### `constructor(pathname, view, props)`
Создает новый маршрут. Определяет, передан класс или фабрика:
- **Класс**: `new LoginPage()` - для простых страниц
- **Фабрика**: `() => new MainPage({ chatController })` - для страниц, которым нужны props

#### `match(pathname)`
Проверяет, соответствует ли переданный путь этому маршруту.
```typescript
route.match("/login") // true, если маршрут для "/login"
route.match("/profile") // false
```

#### `render()`
Рендерит страницу:
1. Если блок еще не создан - создает его (через класс или фабрику)
2. Вызывает `renderDOM()` для монтирования в DOM
3. Если блок уже создан - просто показывает его (`show()`)

#### `leave()`
Скрывает страницу при переходе на другой маршрут:
```typescript
this._block.hide() // вызывает метод hide() у Block
```

#### `navigate(pathname)`
Навигация на этот маршрут (если путь совпадает).

---

## 2. Класс Router (`src/core/router.ts`)

### Назначение
Главный класс, управляющий всеми маршрутами приложения. Использует паттерн **Singleton** (один экземпляр на все приложение).

### Основные свойства:
- `routes: Route[]` - массив всех зарегистрированных маршрутов
- `_currentRoute: Route | null` - текущий активный маршрут
- `_rootQuery: string` - селектор корневого элемента (например, "#app")
- `history: History` - объект History API браузера

### Методы:

#### `constructor(rootQuery)`
Создает роутер. Использует Singleton:
```typescript
if (Router.__instance) {
  return Router.__instance; // Возвращает существующий экземпляр
}
Router.__instance = this; // Сохраняет новый экземпляр
```

#### `use(pathname, block)`
Регистрирует новый маршрут:
```typescript
router.use("/login", LoginPage) // Простой класс
router.use("/messenger", () => new MainPage({ chatController })) // Фабрика
```

Возвращает `this` для цепочки вызовов (method chaining):
```typescript
router
  .use("/", LoginPage)
  .use("/register", RegisterPage)
  .use("/profile", ProfilePage)
```

#### `start()`
Запускает роутер:
1. Настраивает обработчик `onpopstate` для кнопок "Назад"/"Вперед"
2. Вызывает `_onRoute()` для текущего URL

#### `_onRoute(pathname)`
Обрабатывает переход на маршрут:
1. Ищет маршрут по пути
2. Если не найден - показывает 404
3. Скрывает текущий маршрут (`leave()`)
4. Показывает новый маршрут (`render()`)

#### `go(pathname)`
Программный переход на маршрут:
```typescript
router.go("/profile") // Переходит на страницу профиля
```
1. Обновляет URL через `history.pushState()`
2. Вызывает `_onRoute()`

#### `back()` и `forward()`
Навигация назад/вперед через History API:
```typescript
router.back() // Кнопка "Назад" в браузере
router.forward() // Кнопка "Вперед"
```

#### `getRoute(pathname)`
Находит маршрут по пути:
```typescript
const route = router.getRoute("/login") // Возвращает Route для "/login"
```

#### `getInstance()`
Статический метод для получения глобального экземпляра роутера:
```typescript
const router = Router.getInstance() // Используется в компонентах
```

---

## 3. Интеграция в App.ts

### Инициализация:
```typescript
constructor() {
  this.chatController = new ChatController();
  this.router = new Router("#app"); // Создает роутер с селектором "#app"
  this.setupRoutes(); // Настраивает маршруты
  this.router.start(); // Запускает роутер
}
```

### Настройка маршрутов:
```typescript
private setupRoutes() {
  this.router
    .use("/", LoginPage)              // Главная → LoginPage
    .use("/login", LoginPage)          // /login → LoginPage
    .use("/register", RegisterPage)    // /register → RegisterPage
    .use("/messenger", () => {         // /messenger → MainPage (через фабрику)
      const mainPage = new MainPage({ chatController: this.chatController });
      this.chatController.setView(mainPage);
      return mainPage;
    })
    .use("/profile", ProfilePage)      // /profile → ProfilePage
    .use("/profile/edit", EditProfilePage)
    .use("/profile/password", EditPasswordPage)
    .use("/404", Error404Page)
    .use("/500", Error500Page);
}
```

**Почему для MainPage используется фабрика?**
- MainPage нужен `chatController` в props
- Фабрика позволяет передать контроллер при создании страницы
- Также устанавливается связь между контроллером и view

---

## 4. Компонент Link

### Обновления:
Компонент `Link` теперь работает с роутером вместо старой системы `data-page`.

### Как работает:
1. При клике вызывает `e.preventDefault()` (отменяет стандартный переход)
2. Получает роутер через `Router.getInstance()`
3. Преобразует `page` в путь через `getPathFromPage()`
4. Вызывает `router.go(path)` для перехода

### Маппинг page → path:
```typescript
login → "/login"
register → "/register"
main → "/messenger"
profile → "/profile"
editProfile → "/profile/edit"
editPassword → "/profile/password"
error404 → "/404"
error500 → "/500"
```

### Использование:
```typescript
// Через page (старый способ, все еще работает)
new Link({ page: "main", text: "Чаты" })

// Через path (новый способ)
new Link({ path: "/messenger", text: "Чаты" })
```

---

## 5. Жизненный цикл навигации

### Пример: переход с `/login` на `/messenger`

1. **Пользователь кликает на ссылку**:
   ```typescript
   Link → router.go("/messenger")
   ```

2. **Router.go()**:
   ```typescript
   history.pushState({}, "", "/messenger") // Обновляет URL
   _onRoute("/messenger") // Обрабатывает переход
   ```

3. **Router._onRoute()**:
   ```typescript
   const route = getRoute("/messenger") // Находит маршрут
   _currentRoute.leave() // Скрывает LoginPage (hide())
   _currentRoute = route // Обновляет текущий маршрут
   route.render() // Показывает MainPage
   ```

4. **Route.render()**:
   ```typescript
   if (!this._block) {
     this._block = this._blockFactory() // Создает MainPage
     renderDOM(this._block) // Монтирует в DOM
   } else {
     this._block.show() // Просто показывает
   }
   ```

---

## 6. Обработка 404

Если маршрут не найден:
```typescript
if (!route) {
  const errorRoute = this.getRoute("/404")
  if (errorRoute) {
    _currentRoute.leave() // Скрывает текущую страницу
    _currentRoute = errorRoute
    errorRoute.render() // Показывает 404
  }
}
```

---

## 7. История браузера

### Кнопки "Назад"/"Вперед":
```typescript
window.onpopstate = (event) => {
  _onRoute(event.currentTarget.location.pathname)
}
```

При нажатии кнопок браузера автоматически вызывается `_onRoute()` с новым URL.

---

## Как посмотреть другие страницы

### Способ 1: Через URL в браузере
Просто введите в адресной строке:
- `http://localhost:3000/messenger` - главная страница с чатами
- `http://localhost:3000/profile` - профиль
- `http://localhost:3000/register` - регистрация
- `http://localhost:3000/profile/edit` - редактирование профиля
- `http://localhost:3000/profile/password` - смена пароля
- `http://localhost:3000/404` - страница ошибки 404
- `http://localhost:3000/500` - страница ошибки 500

### Способ 2: Через консоль браузера
Откройте DevTools (F12) и в консоли:
```javascript
// Получить роутер
const router = window.__router__; // Если экспортирован глобально
// Или через Router.getInstance() в коде

// Перейти на страницу
router.go("/messenger");
router.go("/profile");
```

### Способ 3: Через компоненты Link
Используйте компонент Link в ваших страницах:
```typescript
new Link({
  page: "main", // или path: "/messenger"
  text: "Перейти к чатам"
})
```

### Способ 4: Программно в коде
```typescript
import { Router } from './core/router';

const router = Router.getInstance();
if (router) {
  router.go("/messenger");
}
```

---

## Все изменения в проекте

### Созданные файлы:
1. **`src/core/route.ts`** - класс Route
2. **`src/core/router.ts`** - класс Router

### Измененные файлы:
1. **`src/App.ts`**:
   - Удалена старая логика смены страниц через `changePage()`
   - Добавлена инициализация роутера
   - Настроены все маршруты через `setupRoutes()`
   - Удалены методы `render()`, `changePage()`, `setupEventListeners()`

2. **`src/views/components/Link.ts`**:
   - Добавлена интеграция с роутером
   - Добавлен метод `getPathFromPage()` для преобразования page → path
   - Обработчик клика теперь использует `router.go()`

### Удаленные части:
- Старая система навигации через `data-page` атрибуты
- Метод `changePage()` в App.ts
- Ручной рендеринг страниц через `renderDOM()`

---

## Преимущества новой системы

1. **URL-навигация**: Теперь URL в браузере соответствует страницам
2. **История браузера**: Работают кнопки "Назад"/"Вперед"
3. **Прямые ссылки**: Можно открыть любую страницу напрямую по URL
4. **Чистый код**: Разделение ответственности (Route, Router, App)
5. **Масштабируемость**: Легко добавлять новые маршруты

