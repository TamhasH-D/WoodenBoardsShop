#!/usr/bin/env python3
"""
Тест интеграции с YOLO сервисом для генератора данных
"""

import os
import sys
from pathlib import Path
from generate_data import DataGenerator

def test_yolo_integration():
    """Тестирует интеграцию с YOLO сервисом"""
    print("🧪 Тестирование интеграции с YOLO сервисом...")
    
    # Создаем генератор
    generator = DataGenerator()
    
    # Проверяем доступность основного API
    print("\n1. Проверка основного API...")
    if generator.check_api_health():
        print("✅ Основной API доступен")
    else:
        print("❌ Основной API недоступен")
        return False
    
    # Проверяем доступность YOLO сервиса
    print("\n2. Проверка YOLO сервиса...")
    if generator.check_yolo_service_health():
        print("✅ YOLO сервис доступен")
    else:
        print("❌ YOLO сервис недоступен")
        print("💡 Убедитесь, что YOLO backend запущен на порту 8001")
        return False
    
    # Проверяем наличие изображений
    print("\n3. Проверка изображений...")
    if generator.images_source.exists():
        image_files = list(generator.images_source.glob('*.jpg')) + list(generator.images_source.glob('*.png'))
        if image_files:
            print(f"✅ Найдено {len(image_files)} изображений для анализа")
        else:
            print("❌ Изображения не найдены")
            return False
    else:
        print(f"❌ Папка с изображениями не найдена: {generator.images_source}")
        return False
    
    print("\n🎉 Все проверки пройдены! Система готова к генерации данных с YOLO анализом.")
    return True

def show_yolo_config():
    """Показывает конфигурацию YOLO"""
    print("\n📋 Конфигурация YOLO:")
    print(f"  YOLO_SERVICE_URL: {os.getenv('YOLO_SERVICE_URL', 'http://localhost:8001')}")
    print(f"  YOLO_REQUEST_TIMEOUT: {os.getenv('YOLO_REQUEST_TIMEOUT', '120')} секунд")
    
    generator = DataGenerator()
    print(f"  Папка с изображениями: {generator.images_source}")
    print(f"  Папка для загрузки: {generator.images_upload_base}")

def main():
    """Главная функция"""
    print("🔬 Тест интеграции генератора данных с YOLO сервисом")
    print("=" * 60)
    
    show_yolo_config()
    
    if test_yolo_integration():
        print("\n✅ Тест пройден успешно!")
        print("\n💡 Для запуска генерации с YOLO анализом используйте:")
        print("   python generate_data.py")
    else:
        print("\n❌ Тест не пройден!")
        print("\n🔧 Для исправления проблем:")
        print("   1. Запустите backend API: docker compose up backend")
        print("   2. Запустите YOLO сервис: docker compose up yolo-service")
        print("   3. Убедитесь, что папка с изображениями существует")
        sys.exit(1)

if __name__ == "__main__":
    main()
