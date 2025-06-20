#!/usr/bin/env python3
"""
Генератор синтетических данных для WoodenBoardsShop
"""

import asyncio
import json
import logging
import os
import random
import shutil
import time
from datetime import datetime, timedelta
from pathlib import Path
from uuid import uuid4
import requests
from faker import Faker
from tqdm import tqdm
from dotenv import load_dotenv

from data_templates import (
    WOOD_TYPES, WOOD_PRICE_RANGES, PRODUCT_TITLE_TEMPLATES,
    PRODUCT_DESCRIPTIONS, PICKUP_CITIES, STREET_TYPES, STREET_NAMES,
    CHAT_MESSAGES_BUYER, CHAT_MESSAGES_SELLER, BOARD_DIMENSIONS, BOARD_LENGTHS,
    REGIONAL_WOOD_PREFERENCES, PRODUCT_STORIES, WOOD_EMOTIONS,
    SEASONAL_MOODS, SELLER_PERSONALITIES
)

# Загружаем переменные окружения
load_dotenv()

class DataGenerator:
    def __init__(self):
        self.fake = Faker('ru_RU')
        self.api_base = os.getenv('API_BASE_URL', 'http://localhost:8000/api/v1')
        self.timeout = int(os.getenv('REQUEST_TIMEOUT', '60'))
        self.max_retries = int(os.getenv('MAX_RETRIES', '3'))
        self.retry_delay = int(os.getenv('RETRY_DELAY', '2'))

        # Настройка логирования
        log_level = os.getenv('LOG_LEVEL', 'INFO')
        logging.basicConfig(
            level=getattr(logging, log_level),
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('data_generation.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)

        # Определяем профиль генерации
        self.profile = os.getenv('GENERATION_PROFILE', 'large').lower()
        self.logger.info(f"Используется профиль генерации: {self.profile}")

        # Счетчики записей в зависимости от профиля
        self.counts = self._get_counts_for_profile()
        
        # Хранилище созданных UUID
        self.generated_data = {
            'wood_types': [],
            'wood_type_prices': [],
            'buyers': [],
            'sellers': [],
            'products': [],
            'images': [],
            'wooden_boards': [],
            'chat_threads': [],
            'chat_messages': []
        }
        
        # Настройки изображений
        self.images_source = Path(os.getenv('IMAGES_SOURCE_DIR',
            '../backend/prosto_board_volume-main/utils/benchmarks/input/wooden_boards_images'))
        # Изменяем путь для соответствия структуре backend
        self.images_upload_base = Path(os.getenv('IMAGES_UPLOAD_DIR', '../backend/backend/uploads'))

        # Создаем базовую папку для загруженных изображений
        self.images_upload_base.mkdir(exist_ok=True)

        # Статистика генерации
        self.stats = {
            'start_time': None,
            'end_time': None,
            'total_requests': 0,
            'failed_requests': 0,
            'retries_used': 0
        }

    def _get_counts_for_profile(self):
        """Возвращает счетчики записей для выбранного профиля"""
        profiles = {
            'small': {
                'wood_types': int(os.getenv('SMALL_WOOD_TYPES_COUNT', '12')),
                'wood_type_prices': int(os.getenv('SMALL_WOOD_TYPE_PRICES_COUNT', '80')),
                'buyers': int(os.getenv('SMALL_BUYERS_COUNT', '50')),
                'sellers': int(os.getenv('SMALL_SELLERS_COUNT', '15')),
                'products': int(os.getenv('SMALL_PRODUCTS_COUNT', '200')),
                'chat_threads': int(os.getenv('SMALL_CHAT_THREADS_COUNT', '80')),
                'chat_messages': int(os.getenv('SMALL_CHAT_MESSAGES_COUNT', '600'))
            },
            'medium': {
                'wood_types': int(os.getenv('MEDIUM_WOOD_TYPES_COUNT', '20')),
                'wood_type_prices': int(os.getenv('MEDIUM_WOOD_TYPE_PRICES_COUNT', '300')),
                'buyers': int(os.getenv('MEDIUM_BUYERS_COUNT', '200')),
                'sellers': int(os.getenv('MEDIUM_SELLERS_COUNT', '50')),
                'products': int(os.getenv('MEDIUM_PRODUCTS_COUNT', '800')),
                'chat_threads': int(os.getenv('MEDIUM_CHAT_THREADS_COUNT', '300')),
                'chat_messages': int(os.getenv('MEDIUM_CHAT_MESSAGES_COUNT', '2400'))
            },
            'large': {
                'wood_types': int(os.getenv('LARGE_WOOD_TYPES_COUNT', '30')),
                'wood_type_prices': int(os.getenv('LARGE_WOOD_TYPE_PRICES_COUNT', '600')),
                'buyers': int(os.getenv('LARGE_BUYERS_COUNT', '500')),
                'sellers': int(os.getenv('LARGE_SELLERS_COUNT', '150')),
                'products': int(os.getenv('LARGE_PRODUCTS_COUNT', '2500')),
                'chat_threads': int(os.getenv('LARGE_CHAT_THREADS_COUNT', '800')),
                'chat_messages': int(os.getenv('LARGE_CHAT_MESSAGES_COUNT', '8000'))
            },
            'enterprise': {
                'wood_types': int(os.getenv('ENTERPRISE_WOOD_TYPES_COUNT', '50')),
                'wood_type_prices': int(os.getenv('ENTERPRISE_WOOD_TYPE_PRICES_COUNT', '1500')),
                'buyers': int(os.getenv('ENTERPRISE_BUYERS_COUNT', '1500')),
                'sellers': int(os.getenv('ENTERPRISE_SELLERS_COUNT', '400')),
                'products': int(os.getenv('ENTERPRISE_PRODUCTS_COUNT', '8000')),
                'chat_threads': int(os.getenv('ENTERPRISE_CHAT_THREADS_COUNT', '2500')),
                'chat_messages': int(os.getenv('ENTERPRISE_CHAT_MESSAGES_COUNT', '25000'))
            }
        }

        return profiles.get(self.profile, profiles['large'])

    def generate_realistic_timestamp(self, days_back_max=90):
        """Генерирует реалистичную временную метку с учетом рабочих часов"""
        # Выбираем случайный день за последние N дней
        days_ago = random.randint(1, days_back_max)
        base_date = datetime.now() - timedelta(days=days_ago)

        # Рабочие часы: 8:00-20:00 с большей вероятностью
        if random.random() < 0.8:  # 80% сообщений в рабочее время
            hour = random.randint(8, 20)
        else:  # 20% в нерабочее время
            hour = random.choice(list(range(0, 8)) + list(range(21, 24)))

        minute = random.randint(0, 59)
        second = random.randint(0, 59)

        return base_date.replace(hour=hour, minute=minute, second=second)

    def add_seasonal_price_variation(self, base_price, wood_type):
        """Добавляет сезонные колебания цен"""
        current_month = datetime.now().month

        # Зимние месяцы (декабрь-февраль) - цены выше
        if current_month in [12, 1, 2]:
            variation = random.uniform(1.05, 1.15)  # +5-15%
        # Весенние месяцы (март-май) - пик строительного сезона
        elif current_month in [3, 4, 5]:
            variation = random.uniform(1.10, 1.25)  # +10-25%
        # Летние месяцы (июнь-август) - высокий спрос
        elif current_month in [6, 7, 8]:
            variation = random.uniform(1.08, 1.20)  # +8-20%
        # Осенние месяцы (сентябрь-ноябрь) - снижение спроса
        else:
            variation = random.uniform(0.90, 1.05)  # -10% до +5%

        return base_price * variation

    def save_progress(self):
        """Сохраняет прогресс в JSON файл"""
        with open('generated_uuids.json', 'w', encoding='utf-8') as f:
            json.dump(self.generated_data, f, ensure_ascii=False, indent=2, default=str)

    def check_api_health(self):
        """Проверяет доступность API"""
        try:
            response = requests.get(f"{self.api_base.replace('/api/v1', '')}/health", timeout=10)
            if response.status_code == 200:
                self.logger.info("✅ API доступен и работает")
                return True
        except:
            pass

        # Пробуем альтернативный способ проверки
        try:
            response = requests.get(f"{self.api_base}/wood-types/", timeout=10)
            if response.status_code in [200, 404]:  # 404 тоже означает, что API работает
                self.logger.info("✅ API доступен")
                return True
        except:
            pass

        self.logger.error("❌ API недоступен")
        return False

    def check_yolo_service_health(self):
        """Проверяет доступность YOLO сервиса"""
        try:
            # Получаем URL YOLO сервиса из настроек или используем по умолчанию
            yolo_base_url = os.getenv('YOLO_SERVICE_URL', 'http://localhost:8001')
            response = requests.get(f"{yolo_base_url}/healthcheck", timeout=10)
            if response.status_code == 200:
                self.logger.info("✅ YOLO сервис доступен и работает")
                return True
        except Exception as e:
            self.logger.error(f"❌ YOLO сервис недоступен: {e}")
            return False

    def make_request(self, method, endpoint, data=None, files=None):
        """Выполняет HTTP запрос к API с retry логикой"""
        url = f"{self.api_base}{endpoint}"

        for attempt in range(self.max_retries + 1):
            try:
                self.stats['total_requests'] += 1

                if method.upper() == 'POST':
                    if files:
                        response = requests.post(url, data=data, files=files, timeout=self.timeout)
                    else:
                        response = requests.post(url, json=data, timeout=self.timeout)
                else:
                    response = requests.request(method, url, json=data, timeout=self.timeout)

                response.raise_for_status()
                return response.json()

            except requests.exceptions.RequestException as e:
                self.stats['failed_requests'] += 1

                if attempt < self.max_retries:
                    self.stats['retries_used'] += 1
                    self.logger.warning(f"Попытка {attempt + 1} неудачна для {url}: {e}")
                    time.sleep(self.retry_delay * (attempt + 1))  # Экспоненциальная задержка
                    continue
                else:
                    self.logger.error(f"Все попытки исчерпаны для {url}: {e}")
                    if hasattr(e, 'response') and e.response is not None:
                        self.logger.error(f"Ответ сервера: {e.response.text}")
                    raise

    def generate_wood_types(self):
        """Генерирует типы древесины"""
        print("🌲 Создание типов древесины...")
        
        for wood_data in tqdm(WOOD_TYPES[:self.counts['wood_types']]):
            wood_id = str(uuid4())
            payload = {
                'id': wood_id,
                'neme': wood_data['neme'],
                'description': wood_data['description']
            }
            
            try:
                response = self.make_request('POST', '/wood-types/', payload)
                self.generated_data['wood_types'].append({
                    'id': wood_id,
                    'neme': wood_data['neme']
                })
            except Exception as e:
                print(f"Ошибка создания типа древесины {wood_data['neme']}: {e}")
        
        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['wood_types'])} типов древесины")

    def generate_wood_type_prices(self):
        """Генерирует исторические цены на древесину"""
        print("💰 Создание цен на древесину...")
        
        if not self.generated_data['wood_types']:
            print("❌ Сначала нужно создать типы древесины")
            return
        
        prices_per_type = self.counts['wood_type_prices'] // len(self.generated_data['wood_types'])
        
        for wood_type in tqdm(self.generated_data['wood_types']):
            wood_name = wood_type['neme']
            price_range = WOOD_PRICE_RANGES.get(wood_name, (15000, 50000))
            
            for _ in range(prices_per_type):
                price_id = str(uuid4())
                # Генерируем случайную дату за последние 2 года
                days_ago = random.randint(1, 730)
                created_date = datetime.now() - timedelta(days=days_ago)
                
                # Генерируем базовую цену с сезонными колебаниями
                base_price = random.uniform(*price_range)
                final_price = self.add_seasonal_price_variation(base_price, wood_name)

                payload = {
                    'id': price_id,
                    'price_per_m3': round(final_price, 2),
                    'wood_type_id': wood_type['id']
                }
                
                try:
                    response = self.make_request('POST', '/wood-type-prices/', payload)
                    self.generated_data['wood_type_prices'].append(price_id)
                except Exception as e:
                    print(f"Ошибка создания цены для {wood_name}: {e}")
        
        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['wood_type_prices'])} цен на древесину")

    def generate_buyers(self):
        """Генерирует покупателей"""
        print("👥 Создание покупателей...")
        
        for _ in tqdm(range(self.counts['buyers'])):
            buyer_id = str(uuid4())
            keycloak_uuid = str(uuid4())
            
            payload = {
                'id': buyer_id,
                'keycloak_uuid': keycloak_uuid,
                'is_online': random.choice([True, False])
            }
            
            try:
                response = self.make_request('POST', '/buyers/', payload)
                self.generated_data['buyers'].append(buyer_id)
            except Exception as e:
                print(f"Ошибка создания покупателя: {e}")
        
        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['buyers'])} покупателей")

    def generate_sellers(self):
        """Генерирует продавцов"""
        print("🏪 Создание продавцов...")
        
        for _ in tqdm(range(self.counts['sellers'])):
            seller_id = str(uuid4())
            keycloak_uuid = str(uuid4())
            
            payload = {
                'id': seller_id,
                'keycloak_uuid': keycloak_uuid,
                'is_online': random.choice([True, False])
            }
            
            try:
                response = self.make_request('POST', '/sellers/', payload)
                self.generated_data['sellers'].append(seller_id)
            except Exception as e:
                print(f"Ошибка создания продавца: {e}")
        
        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['sellers'])} продавцов")

    def generate_pickup_address(self):
        """Генерирует живой адрес самовывоза с деталями"""
        city = random.choice(PICKUP_CITIES)
        street_type = random.choice(STREET_TYPES)
        street_name = random.choice(STREET_NAMES)
        house_num = random.randint(1, 200)

        base_address = f"г. {city}, {street_type} {street_name}, д. {house_num}"

        # Добавляем живые детали с вероятностью 30%
        if random.random() < 0.3:
            details = [
                " (склад за зданием)",
                " (вход со двора)",
                " (звонить заранее)",
                " (работаем до 18:00)",
                " (парковка есть)",
                " (рядом с рынком)",
                " (напротив школы)",
                " (красное здание)",
                " (большие ворота)",
                " (семейный бизнес)"
            ]
            base_address += random.choice(details)

        return base_address

    async def create_product_with_yolo_analysis(
        self,
        seller_id: str,
        wood_type_id: str,
        title: str,
        description: str,
        board_height: float,
        board_length: float,
        volume: float,
        price: float,
        delivery_possible: bool,
        pickup_location: str,
        image_path: Path
    ) -> bool:
        """
        Создает товар с реальным YOLO анализом изображения

        Args:
            seller_id: ID продавца
            wood_type_id: ID типа древесины
            title: Название товара
            description: Описание товара
            board_height: Высота доски в мм
            board_length: Длина доски в мм
            volume: Предварительный объем
            price: Предварительная цена
            delivery_possible: Возможность доставки
            pickup_location: Адрес самовывоза
            image_path: Путь к изображению

        Returns:
            bool: True если товар создан успешно
        """
        try:
            import aiohttp
            import aiofiles

            # Подготавливаем form data
            form_data = aiohttp.FormData()
            form_data.add_field('seller_id', seller_id)
            form_data.add_field('wood_type_id', wood_type_id)
            form_data.add_field('title', title)
            form_data.add_field('description', description or '')
            form_data.add_field('board_height', str(board_height))
            form_data.add_field('board_length', str(board_length))
            form_data.add_field('volume', str(volume))
            form_data.add_field('price', str(price))
            form_data.add_field('delivery_possible', str(delivery_possible).lower())
            if pickup_location:
                form_data.add_field('pickup_location', pickup_location)

            # Читаем изображение
            async with aiofiles.open(image_path, 'rb') as f:
                image_content = await f.read()

            # Добавляем изображение в form data
            form_data.add_field(
                'image',
                image_content,
                filename=image_path.name,
                content_type='image/jpeg' if image_path.suffix.lower() in ['.jpg', '.jpeg'] else 'image/png'
            )

            # Отправляем запрос с увеличенным таймаутом для YOLO анализа
            url = f"{self.api_base}/products/with-image"
            timeout = aiohttp.ClientTimeout(total=120)  # 2 минуты на YOLO анализ

            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(url, data=form_data) as response:
                    if response.status == 201:
                        result = await response.json()

                        # Сохраняем информацию о созданном товаре
                        product_data = result.get('data', {})
                        if product_data:
                            self.generated_data['products'].append({
                                'id': product_data.get('product_id'),
                                'seller_id': seller_id
                            })

                            # Сохраняем информацию об изображении
                            if product_data.get('image_id'):
                                self.generated_data['images'].append({
                                    'id': product_data.get('image_id'),
                                    'image_path': product_data.get('image_path', ''),
                                    'product_id': product_data.get('product_id')
                                })

                            # Сохраняем информацию о досках (из YOLO анализа)
                            wooden_boards = product_data.get('wooden_boards', [])
                            for board in wooden_boards:
                                if board.get('id'):
                                    self.generated_data['wooden_boards'].append(board.get('id'))

                        return True
                    else:
                        error_text = await response.text()
                        print(f"Ошибка создания товара: HTTP {response.status} - {error_text}")
                        return False

        except Exception as e:
            print(f"Исключение при создании товара с YOLO анализом: {e}")
            return False

    def generate_products_with_yolo_analysis(self):
        """Генерирует товары с реальным YOLO анализом изображений"""
        print("📦 Создание товаров с YOLO анализом...")

        if not self.generated_data['sellers'] or not self.generated_data['wood_types']:
            print("❌ Сначала нужно создать продавцов и типы древесины")
            return

        # Получаем список доступных изображений
        if not self.images_source.exists():
            print(f"❌ Папка с изображениями не найдена: {self.images_source}")
            return

        image_files = list(self.images_source.glob('*.jpg')) + list(self.images_source.glob('*.png'))
        if not image_files:
            print("❌ Изображения не найдены")
            return

        print(f"Найдено {len(image_files)} изображений для анализа")

        successful_products = 0
        failed_products = 0

        for i in tqdm(range(self.counts['products'])):
            seller_id = random.choice(self.generated_data['sellers'])
            wood_type = random.choice(self.generated_data['wood_types'])

            # Генерируем размеры доски для YOLO анализа
            width, height = random.choice(BOARD_DIMENSIONS)
            length = random.choice(BOARD_LENGTHS)

            # Выбираем случайное изображение
            source_image = random.choice(image_files)

            # Генерируем живое название товара
            wood_name = wood_type['neme']
            title_template = random.choice(PRODUCT_TITLE_TEMPLATES)
            title = title_template.format(
                wood_type=wood_name,
                width=width,
                height=height,
                length=length
            )

            # Добавляем живые детали к названию с вероятностью 25%
            if random.random() < 0.25:
                title_additions = [
                    " [СВЕЖИЙ ЗАВОЗ]",
                    " [АКЦИЯ]",
                    " [ХИТ ПРОДАЖ]",
                    " [ЭКСКЛЮЗИВ]",
                    " [МАСТЕР ВЫБОР]",
                    " [СЕМЕЙНАЯ ЦЕНА]",
                    " [СЕВЕРНОЕ КАЧЕСТВО]",
                    " [ПРОВЕРЕНО ВРЕМЕНЕМ]"
                ]
                title += random.choice(title_additions)

            # Генерируем живое описание
            description_template = random.choice(PRODUCT_DESCRIPTIONS)
            description = description_template.format(wood_type=wood_name)

            # Добавляем живые детали с вероятностью 40%
            if random.random() < 0.4:
                # Добавляем историю
                if random.random() < 0.5:
                    story = random.choice(PRODUCT_STORIES)
                    description += f" {story}"

                # Добавляем эмоциональную характеристику
                if wood_name in WOOD_EMOTIONS and random.random() < 0.6:
                    emotion = random.choice(WOOD_EMOTIONS[wood_name])
                    description += f" Древесина особенно {emotion}."

                # Добавляем сезонное настроение
                if random.random() < 0.3:
                    mood = random.choice(SEASONAL_MOODS)
                    description += f" {mood}"

            # Определяем доставку и самовывоз
            delivery_possible = random.choice([True, False])
            pickup_location = self.generate_pickup_address() if random.choice([True, False]) else None

            # Генерируем цену на основе типа древесины (будет скорректирована после анализа)
            price_range = WOOD_PRICE_RANGES.get(wood_name, (15000, 50000))
            price_per_m3 = random.uniform(*price_range)

            # Предварительный объем (будет заменен результатом YOLO анализа)
            preliminary_volume = round((width * height * length) / 1_000_000_000, 4)
            preliminary_price = round(preliminary_volume * price_per_m3, 2)

            try:
                # Создаем товар с YOLO анализом через multipart/form-data
                success = asyncio.run(self.create_product_with_yolo_analysis(
                    seller_id=seller_id,
                    wood_type_id=wood_type['id'],
                    title=title,
                    description=description,
                    board_height=float(height),  # в мм
                    board_length=float(length),  # в мм
                    volume=preliminary_volume,
                    price=preliminary_price,
                    delivery_possible=delivery_possible,
                    pickup_location=pickup_location,
                    image_path=source_image
                ))

                if success:
                    successful_products += 1
                else:
                    failed_products += 1

            except Exception as e:
                print(f"Ошибка создания товара {i+1}: {e}")
                failed_products += 1

        self.save_progress()
        print(f"✅ Создано {successful_products} товаров с YOLO анализом")
        if failed_products > 0:
            print(f"⚠️ Не удалось создать {failed_products} товаров")



    def generate_chat_threads(self):
        """Генерирует потоки чата"""
        print("💬 Создание потоков чата...")

        if not self.generated_data['buyers'] or not self.generated_data['sellers']:
            print("❌ Сначала нужно создать покупателей и продавцов")
            return

        for _ in tqdm(range(self.counts['chat_threads'])):
            thread_id = str(uuid4())
            buyer_id = random.choice(self.generated_data['buyers'])
            seller_id = random.choice(self.generated_data['sellers'])

            payload = {
                'id': thread_id,
                'buyer_id': buyer_id,
                'seller_id': seller_id
            }

            try:
                response = self.make_request('POST', '/chat-threads/', payload)
                self.generated_data['chat_threads'].append({
                    'id': thread_id,
                    'buyer_id': buyer_id,
                    'seller_id': seller_id
                })
            except Exception as e:
                print(f"Ошибка создания потока чата: {e}")

        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['chat_threads'])} потоков чата")

    def generate_chat_messages(self):
        """Генерирует сообщения в чатах"""
        print("📝 Создание сообщений в чатах...")

        if not self.generated_data['chat_threads']:
            print("❌ Сначала нужно создать потоки чата")
            return

        messages_per_thread = self.counts['chat_messages'] // len(self.generated_data['chat_threads'])

        for thread_data in tqdm(self.generated_data['chat_threads']):
            # Генерируем диалог между покупателем и продавцом
            for i in range(messages_per_thread):
                message_id = str(uuid4())

                # Чередуем отправителей (начинаем с покупателя)
                is_buyer_sender = (i % 2 == 0)

                if is_buyer_sender:
                    message_text = random.choice(CHAT_MESSAGES_BUYER)
                    is_read_by_buyer = True  # Отправитель всегда видит свое сообщение
                    is_read_by_seller = random.choice([True, False])

                    # Добавляем персонализацию для покупателей
                    if random.random() < 0.2:  # 20% сообщений более персональные
                        personal_touches = [
                            " (строю дом для семьи)",
                            " (делаю мебель своими руками)",
                            " (ремонт в квартире)",
                            " (дачный проект)",
                            " (баня для друзей)",
                            " (мастерская в гараже)"
                        ]
                        message_text += random.choice(personal_touches)

                    # Новая логика: отправитель - покупатель (buyer_id заполнен, seller_id = NULL)
                    sender_buyer_id = thread_data['buyer_id']
                    sender_seller_id = None

                else:
                    message_text = random.choice(CHAT_MESSAGES_SELLER)
                    is_read_by_buyer = random.choice([True, False])
                    is_read_by_seller = True  # Отправитель всегда видит свое сообщение

                    # Добавляем личность продавца
                    if random.random() < 0.15:  # 15% сообщений с личностью
                        personality = random.choice(SELLER_PERSONALITIES)
                        message_text += f" {personality}"

                    # Новая логика: отправитель - продавец (seller_id заполнен, buyer_id = NULL)
                    sender_buyer_id = None
                    sender_seller_id = thread_data['seller_id']

                # Добавляем случайные города в сообщения
                if '{city}' in message_text:
                    message_text = message_text.format(city=random.choice(PICKUP_CITIES))

                payload = {
                    'id': message_id,
                    'message': message_text,
                    'is_read_by_buyer': is_read_by_buyer,
                    'is_read_by_seller': is_read_by_seller,
                    'thread_id': thread_data['id'],
                    'buyer_id': sender_buyer_id,
                    'seller_id': sender_seller_id
                }

                try:
                    response = self.make_request('POST', '/chat-messages/', payload)
                    self.generated_data['chat_messages'].append(message_id)
                except Exception as e:
                    print(f"Ошибка создания сообщения: {e}")

        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['chat_messages'])} сообщений")

    def print_generation_stats(self):
        """Выводит статистику генерации"""
        if self.stats['start_time'] and self.stats['end_time']:
            duration = self.stats['end_time'] - self.stats['start_time']
            duration_str = str(duration).split('.')[0]  # Убираем микросекунды

            print(f"\n📊 Статистика генерации:")
            print(f"  ⏱️  Время выполнения: {duration_str}")
            print(f"  📡 Всего запросов: {self.stats['total_requests']}")
            print(f"  ❌ Неудачных запросов: {self.stats['failed_requests']}")
            print(f"  🔄 Повторных попыток: {self.stats['retries_used']}")

            success_rate = ((self.stats['total_requests'] - self.stats['failed_requests']) /
                          self.stats['total_requests'] * 100) if self.stats['total_requests'] > 0 else 0
            print(f"  ✅ Успешность: {success_rate:.1f}%")

            total_records = sum(len(data) if isinstance(data, list) else 0
                              for data in self.generated_data.values())
            print(f"  📝 Всего записей создано: {total_records}")

    def save_generation_report(self):
        """Сохраняет отчет о генерации"""
        if not os.getenv('SAVE_GENERATION_REPORT', 'true').lower() == 'true':
            return

        report = {
            'profile': self.profile,
            'planned_counts': self.counts,
            'actual_counts': {k: len(v) if isinstance(v, list) else 0
                            for k, v in self.generated_data.items()},
            'stats': self.stats,
            'api_base': self.api_base,
            'timestamp': datetime.now().isoformat()
        }

        report_file = f"generation_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2, default=str)

        self.logger.info(f"Отчет сохранен в {report_file}")

    def run_generation(self):
        """Запускает полную генерацию данных"""
        self.stats['start_time'] = datetime.now()

        print("🚀 Начинаем генерацию синтетических данных...")
        print(f"📋 Профиль: {self.profile}")
        print(f"🌐 API: {self.api_base}")
        print(f"📊 Планируется создать:")

        total_planned = 0
        for entity, count in self.counts.items():
            print(f"  - {entity}: {count:,}")
            total_planned += count
        print(f"  📝 Всего записей: {total_planned:,}")
        print()

        # Проверяем доступность API
        if not self.check_api_health():
            print("❌ API недоступен. Проверьте, что backend запущен.")
            return

        # Проверяем доступность YOLO сервиса
        if not self.check_yolo_service_health():
            print("❌ YOLO сервис недоступен. Проверьте, что YOLO backend запущен на порту 8001.")
            print("💡 Для работы с реальным анализом изображений необходим YOLO сервис.")
            return

        try:
            # Создаем данные в правильном порядке (учитывая зависимости)
            self.generate_wood_types()
            self.generate_wood_type_prices()
            self.generate_buyers()
            self.generate_sellers()
            # Новый метод создает товары, изображения и доски одновременно через YOLO анализ
            self.generate_products_with_yolo_analysis()
            self.generate_chat_threads()
            self.generate_chat_messages()

            self.stats['end_time'] = datetime.now()

            print("\n🎉 Генерация данных завершена успешно!")
            print(f"📋 Создано записей:")
            total_created = 0
            for entity, data in self.generated_data.items():
                count = len(data) if isinstance(data, list) else 0
                print(f"  - {entity}: {count:,}")
                total_created += count
            print(f"  📝 Всего создано: {total_created:,}")

            self.print_generation_stats()
            self.save_generation_report()

        except KeyboardInterrupt:
            self.stats['end_time'] = datetime.now()
            print("\n⚠️ Генерация прервана пользователем")
            print("Прогресс сохранен в generated_uuids.json")
            self.print_generation_stats()
            self.save_generation_report()
        except Exception as e:
            self.stats['end_time'] = datetime.now()
            self.logger.error(f"Ошибка генерации: {e}")
            print(f"\n❌ Ошибка генерации: {e}")
            print("Прогресс сохранен в generated_uuids.json")
            self.print_generation_stats()
            self.save_generation_report()
            raise


def main():
    """Главная функция"""
    generator = DataGenerator()
    generator.run_generation()


if __name__ == "__main__":
    main()
