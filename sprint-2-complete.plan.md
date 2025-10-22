<!-- c7d75b0e-b53d-4067-a500-c5b8c5b226b9 dd5e5c4f-ce11-49df-bf18-6d005ff2b42d -->
# Завершение Sprint 2

## Текущее состояние

- ✅ TypeScript, Vite, Block/EventBus, структура проекта
- ✅ Validator класс создан со всеми правилами
- ❌ Валидация не подключена к формам (blur/submit)
- ❌ Нет HTTPTransport класса
- ❌ Нет ESLint, Stylelint, editorconfig
- ❌ README устаревший
- ❌ НЕ соответствует MVC архитектуре

## Порядок выполнения

### 1. Проверка и реализация MVC паттерна

**Проблема:** Текущий проект НЕ соответствует MVC архитектуре
- ❌ НЕТ Model классов для работы с данными
- ❌ НЕТ Controller классов для бизнес-логики  
- ✅ View есть (Block классы, страницы)

**Файлы:** Создать новые папки `src/models/`, `src/controllers/`

- Создать Model классы: User, Chat, Message
- Создать Controller классы: AuthController, ChatController
- Разделить ответственности между View, Model, Controller
- Использовать паттерн "Медиатор" для взаимодействия

### 2. Интеграция валидации в формы (по примеру преподавателя)

**Файлы:** `src/components/Input.ts`, все страницы с формами

- Добавить `formState` и `errors` в страницы (как в примере)
- Модифицировать Input для отображения ошибок
- Подключить валидацию в onChange событиях (как в примере)
- Подключить валидацию на blur событие
- Подключить валидацию на submit в формах:
- `src/pages/login/login.ts` - логин, пароль
- `src/pages/register/register.ts` - все поля регистрации
- `src/components/ChatArea.ts` - поле message
- `src/pages/editProfile/editProfile.ts` - настройки пользователя
- `src/pages/editPassword/editPassword.ts` - смена пароля

### 3. HTTPTransport класс

**Файл:** `src/core/HTTPTransport.ts`

Создать класс с методами:

- `get(url, options)` - с query string поддержкой
- `post(url, options)` - с body
- `put(url, options)` - с body
- `delete(url, options)` - с body
- Использовать XMLHttpRequest и Promise
- Добавить обработку timeout, headers

### 4. ESLint настройка

**Файлы:** `.eslintrc.json`, обновить `package.json`

- Установить зависимости: eslint, @typescript-eslint/parser, @typescript-eslint/eslint-plugin
- Создать конфигурацию на базе рекомендованных правил TypeScript
- Добавить скрипт `npm run lint` в package.json
- Исправить найденные ошибки линтинга

### 5. Stylelint настройка

**Файлы:** `.stylelintrc.json`, обновить `package.json`

- Установить зависимости: stylelint, stylelint-config-standard-scss
- Создать конфигурацию для SCSS файлов
- Добавить скрипт `npm run lint:styles` в package.json
- Исправить найденные ошибки стилей

### 6. EditorConfig

**Файл:** `.editorconfig`

Создать с базовыми настройками:

- indent_style, indent_size
- charset, end_of_line
- trim_trailing_whitespace
- insert_final_newline

### 7. Обновление README.md

**Файл:** `README.md`

Обновить информацию о:

- Функциональности (список чатов, валидация, компонентный подход)
- Технологиях (TypeScript, Vite, Handlebars, ESLint, Stylelint)
- Командах для разработки (dev, build, lint, lint:styles)
- Структуре проекта

## Важные детали

- Поле message уже называется "message" в ChatArea (строка 36)
- Валидация будет показывать ошибки визуально с красной рамкой
- ESLint/Stylelint будут с умеренными правилами для первого использования
- HTTPTransport не использует fetch/axios, только XHR

### To-dos

- [ ] Добавить отображение ошибок валидации в Input компонент
- [ ] Интегрировать валидацию во все формы (login, register, chatArea, editProfile, editPassword)
- [ ] Создать HTTPTransport класс с GET/POST/PUT/DELETE методами на XHR
- [ ] Настроить ESLint с TypeScript и исправить ошибки
- [ ] Настроить Stylelint для SCSS и исправить ошибки
- [ ] Создать .editorconfig файл
- [ ] Обновить README.md с актуальной информацией
