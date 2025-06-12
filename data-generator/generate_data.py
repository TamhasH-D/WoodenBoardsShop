#!/usr/bin/env python3
"""
Генератор синтетических данных для WoodenBoardsShop
"""

import json
import os
import random
import shutil
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
    CHAT_MESSAGES_BUYER, CHAT_MESSAGES_SELLER, BOARD_DIMENSIONS, BOARD_LENGTHS
)

# Загружаем переменные окружения
load_dotenv()

class DataGenerator:
    def __init__(self):
        self.fake = Faker('ru_RU')
        self.api_base = os.getenv('API_BASE_URL', 'http://localhost:8000/api/v1')
        self.timeout = int(os.getenv('REQUEST_TIMEOUT', '30'))
        
        # Счетчики записей
        self.counts = {
            'wood_types': int(os.getenv('WOOD_TYPES_COUNT', '12')),
            'wood_type_prices': int(os.getenv('WOOD_TYPE_PRICES_COUNT', '80')),
            'buyers': int(os.getenv('BUYERS_COUNT', '75')),
            'sellers': int(os.getenv('SELLERS_COUNT', '25')),
            'products': int(os.getenv('PRODUCTS_COUNT', '350')),
            'chat_threads': int(os.getenv('CHAT_THREADS_COUNT', '150')),
            'chat_messages': int(os.getenv('CHAT_MESSAGES_COUNT', '1200'))
        }
        
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
        self.images_upload = Path(os.getenv('IMAGES_UPLOAD_DIR', './uploaded_images'))
        
        # Создаем папку для загруженных изображений
        self.images_upload.mkdir(exist_ok=True)

    def save_progress(self):
        """Сохраняет прогресс в JSON файл"""
        with open('generated_uuids.json', 'w', encoding='utf-8') as f:
            json.dump(self.generated_data, f, ensure_ascii=False, indent=2, default=str)

    def make_request(self, method, endpoint, data=None, files=None):
        """Выполняет HTTP запрос к API"""
        url = f"{self.api_base}{endpoint}"
        try:
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
            print(f"Ошибка запроса к {url}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Ответ сервера: {e.response.text}")
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
                
                payload = {
                    'id': price_id,
                    'price_per_m3': round(random.uniform(*price_range), 2),
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
        """Генерирует адрес самовывоза"""
        city = random.choice(PICKUP_CITIES)
        street_type = random.choice(STREET_TYPES)
        street_name = random.choice(STREET_NAMES)
        house_num = random.randint(1, 200)

        return f"г. {city}, {street_type} {street_name}, д. {house_num}"

    def generate_products(self):
        """Генерирует товары"""
        print("📦 Создание товаров...")

        if not self.generated_data['sellers'] or not self.generated_data['wood_types']:
            print("❌ Сначала нужно создать продавцов и типы древесины")
            return

        for _ in tqdm(range(self.counts['products'])):
            product_id = str(uuid4())
            seller_id = random.choice(self.generated_data['sellers'])
            wood_type = random.choice(self.generated_data['wood_types'])

            # Генерируем размеры доски
            width, height = random.choice(BOARD_DIMENSIONS)
            length = random.choice(BOARD_LENGTHS)

            # Рассчитываем объем (в м³)
            volume = round((width * height * length) / 1_000_000_000, 4)

            # Генерируем цену на основе типа древесины
            wood_name = wood_type['neme']
            price_range = WOOD_PRICE_RANGES.get(wood_name, (15000, 50000))
            price_per_m3 = random.uniform(*price_range)
            total_price = round(volume * price_per_m3, 2)

            # Генерируем название товара
            title_template = random.choice(PRODUCT_TITLE_TEMPLATES)
            title = title_template.format(
                wood_type=wood_name,
                width=width,
                height=height,
                length=length
            )

            # Генерируем описание
            description_template = random.choice(PRODUCT_DESCRIPTIONS)
            description = description_template.format(wood_type=wood_name)

            # Определяем доставку и самовывоз
            delivery_possible = random.choice([True, False])
            pickup_location = self.generate_pickup_address() if random.choice([True, False]) else None

            payload = {
                'id': product_id,
                'volume': volume,
                'price': total_price,
                'title': title,
                'descrioption': description,  # Сохраняем опечатку из API
                'delivery_possible': delivery_possible,
                'pickup_location': pickup_location,
                'seller_id': seller_id,
                'wood_type_id': wood_type['id']
            }

            try:
                response = self.make_request('POST', '/products/', payload)
                self.generated_data['products'].append(product_id)
            except Exception as e:
                print(f"Ошибка создания товара: {e}")

        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['products'])} товаров")

    def copy_and_generate_images(self):
        """Копирует изображения и создает записи в БД"""
        print("🖼️ Создание изображений...")

        if not self.generated_data['products']:
            print("❌ Сначала нужно создать товары")
            return

        # Получаем список доступных изображений
        if not self.images_source.exists():
            print(f"❌ Папка с изображениями не найдена: {self.images_source}")
            return

        image_files = list(self.images_source.glob('*.jpg')) + list(self.images_source.glob('*.png'))
        if not image_files:
            print("❌ Изображения не найдены")
            return

        print(f"Найдено {len(image_files)} изображений")

        for product_id in tqdm(self.generated_data['products']):
            # Выбираем случайное изображение
            source_image = random.choice(image_files)

            # Генерируем новое имя файла
            image_id = str(uuid4())
            file_extension = source_image.suffix
            new_filename = f"{image_id}{file_extension}"
            target_path = self.images_upload / new_filename

            try:
                # Копируем файл
                shutil.copy2(source_image, target_path)

                # Создаем запись в БД
                payload = {
                    'id': image_id,
                    'filename': new_filename,
                    'product_id': product_id
                }

                response = self.make_request('POST', '/images/', payload)
                self.generated_data['images'].append({
                    'id': image_id,
                    'filename': new_filename,
                    'product_id': product_id
                })

            except Exception as e:
                print(f"Ошибка создания изображения: {e}")

        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['images'])} изображений")

    def generate_wooden_boards(self):
        """Генерирует записи деревянных досок"""
        print("🪵 Создание записей деревянных досок...")

        if not self.generated_data['images']:
            print("❌ Сначала нужно создать изображения")
            return

        for image_data in tqdm(self.generated_data['images']):
            # Генерируем 1-3 доски на изображение
            boards_count = random.randint(1, 3)

            for _ in range(boards_count):
                board_id = str(uuid4())

                # Генерируем размеры доски
                width, height = random.choice(BOARD_DIMENSIONS)
                length = random.choice(BOARD_LENGTHS)

                payload = {
                    'id': board_id,
                    'height': float(height),
                    'width': float(width),
                    'lenght': float(length),  # Сохраняем опечатку из API
                    'image_id': image_data['id']
                }

                try:
                    response = self.make_request('POST', '/wooden-boards/', payload)
                    self.generated_data['wooden_boards'].append(board_id)
                except Exception as e:
                    print(f"Ошибка создания доски: {e}")

        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['wooden_boards'])} записей досок")

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
                else:
                    message_text = random.choice(CHAT_MESSAGES_SELLER)
                    is_read_by_buyer = random.choice([True, False])
                    is_read_by_seller = True  # Отправитель всегда видит свое сообщение

                # Добавляем случайные города в сообщения
                if '{city}' in message_text:
                    message_text = message_text.format(city=random.choice(PICKUP_CITIES))

                payload = {
                    'id': message_id,
                    'message': message_text,
                    'is_read_by_buyer': is_read_by_buyer,
                    'is_read_by_seller': is_read_by_seller,
                    'thread_id': thread_data['id'],
                    'buyer_id': thread_data['buyer_id'],
                    'seller_id': thread_data['seller_id']
                }

                try:
                    response = self.make_request('POST', '/chat-messages/', payload)
                    self.generated_data['chat_messages'].append(message_id)
                except Exception as e:
                    print(f"Ошибка создания сообщения: {e}")

        self.save_progress()
        print(f"✅ Создано {len(self.generated_data['chat_messages'])} сообщений")

    def run_generation(self):
        """Запускает полную генерацию данных"""
        print("🚀 Начинаем генерацию синтетических данных...")
        print(f"API: {self.api_base}")
        print(f"Планируется создать:")
        for entity, count in self.counts.items():
            print(f"  - {entity}: {count}")
        print()

        try:
            # Создаем данные в правильном порядке (учитывая зависимости)
            self.generate_wood_types()
            self.generate_wood_type_prices()
            self.generate_buyers()
            self.generate_sellers()
            self.generate_products()
            self.copy_and_generate_images()
            self.generate_wooden_boards()
            self.generate_chat_threads()
            self.generate_chat_messages()

            print("\n🎉 Генерация данных завершена успешно!")
            print(f"Создано записей:")
            for entity, data in self.generated_data.items():
                print(f"  - {entity}: {len(data)}")

        except KeyboardInterrupt:
            print("\n⚠️ Генерация прервана пользователем")
            print("Прогресс сохранен в generated_uuids.json")
        except Exception as e:
            print(f"\n❌ Ошибка генерации: {e}")
            print("Прогресс сохранен в generated_uuids.json")
            raise


def main():
    """Главная функция"""
    generator = DataGenerator()
    generator.run_generation()


if __name__ == "__main__":
    main()
