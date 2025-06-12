#!/usr/bin/env python3
"""
Тест API endpoints для проверки работы поиска продуктов
"""

import asyncio
import sys
import os
from uuid import uuid4

# Добавляем путь к backend модулям
sys.path.append(os.path.dirname(__file__))

async def test_search_endpoint_simulation():
    """Симуляция работы search endpoint"""
    print("🧪 Симуляция работы /products/search endpoint...")
    
    try:
        from backend.dtos import PaginationParamsSortBy
        from backend.dtos.product_dtos import ProductFilterDTO, ProductDTO
        from backend.daos.product_daos import ProductDAO
        from backend.models.product_models import Product
        
        # Создаем фиктивную сессию для тестирования
        class MockSession:
            async def execute(self, query):
                print(f"📝 SQL Query: {query}")
                return MockResult()
        
        class MockResult:
            def scalars(self):
                return []
        
        # Создаем DAO
        dao = ProductDAO(MockSession())
        
        # Переопределяем метод для тестирования
        async def mock_compute_pagination(query):
            from backend.dtos import OffsetPaginationMetadata
            return OffsetPaginationMetadata(total=50)
        
        dao._compute_offset_pagination = mock_compute_pagination
        
        # Тест 1: Простой поиск с сортировкой
        print("\n📋 Тест 1: Простой поиск с сортировкой")
        pagination = PaginationParamsSortBy(
            offset=0,
            limit=20,
            sort_by='created_at',
            sort_order='desc'
        )
        
        filters = ProductFilterDTO(
            search_query='древесина'
        )
        
        result = await dao.get_filtered_results(
            out_dto=ProductDTO,
            pagination=pagination,
            filters=filters
        )
        print(f"✅ Результат: {len(result.data)} записей, всего: {result.pagination.total}")
        
        # Тест 2: Сложные фильтры
        print("\n📋 Тест 2: Сложные фильтры")
        filters = ProductFilterDTO(
            search_query='сосна',
            price_min=100.0,
            price_max=1000.0,
            volume_min=0.5,
            volume_max=10.0,
            wood_type_ids=[uuid4(), uuid4()],
            delivery_possible=True
        )
        
        pagination = PaginationParamsSortBy(
            offset=20,
            limit=20,
            sort_by='price',
            sort_order='asc'
        )
        
        result = await dao.get_filtered_results(
            out_dto=ProductDTO,
            pagination=pagination,
            filters=filters
        )
        print(f"✅ Результат: {len(result.data)} записей, всего: {result.pagination.total}")
        
        # Тест 3: Сортировка по разным полям
        print("\n📋 Тест 3: Сортировка по разным полям")
        test_sorts = [
            ('title', 'asc'),
            ('price', 'desc'),
            ('volume', 'asc'),
            ('created_at', 'desc')
        ]
        
        for sort_by, sort_order in test_sorts:
            pagination = PaginationParamsSortBy(
                offset=0,
                limit=10,
                sort_by=sort_by,
                sort_order=sort_order
            )
            
            filters = ProductFilterDTO()
            
            result = await dao.get_filtered_results(
                out_dto=ProductDTO,
                pagination=pagination,
                filters=filters
            )
            print(f"✅ Сортировка по {sort_by} {sort_order}: OK")
        
    except Exception as e:
        print(f"❌ Ошибка в тестировании: {e}")
        import traceback
        traceback.print_exc()

def test_fastapi_parameter_parsing():
    """Тест парсинга параметров FastAPI"""
    print("\n🧪 Тестирование парсинга параметров FastAPI...")
    
    try:
        from fastapi import FastAPI, Depends
        from backend.dtos import PaginationParamsSortBy
        from backend.dtos.product_dtos import ProductFilterDTO
        
        app = FastAPI()
        
        # Симуляция endpoint
        @app.get("/test-search")
        async def test_search(
            pagination: PaginationParamsSortBy = Depends(),
            filters: ProductFilterDTO = Depends()
        ):
            return {
                "pagination": pagination,
                "filters": filters
            }
        
        print("✅ FastAPI endpoint определен корректно")
        
        # Тест создания объектов напрямую
        pagination = PaginationParamsSortBy(
            offset=0,
            limit=20,
            sort_by='created_at',
            sort_order='desc'
        )
        
        filters = ProductFilterDTO(
            search_query='тест',
            price_min=100.0,
            wood_type_ids=[uuid4()]
        )
        
        print(f"✅ PaginationParamsSortBy: {pagination}")
        print(f"✅ ProductFilterDTO: {filters}")
        
    except Exception as e:
        print(f"❌ Ошибка в тестировании FastAPI: {e}")

def test_url_parameter_simulation():
    """Симуляция обработки URL параметров"""
    print("\n🧪 Симуляция обработки URL параметров...")
    
    # Симуляция query string как он приходит от фронтенда
    query_string = "offset=0&limit=20&sort_by=created_at&sort_order=desc&search_query=древесина&price_min=100.0&price_max=1000.0&wood_type_ids=123e4567-e89b-12d3-a456-426614174000&wood_type_ids=456e7890-e89b-12d3-a456-426614174001&delivery_possible=true"
    
    print(f"📋 Query string: {query_string}")
    
    # Парсим как это делает FastAPI
    from urllib.parse import parse_qs
    parsed = parse_qs(query_string)
    
    print("📋 Распарсенные параметры:")
    for key, values in parsed.items():
        print(f"  {key}: {values}")
    
    # Проверяем, что массивы обрабатываются корректно
    if 'wood_type_ids' in parsed:
        wood_type_ids = parsed['wood_type_ids']
        print(f"✅ wood_type_ids массив: {wood_type_ids}")
    
    # Проверяем boolean
    if 'delivery_possible' in parsed:
        delivery_possible = parsed['delivery_possible'][0].lower() == 'true'
        print(f"✅ delivery_possible boolean: {delivery_possible}")

async def main():
    """Главная функция"""
    print("🚀 Тестирование API endpoints для поиска продуктов\n")
    
    await test_search_endpoint_simulation()
    test_fastapi_parameter_parsing()
    test_url_parameter_simulation()
    
    print("\n✨ Тестирование завершено!")

if __name__ == "__main__":
    asyncio.run(main())
