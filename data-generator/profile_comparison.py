#!/usr/bin/env python3
"""
Скрипт для сравнения профилей генерации данных
"""

import os
from generate_data import DataGenerator

def compare_profiles():
    """Сравнивает все профили генерации"""
    
    profiles = ['small', 'medium', 'large', 'enterprise']
    
    print("📊 Сравнение профилей генерации данных")
    print("=" * 80)
    
    # Заголовок таблицы
    print(f"{'Профиль':<12} {'Всего':<8} {'Древесина':<10} {'Товары':<8} {'Покупатели':<11} {'Продавцы':<10} {'Чаты':<8}")
    print("-" * 80)
    
    total_comparison = {}
    
    for profile in profiles:
        # Временно устанавливаем профиль
        original_profile = os.environ.get('GENERATION_PROFILE', 'large')
        os.environ['GENERATION_PROFILE'] = profile
        
        # Создаем генератор для этого профиля
        generator = DataGenerator()
        
        # Подсчитываем общее количество записей
        total_records = sum(generator.counts.values())
        
        # Выводим строку таблицы
        print(f"{profile:<12} {total_records:<8,} {generator.counts['wood_types']:<10} "
              f"{generator.counts['products']:<8,} {generator.counts['buyers']:<11,} "
              f"{generator.counts['sellers']:<10} {generator.counts['chat_messages']:<8,}")
        
        total_comparison[profile] = total_records
        
        # Восстанавливаем оригинальный профиль
        os.environ['GENERATION_PROFILE'] = original_profile
    
    print("-" * 80)
    
    # Показываем увеличение относительно small профиля
    small_total = total_comparison['small']
    print(f"\n📈 Увеличение относительно профиля 'small':")
    for profile, total in total_comparison.items():
        if profile != 'small':
            increase = (total / small_total - 1) * 100
            print(f"  {profile}: +{increase:.0f}% ({total:,} vs {small_total:,})")
    
    # Рекомендации
    print(f"\n💡 Рекомендации по использованию:")
    print(f"  🧪 small     - Быстрое тестирование функций (2-3 мин)")
    print(f"  🔧 medium    - Разработка и отладка (8-10 мин)")
    print(f"  🎯 large     - Полное тестирование системы (25-30 мин)")
    print(f"  🚀 enterprise - Нагрузочное тестирование (60-90 мин)")
    
    print(f"\n⚙️ Для смены профиля отредактируйте .env файл:")
    print(f"  GENERATION_PROFILE=small|medium|large|enterprise")

def estimate_time():
    """Оценивает время генерации для каждого профиля"""
    
    # Примерные оценки времени (в минутах) на основе количества записей
    time_estimates = {
        'small': (2, 3),
        'medium': (8, 10), 
        'large': (25, 30),
        'enterprise': (60, 90)
    }
    
    print(f"\n⏱️ Оценка времени генерации:")
    print("-" * 40)
    
    for profile, (min_time, max_time) in time_estimates.items():
        print(f"{profile:<12} {min_time:>3}-{max_time:<3} минут")
    
    print(f"\n⚠️ Время зависит от:")
    print(f"  - Производительности системы")
    print(f"  - Скорости сети до API")
    print(f"  - Загрузки backend сервера")

if __name__ == "__main__":
    compare_profiles()
    estimate_time()
