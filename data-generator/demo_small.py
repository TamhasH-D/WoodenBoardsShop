#!/usr/bin/env python3
"""
Демо-скрипт для тестирования генератора с малым профилем
"""

import os
from generate_data import DataGenerator

def main():
    """Запускает генерацию с малым профилем для тестирования"""
    
    # Устанавливаем малый профиль
    os.environ['GENERATION_PROFILE'] = 'small'
    
    print("🧪 Демо-генерация с малым профилем")
    print("=" * 50)
    
    generator = DataGenerator()
    
    print(f"📋 Профиль: {generator.profile}")
    print(f"📊 Планируется создать:")
    
    total_planned = 0
    for entity, count in generator.counts.items():
        print(f"  - {entity}: {count}")
        total_planned += count
    print(f"  📝 Всего записей: {total_planned}")
    print()
    
    # Проверяем API
    if not generator.check_api_health():
        print("❌ API недоступен. Запустите backend командой 'make backend-up'")
        return
    
    # Запускаем генерацию
    try:
        generator.run_generation()
    except KeyboardInterrupt:
        print("\n⚠️ Генерация прервана")
    except Exception as e:
        print(f"\n❌ Ошибка: {e}")

if __name__ == "__main__":
    main()
