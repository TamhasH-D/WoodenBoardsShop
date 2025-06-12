#!/usr/bin/env python3
"""
Демонстрация возможностей генератора синтетических данных
"""

import json
import random
from pathlib import Path
from generate_data import DataGenerator
from data_templates import WOOD_TYPES, CHAT_MESSAGES_BUYER, CHAT_MESSAGES_SELLER

def show_data_samples():
    """Показывает примеры генерируемых данных"""
    print("🎯 Демонстрация генератора синтетических данных WoodenBoardsShop")
    print("=" * 70)
    
    generator = DataGenerator()
    
    print("\n📊 Планируемые объемы данных:")
    total_records = 0
    for entity, count in generator.counts.items():
        print(f"   {entity:20} {count:>6} записей")
        total_records += count
    
    # Добавляем изображения и доски (они генерируются динамически)
    images_count = generator.counts['products']  # По одному изображению на товар
    boards_count = images_count * 2  # В среднем 2 доски на изображение
    total_records += images_count + boards_count
    
    print(f"   {'images':20} {images_count:>6} записей")
    print(f"   {'wooden_boards':20} {boards_count:>6} записей")
    print(f"   {'-' * 20} {'-' * 6}")
    print(f"   {'ИТОГО':20} {total_records:>6} записей")
    
    print(f"\n🖼️ Доступно изображений: {len(list(generator.images_source.glob('*.jpg')))}")
    
    print("\n🌲 Примеры типов древесины:")
    for i, wood_type in enumerate(WOOD_TYPES[:5], 1):
        print(f"   {i}. {wood_type['neme']} - {wood_type['description']}")
    print(f"   ... и еще {len(WOOD_TYPES) - 5} типов")
    
    print("\n📦 Примеры названий товаров:")
    from data_templates import PRODUCT_TITLE_TEMPLATES, BOARD_DIMENSIONS, BOARD_LENGTHS
    
    for i in range(3):
        wood_name = random.choice(WOOD_TYPES)['neme']
        width, height = random.choice(BOARD_DIMENSIONS)
        length = random.choice(BOARD_LENGTHS)
        template = random.choice(PRODUCT_TITLE_TEMPLATES)
        title = template.format(wood_type=wood_name, width=width, height=height, length=length)
        print(f"   • {title}")
    
    print("\n🏠 Примеры адресов самовывоза:")
    for i in range(3):
        address = generator.generate_pickup_address()
        print(f"   • {address}")
    
    print("\n💬 Примеры сообщений в чатах:")
    print("   Покупатели:")
    for msg in random.sample(CHAT_MESSAGES_BUYER, 2):
        print(f"     - {msg}")
    print("   Продавцы:")
    for msg in random.sample(CHAT_MESSAGES_SELLER, 2):
        print(f"     - {msg}")

def show_api_endpoints():
    """Показывает API endpoints, которые будут использоваться"""
    print("\n🔗 API Endpoints для создания данных:")
    endpoints = [
        "POST /api/v1/wood-types/",
        "POST /api/v1/wood-type-prices/",
        "POST /api/v1/buyers/",
        "POST /api/v1/sellers/",
        "POST /api/v1/products/",
        "POST /api/v1/images/",
        "POST /api/v1/wooden-boards/",
        "POST /api/v1/chat-threads/",
        "POST /api/v1/chat-messages/"
    ]
    
    for endpoint in endpoints:
        print(f"   {endpoint}")

def show_data_relationships():
    """Показывает связи между данными"""
    print("\n🔗 Связи между сущностями:")
    relationships = [
        "WoodType → WoodTypePrice (цены для типов древесины)",
        "Seller → Product (товары продавца)",
        "WoodType → Product (тип древесины товара)",
        "Product → Image (изображения товара)",
        "Image → WoodenBoard (анализ досок на изображении)",
        "Buyer + Seller → ChatThread (потоки общения)",
        "ChatThread → ChatMessage (сообщения в потоке)"
    ]
    
    for rel in relationships:
        print(f"   • {rel}")

def show_usage_examples():
    """Показывает примеры использования"""
    print("\n🛠️ Примеры использования:")
    print("\n   Быстрый старт:")
    print("   $ make add-data     # Создать все синтетические данные")
    print("   $ make rm-data      # Удалить все синтетические данные")
    
    print("\n   Ручное управление:")
    print("   $ cd data-generator")
    print("   $ python test_generator.py      # Проверить систему")
    print("   $ python generate_data.py       # Создать данные")
    print("   $ python remove_data.py         # Удалить данные")
    
    print("\n   Конфигурация (data-generator/.env):")
    print("   API_BASE_URL=http://localhost:8000/api/v1")
    print("   PRODUCTS_COUNT=350")
    print("   BUYERS_COUNT=75")
    print("   SELLERS_COUNT=25")

def show_safety_features():
    """Показывает функции безопасности"""
    print("\n🛡️ Функции безопасности:")
    features = [
        "UUID отслеживание - все созданные записи сохраняются в generated_uuids.json",
        "Полное удаление - команда rm-data удаляет ВСЕ синтетические данные",
        "Правильный порядок - создание и удаление учитывает внешние ключи",
        "Сохранение прогресса - при прерывании можно продолжить с места остановки",
        "Изоляция файлов - изображения копируются в отдельную папку",
        "Обработка ошибок - система продолжает работу при единичных сбоях"
    ]
    
    for feature in features:
        print(f"   ✓ {feature}")

def main():
    """Главная функция демонстрации"""
    show_data_samples()
    show_api_endpoints()
    show_data_relationships()
    show_usage_examples()
    show_safety_features()
    
    print("\n" + "=" * 70)
    print("🎉 Система готова к использованию!")
    print("\n💡 Для начала работы:")
    print("   1. Убедитесь, что backend API запущен на localhost:8000")
    print("   2. Запустите: make add-data")
    print("   3. Дождитесь завершения генерации (~5-10 минут)")
    print("   4. Наслаждайтесь реалистичными данными!")
    print("\n🗑️ Для очистки: make rm-data")

if __name__ == "__main__":
    main()
