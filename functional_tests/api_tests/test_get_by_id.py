"""
Тесты GET by ID операций для всех endpoints.
Проверяют получение сущностей по ID.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_buyer_by_id() -> None:
    """Тест получения покупателя по ID: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Получаем покупателя по ID
        get_response = await client.get(f"/api/v1/buyers/{created_buyer['id']}")
        retrieved_buyer = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_buyer, "buyer")
        
        # Проверка соответствия данных
        assert retrieved_buyer["id"] == created_buyer["id"]
        assert retrieved_buyer["keycloak_uuid"] == created_buyer["keycloak_uuid"]
        assert retrieved_buyer["is_online"] == created_buyer["is_online"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_seller_by_id() -> None:
    """Тест получения продавца по ID: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем продавца
        seller_data = generate_test_data("seller")
        create_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(create_response, 201)
        
        # Получаем продавца по ID
        get_response = await client.get(f"/api/v1/sellers/{created_seller['id']}")
        retrieved_seller = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_seller, "seller")
        
        # Проверка соответствия данных
        assert retrieved_seller["id"] == created_seller["id"]
        assert retrieved_seller["keycloak_uuid"] == created_seller["keycloak_uuid"]
        assert retrieved_seller["is_online"] == created_seller["is_online"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_wood_type_by_id() -> None:
    """Тест получения типа древесины по ID: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        create_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(create_response, 201)
        
        # Получаем тип древесины по ID
        get_response = await client.get(f"/api/v1/wood-types/{created_wood_type['id']}")
        retrieved_wood_type = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_wood_type, "wood_type")
        
        # Проверка соответствия данных
        assert retrieved_wood_type["id"] == created_wood_type["id"]
        assert retrieved_wood_type["neme"] == created_wood_type["neme"]
        assert retrieved_wood_type["description"] == created_wood_type["description"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_nonexistent_buyer() -> None:
    """Тест получения несуществующего покупателя: 404."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся получить несуществующего покупателя
        nonexistent_id = "550e8400-e29b-41d4-a716-446655440000"
        get_response = await client.get(f"/api/v1/buyers/{nonexistent_id}")
        
        # Ожидаем ошибку "не найдено"
        assert get_response.status_code == 404, (
            f"Expected 404 for non-existent entity, got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_invalid_id() -> None:
    """Тест получения с невалидным ID: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся получить с невалидным ID
        invalid_id = "invalid-uuid"
        get_response = await client.get(f"/api/v1/buyers/{invalid_id}")
        
        # Ожидаем ошибку валидации
        assert get_response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_product_by_id_with_dependencies() -> None:
    """Тест получения товара по ID с зависимостями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем зависимости
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем товар
        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["wood_type_id"] = created_wood_type["id"]
        create_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(create_response, 201)
        
        # Получаем товар по ID
        get_response = await client.get(f"/api/v1/products/{created_product['id']}")
        retrieved_product = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_product, "product")
        
        # Проверка соответствия данных
        assert retrieved_product["id"] == created_product["id"]
        assert retrieved_product["seller_id"] == created_product["seller_id"]
        assert retrieved_product["wood_type_id"] == created_product["wood_type_id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_image_by_id_with_dependencies() -> None:
    """Тест получения изображения по ID с зависимостями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем полную цепочку зависимостей
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["wood_type_id"] = created_wood_type["id"]
        product_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(product_response, 201)
        
        # Создаем изображение
        image_data = generate_test_data("image")
        image_data["product_id"] = created_product["id"]
        create_response = await client.post("/api/v1/images/", json=image_data)
        created_image = assert_response_success(create_response, 201)
        
        # Получаем изображение по ID
        get_response = await client.get(f"/api/v1/images/{created_image['id']}")
        retrieved_image = assert_response_success(get_response, 200)
        
        # Валидация полей
        validate_entity_fields(retrieved_image, "image")
        
        # Проверка соответствия данных
        assert retrieved_image["id"] == created_image["id"]
        assert retrieved_image["product_id"] == created_image["product_id"]
        assert retrieved_image["image_path"] == created_image["image_path"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.performance
@pytest.mark.fast
async def test_get_by_id_performance() -> None:
    """Тест производительности получения по ID."""
    import time
    
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем несколько покупателей
        created_buyers = []
        for i in range(5):
            buyer_data = generate_test_data("buyer")
            create_response = await client.post("/api/v1/buyers/", json=buyer_data)
            created_buyer = assert_response_success(create_response, 201)
            created_buyers.append(created_buyer)
        
        # Измеряем время получения по ID
        start_time = time.time()
        
        for buyer in created_buyers:
            get_response = await client.get(f"/api/v1/buyers/{buyer['id']}")
            retrieved_buyer = assert_response_success(get_response, 200)
            assert retrieved_buyer["id"] == buyer["id"]
        
        end_time = time.time()
        retrieval_time = end_time - start_time
        
        # Проверяем производительность (не более 5 секунд на 5 запросов)
        assert retrieval_time < 5.0, f"Getting 5 buyers took too long: {retrieval_time:.2f} seconds"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_all_entity_types_by_id() -> None:
    """Интеграционный тест: получение всех типов сущностей по ID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем и проверяем каждый тип сущности
        entities_to_test = [
            ("buyer", "/api/v1/buyers/"),
            ("seller", "/api/v1/sellers/"),
            ("wood_type", "/api/v1/wood-types/"),
        ]
        
        for entity_type, endpoint in entities_to_test:
            # Создаем сущность
            entity_data = generate_test_data(entity_type)
            create_response = await client.post(endpoint, json=entity_data)
            created_entity = assert_response_success(create_response, 201)
            
            # Получаем по ID
            get_response = await client.get(f"{endpoint}{created_entity['id']}")
            retrieved_entity = assert_response_success(get_response, 200)
            
            # Валидация
            validate_entity_fields(retrieved_entity, entity_type)
            assert retrieved_entity["id"] == created_entity["id"]
