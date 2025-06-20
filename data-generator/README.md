# 🌟 Генератор живых данных (Версия 4.0)

Революционная система для создания **живых данных** с характером, эмоциями и персонализацией. Каждая запись рассказывает свою историю и имеет уникальные особенности, делая тестовые данные максимально реалистичными.

## 🚀 НОВИНКА в версии 4.0: Реальный YOLO анализ!

Теперь система использует **реальный YOLO анализ изображений** для создания товаров! Каждое изображение досок анализируется нейросетью, которая:
- 🔍 **Обнаруживает доски** на изображении
- 📏 **Рассчитывает объем** на основе реальных размеров
- 🎯 **Создает точные записи** досок в базе данных
- 💰 **Корректирует цены** на основе фактического объема

## 🚀 Быстрый старт

### Добавление данных (профиль large - 12,580+ записей)
```bash
make add-data
```

### Тестирование с малым профилем (957 записей)
```bash
cd data-generator && python demo_small.py
```

### Демонстрация живых данных ✨
```bash
make demo-alive-data
```

### Удаление всех синтетических данных
```bash
make rm-data
```

## 🎯 Профили генерации

Система поддерживает 4 профиля генерации:

| Профиль | Записей | Описание |
|---------|---------|----------|
| **small** | ~957 | Быстрое тестирование |
| **medium** | ~3,870 | Разработка |
| **large** | ~12,580 | Полное тестирование |
| **enterprise** | ~39,950 | Нагрузочное тестирование |

## 📋 Что создается (профиль large)

Система генерирует следующие данные в правильном порядке (учитывая зависимости):

1. **🌲 Типы древесины** (30 записей)
   - Популярные: Сосна, Дуб, Береза, Ель, Лиственница
   - Ценные: Орех, Вишня, Груша, Яблоня, Черешня
   - Экзотические: Венге, Тик, Махагон, Зебрано, Палисандр
   - Региональные: Карагач, Граб, Ольха, Ива, Рябина
   - Специальные: Дуб мореный, Береза карельская и др.

2. **💰 Цены на древесину** (600 записей)
   - Исторические цены за последние 2 года
   - Реалистичные диапазоны от 10,000₽ до 500,000₽ за м³
   - Сезонные колебания цен

3. **👥 Покупатели** (500 записей)
   - Уникальные UUID и Keycloak UUID
   - Случайный онлайн статус
   - Региональное распределение

4. **🏪 Продавцы** (150 записей)
   - Уникальные UUID и Keycloak UUID
   - Случайный онлайн статус
   - Привязка к регионам

5. **📦 Товары с YOLO анализом** (2,500 записей) 🆕
   - **🤖 Реальный анализ изображений** через YOLO нейросеть
   - **📏 Точные объемы** на основе обнаруженных досок
   - **💰 Корректные цены** пересчитанные по фактическому объему
   - 30+ типов названий (доска, брус, вагонка, террасная доска и др.)
   - 18 вариантов детальных описаний
   - Адреса самовывоза по 32 городам России
   - Привязка к продавцам и типам древесины

6. **🖼️ Изображения с анализом** (2,500 записей) 🆕
   - **Автоматическая обработка** через YOLO backend
   - **Сохранение в правильной структуре** папок
   - **Привязка к товарам** через единый процесс создания

7. **🪵 Записи досок из YOLO** (переменное количество) 🆕
   - **Реальные данные** от нейросети
   - **Точные размеры и координаты** обнаруженных досок
   - **Автоматическое создание** на основе анализа изображений

8. **💬 Потоки чата** (800 записей)
   - Связывают покупателей и продавцов
   - Реалистичное распределение

9. **📝 Сообщения в чатах** (8,000 записей)
   - 40+ шаблонов сообщений покупателей
   - 30+ шаблонов ответов продавцов
   - Реалистичные диалоги с чередованием
   - Временные метки за последние 90 дней

## ⚙️ Конфигурация

Скопируйте `.env.example` в `.env` и настройте под свои нужды:

```bash
cp .env.example .env
```

### Основные настройки:

```env
# Профиль генерации
GENERATION_PROFILE=large  # small, medium, large, enterprise

# API настройки
API_BASE_URL=http://localhost:8000/api/v1
REQUEST_TIMEOUT=60
MAX_RETRIES=3
RETRY_DELAY=2

# YOLO сервис настройки (новое в v4.0!)
YOLO_SERVICE_URL=http://localhost:8001
YOLO_REQUEST_TIMEOUT=120

# Настройки логирования
LOG_LEVEL=INFO
SAVE_GENERATION_REPORT=true
```

### Профили генерации:

- **small**: Быстрое тестирование (~957 записей)
- **medium**: Разработка (~3,870 записей)
- **large**: Полное тестирование (~12,580 записей)
- **enterprise**: Нагрузочное тестирование (~39,950 записей)

## 🆕 Новые возможности

### 🚀 Прорыв в версии 4.0 - РЕАЛЬНЫЙ YOLO АНАЛИЗ:

