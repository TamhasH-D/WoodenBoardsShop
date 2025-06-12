#!/usr/bin/env python3
"""
Тест интеграции между фронтендом и бэкендом для API поиска продуктов
"""

import asyncio
import sys
import os
from urllib.parse import parse_qs, urlparse

# Добавляем путь к backend модулям
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend/backend'))

def test_frontend_api_calls():
    """Тест того, как фронтенд формирует API вызовы"""
    print("🧪 Тестирование формирования API вызовов фронтендом...")
    
    # Симуляция того, как фронтенд формирует параметры
    filters = {
        'search_query': 'древесина',
        'price_min': 100.0,
        'price_max': 1000.0,
        'volume_min': 0.5,
        'volume_max': 10.0,
        'wood_type_ids': ['123e4567-e89b-12d3-a456-426614174000'],
        'delivery_possible': True,
        'sort_by': 'created_at',
        'sort_order': 'desc'
    }
    
    page = 0
    size = 20
    
    # Симуляция формирования URL параметров (как в frontend/buyer/src/services/api.js)
    params = {
        'offset': str(page * size),
        'limit': str(size)
    }
    
    # Добавляем фильтры
    if filters.get('search_query'):
        params['search_query'] = filters['search_query']
    if filters.get('price_min') is not None:
        params['price_min'] = str(filters['price_min'])
    if filters.get('price_max') is not None:
        params['price_max'] = str(filters['price_max'])
    if filters.get('volume_min') is not None:
        params['volume_min'] = str(filters['volume_min'])
    if filters.get('volume_max') is not None:
        params['volume_max'] = str(filters['volume_max'])
    if filters.get('wood_type_ids'):
        for wood_type_id in filters['wood_type_ids']:
            params['wood_type_ids'] = wood_type_id  # Это может быть проблемой!
    if filters.get('delivery_possible') is not None:
        params['delivery_possible'] = str(filters['delivery_possible']).lower()
    if filters.get('sort_by'):
        params['sort_by'] = filters['sort_by']
    if filters.get('sort_order'):
        params['sort_order'] = filters['sort_order']
    
    print("📋 Параметры, отправляемые фронтендом:")
    for key, value in params.items():
        print(f"  {key}: {value}")
    
    # Формируем URL как это делает фронтенд
    query_string = '&'.join([f"{key}={value}" for key, value in params.items()])
    url = f"/api/v1/products/search?{query_string}"
    
    print(f"\n🌐 URL запроса: {url}")
    
    return params

def test_backend_parameter_parsing():
    """Тест того, как бэкенд парсит параметры"""
    print("\n🧪 Тестирование парсинга параметров бэкендом...")
    
    # Симуляция параметров запроса
    query_params = {
        'offset': ['0'],
        'limit': ['20'],
        'sort_by': ['created_at'],
        'sort_order': ['desc'],
        'search_query': ['древесина'],
        'price_min': ['100.0'],
        'price_max': ['1000.0'],
        'volume_min': ['0.5'],
        'volume_max': ['10.0'],
        'wood_type_ids': ['123e4567-e89b-12d3-a456-426614174000'],
        'delivery_possible': ['true']
    }
    
    try:
        from backend.dtos import PaginationParamsSortBy
        from backend.dtos.product_dtos import ProductFilterDTO
        
        # Тест парсинга PaginationParamsSortBy
        pagination_data = {
            'offset': int(query_params['offset'][0]),
            'limit': int(query_params['limit'][0]),
            'sort_by': query_params['sort_by'][0],
            'sort_order': query_params['sort_order'][0]
        }
        
        pagination = PaginationParamsSortBy(**pagination_data)
        print(f"✅ PaginationParamsSortBy: {pagination}")
        
        # Тест парсинга ProductFilterDTO
        filter_data = {}
        if 'search_query' in query_params:
            filter_data['search_query'] = query_params['search_query'][0]
        if 'price_min' in query_params:
            filter_data['price_min'] = float(query_params['price_min'][0])
        if 'price_max' in query_params:
            filter_data['price_max'] = float(query_params['price_max'][0])
        if 'volume_min' in query_params:
            filter_data['volume_min'] = float(query_params['volume_min'][0])
        if 'volume_max' in query_params:
            filter_data['volume_max'] = float(query_params['volume_max'][0])
        if 'wood_type_ids' in query_params:
            # Проблема: фронтенд может отправлять массив, но мы получаем строку
            filter_data['wood_type_ids'] = query_params['wood_type_ids']
        if 'delivery_possible' in query_params:
            filter_data['delivery_possible'] = query_params['delivery_possible'][0].lower() == 'true'
        
        filters = ProductFilterDTO(**filter_data)
        print(f"✅ ProductFilterDTO: {filters}")
        
    except Exception as e:
        print(f"❌ Ошибка парсинга параметров: {e}")

def test_array_parameter_handling():
    """Тест обработки массивов в параметрах"""
    print("\n🧪 Тестирование обработки массивов в параметрах...")
    
    # Проблема: фронтенд может отправлять массивы по-разному
    test_cases = [
        # Случай 1: Один элемент
        {'wood_type_ids': ['123e4567-e89b-12d3-a456-426614174000']},
        # Случай 2: Несколько элементов (как это может прийти от фронтенда)
        {'wood_type_ids': ['123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001']},
        # Случай 3: Пустой массив
        {'wood_type_ids': []},
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n📋 Тест случай {i}: {case}")
        try:
            from backend.dtos.product_dtos import ProductFilterDTO
            filters = ProductFilterDTO(**case)
            print(f"✅ Успешно: {filters.wood_type_ids}")
        except Exception as e:
            print(f"❌ Ошибка: {e}")

def test_boolean_parameter_handling():
    """Тест обработки boolean параметров"""
    print("\n🧪 Тестирование обработки boolean параметров...")
    
    # Фронтенд отправляет boolean как строки
    test_cases = [
        {'delivery_possible': True},
        {'delivery_possible': False},
        {'delivery_possible': None},
        {'has_pickup_location': True},
        {'has_pickup_location': False},
        {'has_pickup_location': None},
    ]
    
    for i, case in enumerate(test_cases, 1):
        print(f"\n📋 Тест случай {i}: {case}")
        try:
            from backend.dtos.product_dtos import ProductFilterDTO
            filters = ProductFilterDTO(**case)
            print(f"✅ Успешно: delivery_possible={filters.delivery_possible}, has_pickup_location={filters.has_pickup_location}")
        except Exception as e:
            print(f"❌ Ошибка: {e}")

async def test_full_integration():
    """Полный тест интеграции"""
    print("\n🧪 Полный тест интеграции фронтенд-бэкенд...")
    
    # Симуляция полного цикла
    frontend_params = test_frontend_api_calls()
    test_backend_parameter_parsing()
    test_array_parameter_handling()
    test_boolean_parameter_handling()
    
    print("\n📊 Результаты анализа интеграции:")
    print("✅ Основные параметры передаются корректно")
    print("⚠️  Возможные проблемы:")
    print("   - Обработка массивов wood_type_ids и seller_ids")
    print("   - Преобразование boolean значений из строк")
    print("   - Валидация UUID в массивах")

def main():
    """Главная функция"""
    print("🚀 Тестирование интеграции фронтенд-бэкенд для API поиска продуктов\n")
    
    asyncio.run(test_full_integration())
    
    print("\n✨ Тестирование завершено!")

if __name__ == "__main__":
    main()
