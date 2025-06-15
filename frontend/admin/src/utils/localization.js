// Russian localization for Admin Frontend
// Русская локализация для административной панели

export const ADMIN_TEXTS = {
  // Navigation and Layout
  ADMIN_PANEL: 'Административная панель',
  ENTERPRISE_DASHBOARD: 'Корпоративная панель управления',
  DASHBOARD: 'Панель управления',
  USERS: 'Продавцы и Покупатели',
  BUYERS: 'Покупатели',
  SELLERS: 'Продавцы',
  PRODUCTS: 'Товары',
  ALL_PRODUCTS: 'Все товары',
  WOOD_TYPES: 'Типы древесины',
  PRICING: 'Ценообразование',
  WOODEN_BOARDS: 'Деревянные доски',
  MEDIA: 'Медиа',
  IMAGES: 'Изображения',
  COMMUNICATION: 'Коммуникации',
  CHAT_THREADS: 'Чат-потоки',
  MESSAGES: 'Сообщения',
  ANALYTICS: 'Аналитика',

  SYSTEM: 'Система',
  HEALTH_CHECK: 'Проверка состояния',
  SYSTEM_LOGS: 'Системные логи',
  SETTINGS: 'Настройки',

  // Common Actions
  ADD: 'Добавить',
  EDIT: 'Редактировать',
  DELETE: 'Удалить',
  SAVE: 'Сохранить',
  CANCEL: 'Отменить',
  REFRESH: 'Обновить',
  SEARCH: 'Поиск',
  FILTER: 'Фильтр',
  EXPORT: 'Экспорт',
  IMPORT: 'Импорт',
  CREATE: 'Создать',
  UPDATE: 'Обновить',
  VIEW: 'Просмотр',
  CLOSE: 'Закрыть',
  SUBMIT: 'Отправить',
  RESET: 'Сбросить',
  CLEAR: 'Очистить',
  CONFIRM: 'Подтвердить',
  BACK: 'Назад',
  NEXT: 'Далее',
  PREVIOUS: 'Предыдущий',
  LOADING: 'Загрузка...',
  SAVING: 'Сохранение...',
  DELETING: 'Удаление...',
  PROCESSING: 'Обработка...',

  // Entity Management
  ENTITY_MANAGEMENT: 'Управление сущностями',
  USER_MANAGEMENT: 'Управление продавцами и покупателями',
  PRODUCT_MANAGEMENT: 'Управление товарами',
  WOOD_TYPE_MANAGEMENT: 'Управление типами древесины',
  PRICE_MANAGEMENT: 'Управление ценами',
  CHAT_MANAGEMENT: 'Управление чатами',
  IMAGE_MANAGEMENT: 'Управление изображениями',

  // Form Fields
  ID: 'Идентификатор',
  NAME: 'Название',
  DESCRIPTION: 'Описание',
  TITLE: 'Заголовок',
  PRICE: 'Цена',
  VOLUME: 'Объем',
  WOOD_TYPE: 'Тип древесины',
  SELLER: 'Продавец',
  BUYER: 'Покупатель',
  ONLINE_STATUS: 'Статус онлайн',
  CREATED_AT: 'Дата создания',
  UPDATED_AT: 'Дата обновления',
  KEYCLOAK_UUID: 'UUID Keycloak',
  DELIVERY_POSSIBLE: 'Доставка возможна',
  PICKUP_LOCATION: 'Место самовывоза',
  PRICE_PER_M3: 'Цена за м³',
  HEIGHT: 'Высота',
  WIDTH: 'Ширина',
  LENGTH: 'Длина',
  IMAGE_PATH: 'Путь к изображению',
  PRODUCT_ID: 'ID товара',
  MESSAGE: 'Сообщение',
  THREAD_ID: 'ID потока',
  READ_STATUS: 'Статус прочтения',

  // UUID Field specific texts
  UUID_AUTO_GENERATE: 'будет сгенерирован автоматически',
  UUID_CLICK_TO_EDIT: 'Нажмите для ручного ввода',
  UUID_MANUAL_INPUT: 'Ручной ввод UUID',
  UUID_GENERATE_NEW: 'Сгенерировать новый',
  UUID_INVALID_FORMAT: 'Неверный формат UUID',
  UUID_FIELD_PLACEHOLDER: 'Введите UUID или оставьте пустым для автогенерации',
  UUID_CANCEL_EDIT: 'Отменить',
  UUID_CONFIRM_EDIT: 'Подтвердить',

  // Status Messages
  ONLINE: 'Онлайн',
  OFFLINE: 'Офлайн',
  ACTIVE: 'Активный',
  INACTIVE: 'Неактивный',
  AVAILABLE: 'Доступно',
  UNAVAILABLE: 'Недоступно',
  PICKUP_ONLY: 'Только самовывоз',
  DELIVERY_AVAILABLE: 'Доставка доступна',

  // Table Headers
  ACTIONS: 'Действия',
  STATUS: 'Статус',
  DATE: 'Дата',
  TYPE: 'Тип',
  TOTAL: 'Всего',
  COUNT: 'Количество',

  // Pagination
  PAGE: 'Страница',
  OF: 'из',
  ITEMS_PER_PAGE: 'на странице',
  SHOWING: 'Показано',
  TO: 'до',
  RESULTS: 'результатов',
  PREVIOUS_PAGE: 'Предыдущая',
  NEXT_PAGE: 'Следующая',

  // Search and Filter
  SEARCH_PLACEHOLDER: 'Введите для поиска...',
  FILTER_BY: 'Фильтр по',
  SORT_BY: 'Сортировать по',
  ASCENDING: 'По возрастанию',
  DESCENDING: 'По убыванию',
  NO_RESULTS: 'Результаты не найдены',
  CLEAR_FILTERS: 'Очистить фильтры',

  // Notifications
  SUCCESS: 'Успех',
  ERROR: 'Ошибка',
  WARNING: 'Предупреждение',
  INFO: 'Информация',
  OPERATION_SUCCESSFUL: 'Операция выполнена успешно',
  OPERATION_FAILED: 'Операция не выполнена',

  // Confirmation Dialogs
  CONFIRM_DELETE: 'Вы уверены, что хотите удалить этот элемент?',
  CONFIRM_BULK_DELETE: 'Вы уверены, что хотите удалить выбранные элементы?',
  CONFIRM_EXPORT: 'Экспортировать данные?',
  CONFIRM_IMPORT: 'Импортировать данные?',
  CANNOT_UNDO: 'Это действие нельзя отменить.',

  // Empty States
  NO_DATA: 'Нет данных',
  NO_ITEMS_FOUND: 'Элементы не найдены',
  NO_USERS: 'Продавцы и покупатели не найдены',
  NO_PRODUCTS: 'Товары не найдены',
  NO_WOOD_TYPES: 'Типы древесины не найдены',
  NO_PRICES: 'Цены не найдены',
  NO_CHATS: 'Чаты не найдены',
  NO_MESSAGES: 'Сообщения не найдены',
  NO_IMAGES: 'Изображения не найдены',

  // Wood Types Specific
  ADD_WOOD_TYPE: 'Добавить тип древесины',
  WOOD_TYPE_NAME: 'Название типа древесины',
  WOOD_TYPE_DESCRIPTION: 'Описание типа древесины',
  WOOD_TYPE_CREATED: 'Тип древесины создан',
  WOOD_TYPE_UPDATED: 'Тип древесины обновлен',
  WOOD_TYPE_DELETED: 'Тип древесины удален',

  // Price Management
  ADD_PRICE: 'Добавить цену',
  PRICE_CREATED: 'Цена создана',
  PRICE_UPDATED: 'Цена обновлена',
  PRICE_DELETED: 'Цена удалена',
  SELECT_WOOD_TYPE: 'Выберите тип древесины',

  // System Status
  BACKEND_STATUS: 'Статус бэкенда',
  SYSTEM_HEALTHY: 'Система работает нормально',
  SYSTEM_ERROR: 'Ошибка системы',
  CONNECTION_LOST: 'Соединение потеряно',
  RECONNECTING: 'Переподключение...',

  // Analytics
  TOTAL_USERS: 'Всего продавцов и покупателей',
  TOTAL_PRODUCTS: 'Всего товаров',
  TOTAL_SALES: 'Всего продаж',
  REVENUE: 'Выручка',
  GROWTH: 'Рост',
  STATISTICS: 'Статистика',
  OVERVIEW: 'Обзор',

  // Export/Import
  EXPORT_FORMAT: 'Формат экспорта',
  IMPORT_FILE: 'Файл для импорта',
  SELECT_FORMAT: 'Выберите формат',
  JSON_FORMAT: 'JSON формат',
  CSV_FORMAT: 'CSV формат',
  EXCEL_FORMAT: 'Excel формат',

  // Validation Messages
  FIELD_REQUIRED: 'Это поле обязательно',
  INVALID_EMAIL: 'Неверный формат email',
  INVALID_UUID: 'Неверный формат UUID',
  INVALID_URL: 'Неверный формат URL',
  INVALID_NUMBER: 'Неверный формат числа',
  MIN_LENGTH: 'Минимальная длина',
  MAX_LENGTH: 'Максимальная длина',

  // Date and Time
  TODAY: 'Сегодня',
  YESTERDAY: 'Вчера',
  THIS_WEEK: 'На этой неделе',
  THIS_MONTH: 'В этом месяце',
  LAST_UPDATED: 'Последнее обновление',
  CREATED_ON: 'Создано',
  UPDATED_ON: 'Обновлено',

  // Bulk Operations
  SELECT_ALL: 'Выбрать все',
  DESELECT_ALL: 'Снять выделение',
  SELECTED_ITEMS: 'Выбранные элементы',
  BULK_DELETE: 'Массовое удаление',
  BULK_EXPORT: 'Массовый экспорт',

  // Theme and UI
  LIGHT_THEME: 'Светлая тема',
  DARK_THEME: 'Темная тема',
  TOGGLE_SIDEBAR: 'Переключить боковую панель',
  TOGGLE_MENU: 'Переключить меню',
  FULL_SCREEN: 'Полный экран',
  EXIT_FULL_SCREEN: 'Выйти из полного экрана',

  // Empty State
  NO_DATA_AVAILABLE: 'Данные отсутствуют',
  NO_DATA_DESCRIPTION: 'В настоящее время нет данных для отображения.',

  // Export/Import
  WOOD_TYPE_PRICES: 'Цены на древесину',
  CHAT_MESSAGES: 'Сообщения чата',
  JSON_FORMAT_DESC: 'JavaScript Object Notation - структурированные данные',
  CSV_FORMAT_DESC: 'Значения, разделенные запятыми - совместимо с таблицами',
  EXPORT_DESCRIPTION: 'Экспорт системных данных для резервного копирования, анализа или миграции. Выберите сущности и формат для экспорта.',
  EXPORT_FORMAT_DETAILED: 'Формат экспорта',
  SELECT_ENTITIES_TO_EXPORT: 'Выберите сущности для экспорта',
  SELECT_ALL_ENTITIES: 'Выбрать все',
  DESELECT_ALL_ENTITIES: 'Отменить выбор',
  SELECTED: 'Выбрано',
  ENTITIES: 'сущностей',
  FORMAT: 'Формат',
  EXPORT_DATA: 'Экспорт данных',
  EXPORTING: 'Экспорт...',
  EXPORT_FAILED: 'Ошибка экспорта',
  EXPORT_RESULTS: 'Результаты экспорта',
  RECORDS: 'записей',
  RECORDS_EXPORTED: 'записей экспортировано',
  FILES_DOWNLOADED: 'Файлы загружены в папку загрузок по умолчанию.',
  EXPORT_INSTRUCTIONS: 'Инструкции по экспорту',
  JSON_FORMAT_INFO: 'Лучше всего подходит для резервного копирования данных и миграции системы. Сохраняет типы данных и структуру.',
  CSV_FORMAT_INFO: 'Лучше всего подходит для анализа в приложениях электронных таблиц, таких как Excel или Google Sheets.',
  BULK_EXPORT_INFO: 'Выберите несколько сущностей для их одновременного экспорта.',
  FILE_NAMING_INFO: 'Файлы автоматически именуются с указанием типа сущности и текущей даты.',
  EXPORT_NOTE: 'Большие наборы данных могут занять некоторое время для экспорта. Пожалуйста, будьте терпеливы во время процесса экспорта.',
  PLEASE_SELECT_ENTITY: 'Пожалуйста, выберите хотя бы одну сущность для экспорта.'
};