- **🤖 Нейросетевой анализ**: Каждое изображение анализируется реальной YOLO моделью
- **📏 Точные измерения**: Объем рассчитывается на основе обнаруженных досок
- **🎯 Автоматическое создание**: Товары, изображения и доски создаются одновременно
- **💰 Корректные цены**: Цены пересчитываются на основе фактического объема
- **⚡ Асинхронная обработка**: Быстрая обработка изображений через aiohttp
- **🔍 Проверка YOLO сервиса**: Автоматическая проверка доступности AI backend

### 🌟 Революция в версии 3.0 - ЖИВЫЕ ДАННЫЕ:

- **✨ Эмоциональные товары**: Названия с характером `[ХИТ ПРОДАЖ]` `🏆 VIP`
- **💝 Персональные истории**: Сообщения с личными деталями "(строю дом для семьи)"
- **🎭 Характеры продавцов**: "Работаю с деревом 20 лет, каждую доску знаю лично!"
- **🏠 Живые адреса**: "(красное здание)", "(парковка есть)", "(звонить заранее)"
- **📖 Истории товаров**: "Эту партию привезли прямо с лесопилки в Карелии"
- **💰 Сезонные цены**: Реалистичные колебания +5-25% по сезонам
- **🎨 Эмоции древесины**: "особенно теплая", "благородная", "уютная"

### ✨ Улучшения версии 2.0:

- **🎯 Профили генерации**: 4 готовых профиля для разных сценариев
- **🔄 Retry логика**: Автоматические повторы при сбоях сети
- **📊 Детальная статистика**: Время выполнения, успешность запросов
- **🌲 Больше древесины**: 33 типа вместо 12 (включая экзотические)
- **📝 Богатые шаблоны**: 30+ типов товаров, 18 описаний, 70+ сообщений
- **🏥 Проверка API**: Автоматическая проверка доступности backend
- **📈 Отчеты**: JSON отчеты о генерации с полной статистикой
- **🌍 Региональность**: Учет региональных особенностей
- **📏 Больше размеров**: 54 размера досок, 26 длин

## 📁 Структура файлов

```
data-generator/
├── generate_data.py         # Основной скрипт генерации
├── remove_data.py           # Скрипт удаления данных
├── data_templates.py        # Шаблоны и константы
├── test_generator.py        # Тесты системы
├── test_data_structure.py   # Тесты структуры данных
├── requirements.txt         # Python зависимости
├── .env                     # Конфигурация
├── generated_uuids.json     # UUID созданных записей (создается автоматически)
├── uploaded_images/         # Папка с загруженными изображениями (создается автоматически)
└── README.md               # Эта документация
```

## 🔧 Технические детали

### Зависимости
- `requests` - HTTP запросы к API
- `faker` - Генерация реалистичных данных
- `python-dotenv` - Загрузка переменных окружения
- `tqdm` - Прогресс-бары

### Особенности API
Система учитывает особенности API WoodenBoardsShop:
- Поле `neme` вместо `name` в WoodType (сохранена опечатка)
- Поле `descrioption` вместо `description` в Product (сохранена опечатка)
- Поле `lenght` вместо `length` в WoodenBoard (сохранена опечатка)

### Порядок создания/удаления
Данные создаются и удаляются в правильном порядке с учетом внешних ключей:

**Создание:** WoodType → WoodTypePrice → Buyer/Seller → Product → Image → WoodenBoard → ChatThread → ChatMessage

**Удаление:** ChatMessage → ChatThread → WoodenBoard → Image → Product → Buyer/Seller → WoodTypePrice → WoodType

### Отслеживание UUID
Все созданные UUID сохраняются в `generated_uuids.json` для возможности полного удаления данных.

## 🛠️ Использование

### Ручной запуск
```bash
cd data-generator

# Установка зависимостей
pip install -r requirements.txt

# Тестирование системы
python test_generator.py

# Генерация данных
python generate_data.py

# Удаление данных
python remove_data.py
```

### Обработка ошибок
- Система продолжает работу при единичных ошибках
- Прогресс сохраняется после каждого этапа
- При прерывании можно продолжить с места остановки

### Требования
- Запущенный backend API на localhost:8000
- **Запущенный YOLO сервис на localhost:8001** (новое в v4.0!)
- Доступ к папке с изображениями benchmarks
- Python 3.8+

### Новые зависимости (v4.0):
- `aiohttp` - Асинхронные HTTP запросы для YOLO анализа
- `aiofiles` - Асинхронная работа с файлами

## 📊 Статистика данных

### Профиль Large (по умолчанию):
- **~12,580 записей** в общей сложности
- **33 типа древесины** (включая экзотические)
- **2,500 товаров** с реалистичными ценами
- **8,000 сообщений** в чатах
- **Реалистичные связи** между всеми сущностями
- **Правдоподобные данные** на русском языке
- **Изображения досок** из реальных benchmarks
- **Исторические данные** за 2 года

### Сравнение профилей:

| Профиль | Всего записей | Товаров | Сообщений | Время генерации* |
|---------|---------------|---------|-----------|------------------|
| Small | ~957 | 200 | 600 | ~2-3 мин |
| Medium | ~3,870 | 800 | 2,400 | ~8-10 мин |
| Large | ~12,580 | 2,500 | 8,000 | ~25-30 мин |
| Enterprise | ~39,950 | 8,000 | 25,000 | ~60-90 мин |

*Время указано приблизительно и зависит от производительности системы и сети.

Все данные можно легко удалить одной командой `make rm-data`.
