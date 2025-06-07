"""
Простые тесты DELETE операций.
Проверяют только успешность DELETE запросов без проверки последствий.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
)


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.crud
@pytest.mark.fast
async def test_delete_buyer_returns_success() -> None:
    """Тест DELETE покупателя возвращает успешный статус."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Удаляем покупателя
        delete_response = await client.delete(f"/api/v1/buyers/{created_buyer['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200 or 204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.crud
@pytest.mark.fast
async def test_delete_seller_returns_success() -> None:
    """Тест DELETE продавца возвращает успешный статус."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем продавца
        seller_data = generate_test_data("seller")
        create_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(create_response, 201)
        
        # Удаляем продавца
        delete_response = await client.delete(f"/api/v1/sellers/{created_seller['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200 or 204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.crud
@pytest.mark.fast
async def test_delete_wood_type_returns_success() -> None:
    """Тест DELETE типа древесины возвращает успешный статус."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        create_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(create_response, 201)
        
        # Удаляем тип древесины
        delete_response = await client.delete(f"/api/v1/wood-types/{created_wood_type['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200 or 204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.validation
@pytest.mark.fast
async def test_delete_nonexistent_entity_returns_404() -> None:
    """Тест DELETE несуществующей сущности возвращает 404."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся удалить несуществующего покупателя
        nonexistent_id = "550e8400-e29b-41d4-a716-446655440000"
        delete_response = await client.delete(f"/api/v1/buyers/{nonexistent_id}")
        
        # DELETE может быть идемпотентным (200) или возвращать 404
        assert delete_response.status_code in [200, 404], (
            f"Expected 200 or 404 for non-existent entity, got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.validation
@pytest.mark.fast
async def test_delete_invalid_uuid_returns_error() -> None:
    """Тест DELETE с невалидным UUID возвращает ошибку."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся удалить с невалидным UUID
        invalid_id = "invalid-uuid"
        delete_response = await client.delete(f"/api/v1/buyers/{invalid_id}")
        
        # Ожидаем ошибку валидации
        assert delete_response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_product_returns_success() -> None:
    """Тест DELETE товара возвращает успешный статус."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем необходимые зависимости
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
        product_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(product_response, 201)
        
        # Удаляем товар
        delete_response = await client.delete(f"/api/v1/products/{created_product['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200 or 204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_image_returns_success() -> None:
    """Тест DELETE изображения возвращает успешный статус."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем необходимые зависимости
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
        image_response = await client.post("/api/v1/images/", json=image_data)
        created_image = assert_response_success(image_response, 201)
        
        # Удаляем изображение
        delete_response = await client.delete(f"/api/v1/images/{created_image['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200 or 204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_wood_type_price_returns_success() -> None:
    """Тест DELETE цены на древесину возвращает успешный статус."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем цену
        price_data = generate_test_data("wood_type_price")
        price_data["wood_type_id"] = created_wood_type["id"]
        price_response = await client.post("/api/v1/wood-type-prices/", json=price_data)
        created_price = assert_response_success(price_response, 201)
        
        # Удаляем цену
        delete_response = await client.delete(f"/api/v1/wood-type-prices/{created_price['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200 or 204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_chat_thread_returns_success() -> None:
    """Тест DELETE чат-треда возвращает успешный статус."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем участников чата
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)
        
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        # Создаем чат-тред
        chat_data = generate_test_data("chat_thread")
        chat_data["buyer_id"] = created_buyer["id"]
        chat_data["seller_id"] = created_seller["id"]
        chat_response = await client.post("/api/v1/chat-threads/", json=chat_data)
        created_chat = assert_response_success(chat_response, 201)
        
        # Удаляем чат-тред
        delete_response = await client.delete(f"/api/v1/chat-threads/{created_chat['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200 or 204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.performance
@pytest.mark.fast
async def test_delete_multiple_entities_performance() -> None:
    """Тест производительности DELETE операций."""
    import time
    
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=60.0) as client:
        # Создаем несколько покупателей
        created_buyers = []
        for i in range(3):
            buyer_data = generate_test_data("buyer")
            create_response = await client.post("/api/v1/buyers/", json=buyer_data)
            created_buyer = assert_response_success(create_response, 201)
            created_buyers.append(created_buyer)
        
        # Измеряем время удаления
        start_time = time.time()
        
        for buyer in created_buyers:
            delete_response = await client.delete(f"/api/v1/buyers/{buyer['id']}")
            assert delete_response.status_code in [200, 204], (
                f"Failed to delete buyer {buyer['id']}: {delete_response.status_code}"
            )
        
        end_time = time.time()
        deletion_time = end_time - start_time
        
        # Проверяем производительность (не более 10 секунд на 3 удаления)
        assert deletion_time < 10.0, f"Deleting 3 buyers took too long: {deletion_time:.2f} seconds"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.smoke
@pytest.mark.fast
async def test_delete_endpoints_availability() -> None:
    """Smoke test: проверка доступности всех DELETE endpoints."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тестируем DELETE endpoints с несуществующими ID
        delete_endpoints = [
            "/api/v1/buyers/550e8400-e29b-41d4-a716-446655440000",
            "/api/v1/sellers/550e8400-e29b-41d4-a716-446655440001",
            "/api/v1/wood-types/550e8400-e29b-41d4-a716-446655440002",
            "/api/v1/products/550e8400-e29b-41d4-a716-446655440003",
            "/api/v1/images/550e8400-e29b-41d4-a716-446655440004",
            "/api/v1/wood-type-prices/550e8400-e29b-41d4-a716-446655440005",
            "/api/v1/chat-threads/550e8400-e29b-41d4-a716-446655440006",
            "/api/v1/wooden-boards/550e8400-e29b-41d4-a716-446655440007",
        ]
        
        for endpoint in delete_endpoints:
            delete_response = await client.delete(endpoint)
            # DELETE операции могут быть идемпотентными (200) или возвращать 404
            assert delete_response.status_code in [200, 404], (
                f"DELETE {endpoint} should return 200 or 404, got {delete_response.status_code}"
            )
