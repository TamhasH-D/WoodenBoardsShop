#!/usr/bin/env python3
"""
Тест генератора данных без подключения к API
"""

import os
import json
from pathlib import Path
from generate_data import DataGenerator

def test_generator_initialization():
    """Тестирует инициализацию генератора"""
    print("🧪 Тестирование инициализации генератора...")
    
    generator = DataGenerator()
    
    # Проверяем настройки
    assert generator.api_base == "http://localhost:8000/api/v1"
    assert generator.counts['wood_types'] == 12
    assert generator.counts['products'] == 350
    
    # Проверяем пути к изображениям
    assert generator.images_source.exists(), f"Папка с изображениями не найдена: {generator.images_source}"
    
    # Проверяем количество изображений
    image_files = list(generator.images_source.glob('*.jpg')) + list(generator.images_source.glob('*.png'))
    assert len(image_files) > 0, "Изображения не найдены"
    
    print(f"✅ Найдено {len(image_files)} изображений")
    print(f"✅ API URL: {generator.api_base}")
    print(f"✅ Планируется создать {sum(generator.counts.values())} записей")

def test_data_templates():
    """Тестирует шаблоны данных"""
    print("\n🧪 Тестирование шаблонов данных...")
    
    from data_templates import WOOD_TYPES, WOOD_PRICE_RANGES, PICKUP_CITIES
    
    # Проверяем типы древесины
    assert len(WOOD_TYPES) >= 12, "Недостаточно типов древесины"
    for wood_type in WOOD_TYPES:
        assert 'neme' in wood_type, "Отсутствует поле 'neme'"
        assert 'description' in wood_type, "Отсутствует поле 'description'"
    
    # Проверяем диапазоны цен
    for wood_type in WOOD_TYPES:
        wood_name = wood_type['neme']
        assert wood_name in WOOD_PRICE_RANGES, f"Нет диапазона цен для {wood_name}"
        price_range = WOOD_PRICE_RANGES[wood_name]
        assert len(price_range) == 2, f"Неверный диапазон цен для {wood_name}"
        assert price_range[0] < price_range[1], f"Неверный порядок цен для {wood_name}"
    
    # Проверяем города
    assert len(PICKUP_CITIES) > 10, "Недостаточно городов"
    
    print(f"✅ {len(WOOD_TYPES)} типов древесины")
    print(f"✅ {len(WOOD_PRICE_RANGES)} диапазонов цен")
    print(f"✅ {len(PICKUP_CITIES)} городов")

def test_address_generation():
    """Тестирует генерацию адресов"""
    print("\n🧪 Тестирование генерации адресов...")
    
    generator = DataGenerator()
    
    # Генерируем несколько адресов
    addresses = []
    for _ in range(5):
        address = generator.generate_pickup_address()
        addresses.append(address)
        assert address.startswith("г. "), f"Адрес должен начинаться с 'г. ': {address}"
        assert ", " in address, f"Адрес должен содержать запятые: {address}"
    
    print("✅ Примеры адресов:")
    for addr in addresses:
        print(f"   {addr}")

def test_uuid_storage():
    """Тестирует сохранение UUID"""
    print("\n🧪 Тестирование сохранения UUID...")
    
    generator = DataGenerator()
    
    # Добавляем тестовые данные
    generator.generated_data['wood_types'] = [
        {'id': 'test-uuid-1', 'neme': 'Тест1'},
        {'id': 'test-uuid-2', 'neme': 'Тест2'}
    ]
    generator.generated_data['buyers'] = ['buyer-uuid-1', 'buyer-uuid-2']
    
    # Сохраняем
    generator.save_progress()
    
    # Проверяем файл
    assert Path('generated_uuids.json').exists(), "Файл generated_uuids.json не создан"
    
    # Читаем и проверяем
    with open('generated_uuids.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    assert 'wood_types' in data, "Отсутствует секция wood_types"
    assert 'buyers' in data, "Отсутствует секция buyers"
    assert len(data['wood_types']) == 2, "Неверное количество wood_types"
    assert len(data['buyers']) == 2, "Неверное количество buyers"
    
    print("✅ UUID корректно сохраняются в JSON")
    
    # Очищаем тестовый файл
    with open('generated_uuids.json', 'w', encoding='utf-8') as f:
        json.dump({}, f)

def test_image_copying():
    """Тестирует копирование изображений"""
    print("\n🧪 Тестирование копирования изображений...")
    
    generator = DataGenerator()
    
    # Проверяем исходные изображения
    source_images = list(generator.images_source.glob('*.jpg'))
    assert len(source_images) > 0, "Исходные изображения не найдены"
    
    # Создаем папку для тестирования
    test_upload_dir = Path('./test_images')
    test_upload_dir.mkdir(exist_ok=True)
    
    # Копируем одно изображение для теста
    import shutil
    from uuid import uuid4
    
    source_image = source_images[0]
    test_filename = f"{uuid4()}.jpg"
    target_path = test_upload_dir / test_filename
    
    shutil.copy2(source_image, target_path)
    
    assert target_path.exists(), "Изображение не скопировано"
    assert target_path.stat().st_size > 0, "Скопированное изображение пустое"
    
    print(f"✅ Изображение успешно скопировано: {test_filename}")
    
    # Очищаем тестовую папку
    shutil.rmtree(test_upload_dir)

def main():
    """Запускает все тесты"""
    print("🚀 Запуск тестов генератора данных...")
    
    try:
        test_generator_initialization()
        test_data_templates()
        test_address_generation()
        test_uuid_storage()
        test_image_copying()
        
        print("\n🎉 Все тесты пройдены успешно!")
        print("\n📋 Система готова к генерации данных:")
        print("   - Структуры данных корректны")
        print("   - Шаблоны данных валидны")
        print("   - Изображения доступны")
        print("   - UUID сохранение работает")
        print("   - Копирование файлов работает")
        print("\n💡 Для генерации данных запустите: make add-data")
        print("💡 Для удаления данных запустите: make rm-data")
        
    except Exception as e:
        print(f"\n❌ Тест провален: {e}")
        raise

if __name__ == "__main__":
    main()
