# TODO

## Очень важно!
- [ ] Работающий минимальный проекта который можно здать заказчику
    - [ ] Работает регистрация/авторизация с помощью keycloak
        - [ ] Работает отправка писем по почте с помощью keycloak
- [x] Работает чат с продавцом
    - [x] работает frontend
        - [x] работает api создания чата
        - [x] работает api отправки сообщения
        - [x] работает api получения сообщений
        - [x] работает api получения списка чатов
        - [x] работает api получения списка пользователей
        - [x] работает api для получения непрочитанных сообщений
        - [x] работает api для отметки сообщений как прочитанных
        - [x] работает api для получения чатов в правильной полследовательности (сначала непрочитанные по новизне потом прочитанные по новизне)
- [x] Работает вывод товаров с изображениями
    - [x] работает frontend
        - [x] работает api получения списка товаров
        - [x] работает api получения списка типов древесины
        - [x] работает api получения фото товара
        - [x] работает api получения списка досок
    - [x] работает фильтрация товаров frontend
        - [x] работает api получения списка товаров по фильтрам (название, цена, тип древисины, продавец)
        - [x] работает api получения списка типов древесины
    - [x] унифицированы карточки товаров на главной странице и в каталоге
        - [x] создан единый компонент ProductCard с вариантами отображения
        - [x] карточки показывают реальные изображения товаров
        - [x] одинаковый дизайн и функциональность
        - [x] исправлен баг с undefined в URL изображений
    - [x] унифицированы карточки товаров на главной странице и в каталоге
        - [x] создан единый компонент ProductCard с вариантами отображения
        - [x] карточки показывают реальные изображения товаров
        - [x] одинаковый дизайн и функциональность
- [x] Работает создание товара с помощью AI
    - [x] работает frontend
        - [x] работает api создания товара
        - [x] работает api получения списка типов древесины
        - [x] работает анализ изображения досок
- [x] Работает админка
    - [x] работает frontend
        - [x] работает api получения списка покупателей (разделить пользователей на две группы на frontend )
        - [x] работает api получения списка продавцов (разделить пользователей на две группы на frontend )
        - [x] работает api удаления покупателей
        - [x] работает api удаления продавцов
        - [x] работает api получения списка товаров
        - [x] работает api удаления товаров
        - [x] работает api получения списка типов древесины
        - [x] работает api удаления типов древесины
        - [x] работает api получения списка досок
        - [x] работает api удаления досок
        - [x] работает api получения списка чатов
        - [x] работает api удаления чатов
        - [x] работает api получения списка сообщений
        - [x] работает api удаления сообщений
        - [x] работает api получения цен на типы древесины
        - [x] работает api удаления цен на типы древесины
        - [x] работает api получения списка изображений
        - [x] работает api удаления изображени
        - [x] работает api для импорта базы данных (сделать api)
        - [x] работает api для экспорта базы данных (сделать api)
    

## не очень важно
- [x] округление обьема досок везде
- [x] при создании товара анализирование изображения досок (изображение прыгает) - ИСПРАВЛЕНО: добавлены фиксированные размеры, плавная загрузка, убрано дублирование объема
- [x] тип древисины не указан. испрвить
- [x] не красивая главная страница покупателя
- [x] каталог товаров на главной красивее чем на странице каталог. улучшить дизайн страницы каталога 
- [x] Бекап БД с помощью интерфейса администратора Импорт/экспорт
- [ ] Реализовать вывод количества досок для определенного товара. 
- [ ] Интеграция с umami analitycs
- [ ] Локализовать страницу типов древесины у продавца
- [x] Убрать все для отладки и тестирования из frontend. 
- [ ] Сделать страницу sellers у покупателей более правильной (с пагинацией и более профессионально выглядещей)
- [ ] Сделать верстку более адаптивной на стнаницай каталога товаров (фильтрация по цене не влезает, пагинация не влезает, убрать все отличные от каталога вариаты вывода товаров для мобильных устройств (вместо этого лучше починить вид списка (сделать его адаптивным(кнопки уходят вправо и выглядит это прлохо)))) и header (он адаптивен но его меню находится под затемнением и из-за этого не кликабельно)

- [ ] внедрить данный код отслеживания для аналитики buyer frotend. <script defer src="https://umami.taruman.ru/script.js" data-website-id="f4c1331c-36dd-4e4d-ac70-7ed63555e69d"></script> 
- [ ] добавить iframe https://umami.taruman.ru/share/EXW7Hzbt1vQxAoLu/buyer.taruman.ru в панель администратора для вывода аналитики сайта 

- [ ] внедрить track events в сайт на действие отпрвки изображения на анализ (на странице анализатора). 
документация 
Using data attributes
To enable events, simply add a special data property to the element you want to track.

For example, you might have a button with the following code:

<button id="signup-button">Sign up</button>

Add a data property with the following format:

data-umami-event="{event-name}"

So your button element would now look like this:

<button id="signup-button" data-umami-event="Signup button">Sign up</button>

When the user clicks on this button, Umami will record an event named Signup button.

You can optionally pass along event_data with the data-umami-event-* annotation.

data-umami-event="Signup button"
data-umami-event-email="bob@aol.com"
data-umami-event-id="123"

The additional properties will result in { email: 'bob@aol.com', id: '123' } being recorded with the Signup button name.

Notes
All event data will be saved as a string using this method. If you want to save event data as numeric, dates, booleans, etc. use the JavaScript method below.
Other event listeners inside the element will not be triggered.
Using JavaScript
You can also record events manually using the window.umami object. To accomplish the same thing as the above data-* method, you can do:

const button = document.getElementById('signup-button');

button.onclick = () => umami.track('Signup button');

In this case, Umami will record an event named Signup button.

If you want to record dynamic data, see Tracker functions.