#!/usr/bin/env python3
"""
Утилита для проверки состояния генератора данных
"""

import json
import os
from pathlib import Path
from datetime import datetime
from generate_data import DataGenerator

def check_api_status():
    """Проверяет состояние API"""
    print("🌐 Проверка API...")
    
    generator = DataGenerator()
    
    if generator.check_api_health():
        print("  ✅ API доступен и работает")
        return True
    else:
        print("  ❌ API недоступен")
        print("  💡 Запустите backend: make backend-up")
        return False

def check_images():
    """Проверяет наличие изображений"""
    print("\n🖼️ Проверка изображений...")
    
    generator = DataGenerator()
    
    if not generator.images_source.exists():
        print(f"  ❌ Папка с изображениями не найдена: {generator.images_source}")
        return False
    
    image_files = list(generator.images_source.glob('*.jpg')) + list(generator.images_source.glob('*.png'))
    
    if len(image_files) == 0:
        print("  ❌ Изображения не найдены")
        return False
    
    print(f"  ✅ Найдено {len(image_files)} изображений")
    return True

def check_configuration():
    """Проверяет конфигурацию"""
    print("\n⚙️ Проверка конфигурации...")
    
    env_file = Path('.env')
    if not env_file.exists():
        print("  ⚠️ Файл .env не найден")
        print("  💡 Скопируйте .env.example в .env")
        return False
    
    generator = DataGenerator()
    
    print(f"  📋 Профиль: {generator.profile}")
    print(f"  🌐 API URL: {generator.api_base}")
    print(f"  ⏱️ Таймаут: {generator.timeout}с")
    print(f"  🔄 Повторы: {generator.max_retries}")
    
    total_records = sum(generator.counts.values())
    print(f"  📊 Планируется создать: {total_records:,} записей")
    
    return True

def check_previous_generation():
    """Проверяет результаты предыдущей генерации"""
    print("\n📁 Проверка предыдущих генераций...")
    
    # Проверяем файл с UUID
    uuid_file = Path('generated_uuids.json')
    if uuid_file.exists():
        try:
            with open(uuid_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            total_existing = 0
            print("  📝 Найдены данные предыдущей генерации:")
            for entity, records in data.items():
                count = len(records) if isinstance(records, list) else 0
                if count > 0:
                    print(f"    - {entity}: {count:,}")
                    total_existing += count
            
            if total_existing > 0:
                print(f"  📊 Всего записей: {total_existing:,}")
                print("  ⚠️ Для очистки используйте: make rm-data")
            else:
                print("  ✅ Нет данных предыдущих генераций")
                
        except Exception as e:
            print(f"  ❌ Ошибка чтения файла UUID: {e}")
            return False
    else:
        print("  ✅ Нет данных предыдущих генераций")
    
    # Проверяем отчеты
    report_files = list(Path('.').glob('generation_report_*.json'))
    if report_files:
        print(f"  📊 Найдено {len(report_files)} отчетов о генерации")
        
        # Показываем последний отчет
        latest_report = max(report_files, key=lambda x: x.stat().st_mtime)
        try:
            with open(latest_report, 'r', encoding='utf-8') as f:
                report = json.load(f)
            
            timestamp = datetime.fromisoformat(report['timestamp'].replace('Z', '+00:00'))
            print(f"  📅 Последняя генерация: {timestamp.strftime('%d.%m.%Y %H:%M')}")
            print(f"  📋 Профиль: {report.get('profile', 'unknown')}")
            
            if 'stats' in report and report['stats'].get('end_time'):
                duration = report['stats']['end_time']
                print(f"  ⏱️ Время выполнения: {duration}")
                
        except Exception as e:
            print(f"  ⚠️ Ошибка чтения отчета: {e}")
    
    return True

def check_disk_space():
    """Проверяет место на диске"""
    print("\n💾 Проверка места на диске...")
    
    try:
        import shutil
        total, used, free = shutil.disk_usage('.')
        
        free_gb = free // (1024**3)
        total_gb = total // (1024**3)
        
        print(f"  💽 Свободно: {free_gb} ГБ из {total_gb} ГБ")
        
        if free_gb < 1:
            print("  ⚠️ Мало места на диске (< 1 ГБ)")
            return False
        elif free_gb < 5:
            print("  ⚠️ Рекомендуется освободить место (< 5 ГБ)")
        else:
            print("  ✅ Достаточно места на диске")
            
        return True
        
    except Exception as e:
        print(f"  ❌ Ошибка проверки диска: {e}")
        return False

def main():
    """Основная функция проверки"""
    print("🔍 Проверка состояния генератора данных")
    print("=" * 50)
    
    checks = [
        ("API", check_api_status),
        ("Изображения", check_images),
        ("Конфигурация", check_configuration),
        ("Предыдущие генерации", check_previous_generation),
        ("Место на диске", check_disk_space)
    ]
    
    results = {}
    
    for name, check_func in checks:
        try:
            results[name] = check_func()
        except Exception as e:
            print(f"  ❌ Ошибка проверки {name}: {e}")
            results[name] = False
    
    # Итоговый статус
    print("\n" + "=" * 50)
    print("📋 Итоговый статус:")
    
    all_good = True
    for name, status in results.items():
        icon = "✅" if status else "❌"
        print(f"  {icon} {name}")
        if not status:
            all_good = False
    
    if all_good:
        print("\n🎉 Все проверки пройдены! Генератор готов к работе.")
        print("💡 Запустите генерацию: make add-data")
    else:
        print("\n⚠️ Обнаружены проблемы. Исправьте их перед генерацией.")

if __name__ == "__main__":
    main()
