#!/usr/bin/env python3
"""
Удаление синтетических данных из WoodenBoardsShop
"""

import json
import os
import shutil
from pathlib import Path
import requests
from tqdm import tqdm
from dotenv import load_dotenv

# Загружаем переменные окружения
load_dotenv()

class DataRemover:
    def __init__(self):
        self.api_base = os.getenv('API_BASE_URL', 'http://localhost:8000/api/v1')
        self.timeout = int(os.getenv('REQUEST_TIMEOUT', '30'))
        self.images_upload = Path(os.getenv('IMAGES_UPLOAD_DIR', './uploaded_images'))
        
        # Загружаем данные о созданных записях
        self.generated_data = self.load_generated_data()

    def load_generated_data(self):
        """Загружает данные о созданных записях"""
        try:
            with open('generated_uuids.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print("❌ Файл generated_uuids.json не найден")
            return {}
        except json.JSONDecodeError:
            print("❌ Ошибка чтения файла generated_uuids.json")
            return {}

    def make_request(self, method, endpoint, data=None):
        """Выполняет HTTP запрос к API"""
        url = f"{self.api_base}{endpoint}"
        try:
            response = requests.request(method, url, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json() if response.content else None
        except requests.exceptions.RequestException as e:
            # Игнорируем ошибки 404 (запись уже удалена)
            if hasattr(e, 'response') and e.response is not None and e.response.status_code == 404:
                return None
            print(f"Ошибка запроса к {url}: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Ответ сервера: {e.response.text}")
            raise

    def remove_chat_messages(self):
        """Удаляет сообщения чата"""
        if not self.generated_data.get('chat_messages'):
            print("📝 Сообщения чата не найдены для удаления")
            return
        
        print("📝 Удаление сообщений чата...")
        success_count = 0
        
        for message_id in tqdm(self.generated_data['chat_messages']):
            try:
                self.make_request('DELETE', f'/chat-messages/{message_id}')
                success_count += 1
            except Exception as e:
                print(f"Ошибка удаления сообщения {message_id}: {e}")
        
        print(f"✅ Удалено {success_count} сообщений чата")

    def remove_chat_threads(self):
        """Удаляет потоки чата"""
        if not self.generated_data.get('chat_threads'):
            print("💬 Потоки чата не найдены для удаления")
            return
        
        print("💬 Удаление потоков чата...")
        success_count = 0
        
        for thread_data in tqdm(self.generated_data['chat_threads']):
            thread_id = thread_data if isinstance(thread_data, str) else thread_data.get('id')
            if thread_id:
                try:
                    self.make_request('DELETE', f'/chat-threads/{thread_id}')
                    success_count += 1
                except Exception as e:
                    print(f"Ошибка удаления потока {thread_id}: {e}")
        
        print(f"✅ Удалено {success_count} потоков чата")

    def remove_wooden_boards(self):
        """Удаляет записи деревянных досок"""
        if not self.generated_data.get('wooden_boards'):
            print("🪵 Записи досок не найдены для удаления")
            return
        
        print("🪵 Удаление записей деревянных досок...")
        success_count = 0
        
        for board_id in tqdm(self.generated_data['wooden_boards']):
            try:
                self.make_request('DELETE', f'/wooden-boards/{board_id}')
                success_count += 1
            except Exception as e:
                print(f"Ошибка удаления доски {board_id}: {e}")
        
        print(f"✅ Удалено {success_count} записей досок")

    def remove_images(self):
        """Удаляет изображения из БД и файловой системы"""
        if not self.generated_data.get('images'):
            print("🖼️ Изображения не найдены для удаления")
            return
        
        print("🖼️ Удаление изображений...")
        success_count = 0
        
        for image_data in tqdm(self.generated_data['images']):
            image_id = image_data if isinstance(image_data, str) else image_data.get('id')
            filename = image_data.get('filename') if isinstance(image_data, dict) else None
            
            if image_id:
                try:
                    # Удаляем запись из БД
                    self.make_request('DELETE', f'/images/{image_id}')
                    
                    # Удаляем файл
                    if filename:
                        file_path = self.images_upload / filename
                        if file_path.exists():
                            file_path.unlink()
                    
                    success_count += 1
                except Exception as e:
                    print(f"Ошибка удаления изображения {image_id}: {e}")
        
        print(f"✅ Удалено {success_count} изображений")

    def remove_products(self):
        """Удаляет товары"""
        if not self.generated_data.get('products'):
            print("📦 Товары не найдены для удаления")
            return
        
        print("📦 Удаление товаров...")
        success_count = 0
        
        for product_id in tqdm(self.generated_data['products']):
            try:
                self.make_request('DELETE', f'/products/{product_id}')
                success_count += 1
            except Exception as e:
                print(f"Ошибка удаления товара {product_id}: {e}")
        
        print(f"✅ Удалено {success_count} товаров")

    def remove_sellers(self):
        """Удаляет продавцов"""
        if not self.generated_data.get('sellers'):
            print("🏪 Продавцы не найдены для удаления")
            return
        
        print("🏪 Удаление продавцов...")
        success_count = 0
        
        for seller_id in tqdm(self.generated_data['sellers']):
            try:
                self.make_request('DELETE', f'/sellers/{seller_id}')
                success_count += 1
            except Exception as e:
                print(f"Ошибка удаления продавца {seller_id}: {e}")
        
        print(f"✅ Удалено {success_count} продавцов")

    def remove_buyers(self):
        """Удаляет покупателей"""
        if not self.generated_data.get('buyers'):
            print("👥 Покупатели не найдены для удаления")
            return
        
        print("👥 Удаление покупателей...")
        success_count = 0
        
        for buyer_id in tqdm(self.generated_data['buyers']):
            try:
                self.make_request('DELETE', f'/buyers/{buyer_id}')
                success_count += 1
            except Exception as e:
                print(f"Ошибка удаления покупателя {buyer_id}: {e}")
        
        print(f"✅ Удалено {success_count} покупателей")

    def remove_wood_type_prices(self):
        """Удаляет цены на древесину"""
        if not self.generated_data.get('wood_type_prices'):
            print("💰 Цены на древесину не найдены для удаления")
            return
        
        print("💰 Удаление цен на древесину...")
        success_count = 0
        
        for price_id in tqdm(self.generated_data['wood_type_prices']):
            try:
                self.make_request('DELETE', f'/wood-type-prices/{price_id}')
                success_count += 1
            except Exception as e:
                print(f"Ошибка удаления цены {price_id}: {e}")
        
        print(f"✅ Удалено {success_count} цен на древесину")

    def remove_wood_types(self):
        """Удаляет типы древесины"""
        if not self.generated_data.get('wood_types'):
            print("🌲 Типы древесины не найдены для удаления")
            return
        
        print("🌲 Удаление типов древесины...")
        success_count = 0
        
        for wood_type_data in tqdm(self.generated_data['wood_types']):
            wood_type_id = wood_type_data if isinstance(wood_type_data, str) else wood_type_data.get('id')
            if wood_type_id:
                try:
                    self.make_request('DELETE', f'/wood-types/{wood_type_id}')
                    success_count += 1
                except Exception as e:
                    print(f"Ошибка удаления типа древесины {wood_type_id}: {e}")
        
        print(f"✅ Удалено {success_count} типов древесины")

    def cleanup_files(self):
        """Очищает файлы и папки"""
        print("🧹 Очистка файлов...")
        
        # Удаляем папку с загруженными изображениями
        if self.images_upload.exists():
            try:
                shutil.rmtree(self.images_upload)
                print(f"✅ Удалена папка {self.images_upload}")
            except Exception as e:
                print(f"Ошибка удаления папки {self.images_upload}: {e}")
        
        # Очищаем файл с UUID
        try:
            with open('generated_uuids.json', 'w', encoding='utf-8') as f:
                json.dump({}, f)
            print("✅ Очищен файл generated_uuids.json")
        except Exception as e:
            print(f"Ошибка очистки файла generated_uuids.json: {e}")

    def run_removal(self):
        """Запускает полное удаление данных"""
        if not self.generated_data:
            print("❌ Нет данных для удаления")
            return
        
        print("🗑️ Начинаем удаление синтетических данных...")
        print(f"API: {self.api_base}")
        print("Данные для удаления:")
        for entity, data in self.generated_data.items():
            if data:
                print(f"  - {entity}: {len(data)}")
        print()
        
        try:
            # Удаляем данные в обратном порядке (учитывая зависимости)
            self.remove_chat_messages()
            self.remove_chat_threads()
            self.remove_wooden_boards()
            self.remove_images()
            self.remove_products()
            self.remove_sellers()
            self.remove_buyers()
            self.remove_wood_type_prices()
            self.remove_wood_types()
            
            # Очищаем файлы
            self.cleanup_files()
            
            print("\n🎉 Удаление данных завершено успешно!")
            
        except KeyboardInterrupt:
            print("\n⚠️ Удаление прервано пользователем")
        except Exception as e:
            print(f"\n❌ Ошибка удаления: {e}")
            raise


def main():
    """Главная функция"""
    remover = DataRemover()
    remover.run_removal()


if __name__ == "__main__":
    main()
