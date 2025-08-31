МАКЕТ:

https://www.figma.com/design/jF5fFFzgGOxQeB4CmKWTiE/Chat_external_link?node-id=0-1&p=f&t=bvx5yhRNtRCKh9rh-0

ОПИСАНИЕ:

Чтож, собран начальный костяк мессенджера. Переход между экранов реализован с помощью case в App.js (там довольно подробные комментарии, с помощью него можно попасть на любую страницу). 
 
УСТАНОВКА:

- Скачиваем архив и разархивируем
- Открываем терминал
- Нам нужно перейти в директорию: ../Practicum/vite-messenger
- На компьютере должен быть установлен Node.js
- Выполняем команду: npm run dev 
- Открываем в браузере: http://localhost:3000/


ВСЕ СТРАНИЦЫ:

- Заходим в App.js
- В строке 30 меняем profile на cheatPage (currentPage: 'profile', => currentPage: 'cheatPage',)
- npm run build
- npm run start
- кайфуем