// Date formatting for Russian locale
export const DATE_FORMATS_RU = {
  SHORT: 'dd.MM.yyyy',
  MEDIUM: 'dd MMM yyyy',
  LONG: 'dd MMMM yyyy',
  FULL: 'EEEE, dd MMMM yyyy',
  TIME: 'HH:mm:ss',
  DATETIME: 'dd.MM.yyyy HH:mm:ss'
};

// Number formatting for Russian locale
export const NUMBER_FORMATS_RU = {
  DECIMAL_SEPARATOR: ',',
  THOUSANDS_SEPARATOR: ' ',
  CURRENCY_SYMBOL: '₽',
  CURRENCY_POSITION: 'after' // 1000 ₽
};

// Utility functions for Russian localization
export const formatDateRu = (date, format = 'DATETIME') => {
  if (!date) return '';

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Moscow'
  };

  switch (format) {
    case 'SHORT':
      return dateObj.toLocaleDateString('ru-RU');
    case 'MEDIUM':
      return dateObj.toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' });
    case 'LONG':
      return dateObj.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    case 'TIME':
      return dateObj.toLocaleTimeString('ru-RU');
    case 'DATETIME':
    default:
      return dateObj.toLocaleString('ru-RU', options);
  }
};

export const formatCurrencyRu = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 ₽';

  const number = parseFloat(amount);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(number);
};

export const formatNumberRu = (number, decimals = 2) => {
  if (number === null || number === undefined || isNaN(number)) return '0';

  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(parseFloat(number));
};

export default ADMIN_TEXTS;
