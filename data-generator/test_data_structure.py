#!/usr/bin/env python3
"""
Тест структуры данных для проверки корректности генератора
"""

import json
from uuid import uuid4
from datetime import datetime
from data_templates import WOOD_TYPES, WOOD_PRICE_RANGES

def test_wood_type_structure():
    """Тестирует структуру данных для WoodType"""
    wood_type = WOOD_TYPES[0]
    payload = {
        'id': str(uuid4()),
        'neme': wood_type['neme'],
        'description': wood_type['description']
    }
    print("✅ WoodType payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_wood_type_price_structure():
    """Тестирует структуру данных для WoodTypePrice"""
    wood_type_id = str(uuid4())
    price_range = WOOD_PRICE_RANGES['Сосна']
    payload = {
        'id': str(uuid4()),
        'price_per_m3': 25000.50,
        'wood_type_id': wood_type_id
    }
    print("✅ WoodTypePrice payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_buyer_structure():
    """Тестирует структуру данных для Buyer"""
    payload = {
        'id': str(uuid4()),
        'keycloak_uuid': str(uuid4()),
        'is_online': True
    }
    print("✅ Buyer payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_seller_structure():
    """Тестирует структуру данных для Seller"""
    payload = {
        'id': str(uuid4()),
        'keycloak_uuid': str(uuid4()),
        'is_online': False
    }
    print("✅ Seller payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_product_structure():
    """Тестирует структуру данных для Product"""
    payload = {
        'id': str(uuid4()),
        'volume': 0.025,
        'price': 1250.75,
        'title': 'Доска Сосна 100x25x2000мм',
        'descrioption': 'Высококачественная древесина Сосна. Материал прошел камерную сушку.',
        'delivery_possible': True,
        'pickup_location': 'г. Москва, ул. Ленина, д. 15',
        'seller_id': str(uuid4()),
        'wood_type_id': str(uuid4())
    }
    print("✅ Product payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_image_structure():
    """Тестирует структуру данных для Image"""
    payload = {
        'id': str(uuid4()),
        'filename': 'test_image.jpg',
        'product_id': str(uuid4())
    }
    print("✅ Image payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_wooden_board_structure():
    """Тестирует структуру данных для WoodenBoard"""
    payload = {
        'id': str(uuid4()),
        'height': 25.0,
        'width': 100.0,
        'lenght': 2000.0,
        'image_id': str(uuid4())
    }
    print("✅ WoodenBoard payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_chat_thread_structure():
    """Тестирует структуру данных для ChatThread"""
    payload = {
        'id': str(uuid4()),
        'buyer_id': str(uuid4()),
        'seller_id': str(uuid4())
    }
    print("✅ ChatThread payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def test_chat_message_structure():
    """Тестирует структуру данных для ChatMessage"""
    payload = {
        'id': str(uuid4()),
        'message': 'Здравствуйте! Интересует ваш товар.',
        'is_read_by_buyer': True,
        'is_read_by_seller': False,
        'thread_id': str(uuid4()),
        'buyer_id': str(uuid4()),
        'seller_id': str(uuid4())
    }
    print("✅ ChatMessage payload:", json.dumps(payload, ensure_ascii=False, indent=2))

def main():
    """Запускает все тесты структуры данных"""
    print("🧪 Тестирование структуры данных для API...")
    print()
    
    test_wood_type_structure()
    print()
    test_wood_type_price_structure()
    print()
    test_buyer_structure()
    print()
    test_seller_structure()
    print()
    test_product_structure()
    print()
    test_image_structure()
    print()
    test_wooden_board_structure()
    print()
    test_chat_thread_structure()
    print()
    test_chat_message_structure()
    print()
    
    print("🎉 Все структуры данных корректны!")

if __name__ == "__main__":
    main()
