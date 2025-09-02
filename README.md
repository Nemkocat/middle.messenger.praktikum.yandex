МАКЕТ:

https://www.figma.com/design/jF5fFFzgGOxQeB4CmKWTiE/Chat_external_link?node-id=0-1&p=f&t=bvx5yhRNtRCKh9rh-0

ХОСТИНГ (NETIFY):

https://nemkocat-messenger.netlify.app/

ОПИСАНИЕ:

Чтож, собран начальный костяк мессенджера. Переход между экранов реализован с помощью case в App.js (там довольно подробные комментарии, с помощью него можно попасть на любую страницу). 
 
УСТАНОВКА:

- Скачиваем архив и разархивируем
- Открываем терминал
- Переходим в папку проекта
- На компьютере должен быть установлен Node.js для выполнения команд npm
- Выполняем команду: npm run build && npm run start 
- Открываем в браузере: http://localhost:3000/


ВСЕ СТРАНИЦЫ:

При заходе на сайт доступна сразу страница с ссылками на все страницы, ей не будет в итоговой версии проекта. 

Стандартное отображение проекта можно включить:

- Заходим в App.js
- В строке 30 меняем cheatPage на profile (currentPage: 'cheatPage', => currentPage: 'profile',)
- npm run build
- npm run start


