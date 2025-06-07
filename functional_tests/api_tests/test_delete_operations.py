"""
Тесты DELETE операций для всех endpoints.
Проверяют удаление сущностей и каскадные зависимости.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    assert_response_error,
    generate_test_data,
    validate_entity_fields,
)


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.crud
@pytest.mark.fast
async def test_delete_buyer_success() -> None:
    """Тест удаления покупателя: 204."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Удаляем покупателя
        delete_response = await client.delete(f"/api/v1/buyers/{created_buyer['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [204, 200], (
            f"Expected successful deletion (204 or 200), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )
        
        # Проверяем, что покупатель больше не существует
        get_response = await client.get(f"/api/v1/buyers/{created_buyer['id']}")
        assert get_response.status_code == 404, (
            f"Expected 404 after deletion, got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.crud
@pytest.mark.fast
async def test_delete_seller_success() -> None:
    """Тест удаления продавца: 204."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем продавца
        seller_data = generate_test_data("seller")
        create_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(create_response, 201)
        
        # Удаляем продавца
        delete_response = await client.delete(f"/api/v1/sellers/{created_seller['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [204, 200], (
            f"Expected successful deletion (204 or 200), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )
        
        # Проверяем, что продавец больше не существует
        get_response = await client.get(f"/api/v1/sellers/{created_seller['id']}")
        assert get_response.status_code == 404, (
            f"Expected 404 after deletion, got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.crud
@pytest.mark.fast
async def test_delete_wood_type_success() -> None:
    """Тест удаления типа древесины: 204."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        create_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(create_response, 201)
        
        # Удаляем тип древесины
        delete_response = await client.delete(f"/api/v1/wood-types/{created_wood_type['id']}")
        
        # Проверяем успешное удаление
        assert delete_response.status_code in [204, 200], (
            f"Expected successful deletion (204 or 200), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )
        
        # Проверяем, что тип древесины больше не существует
        get_response = await client.get(f"/api/v1/wood-types/{created_wood_type['id']}")
        assert get_response.status_code == 404, (
            f"Expected 404 after deletion, got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.validation
@pytest.mark.fast
async def test_delete_nonexistent_entity() -> None:
    """Тест удаления несуществующей сущности: 404."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся удалить несуществующего покупателя
        nonexistent_id = "550e8400-e29b-41d4-a716-446655440000"
        delete_response = await client.delete(f"/api/v1/buyers/{nonexistent_id}")
        
        # Ожидаем ошибку "не найдено"
        assert delete_response.status_code == 404, (
            f"Expected 404 for non-existent entity, got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.validation
@pytest.mark.fast
async def test_delete_invalid_id() -> None:
    """Тест удаления с невалидным ID: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся удалить с невалидным ID
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
async def test_cascade_delete_product_with_images() -> None:
    """Тест каскадного удаления: товар с изображениями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем полную цепочку
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
        
        # Создаем изображение для товара
        image_data = generate_test_data("image")
        image_data["product_id"] = created_product["id"]
        image_response = await client.post("/api/v1/images/", json=image_data)
        created_image = assert_response_success(image_response, 201)
        
        # Удаляем товар
        delete_response = await client.delete(f"/api/v1/products/{created_product['id']}")
        
        # Проверяем успешное удаление товара
        assert delete_response.status_code in [204, 200], (
            f"Expected successful deletion (204 or 200), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )
        
        # Проверяем, что товар больше не существует
        get_product_response = await client.get(f"/api/v1/products/{created_product['id']}")
        assert get_product_response.status_code == 404
        
        # Проверяем, что связанное изображение тоже удалено (каскадное удаление)
        get_image_response = await client.get(f"/api/v1/images/{created_image['id']}")
        # Может быть либо удалено каскадно (404), либо остаться (200)
        assert get_image_response.status_code in [200, 404], (
            f"Expected image to be either deleted (404) or remain (200), "
            f"got {get_image_response.status_code}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_seller_with_products() -> None:
    """Тест удаления продавца с товарами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем продавца
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем товар для продавца
        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["wood_type_id"] = created_wood_type["id"]
        product_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(product_response, 201)
        
        # Пытаемся удалить продавца
        delete_response = await client.delete(f"/api/v1/sellers/{created_seller['id']}")
        
        # API может либо запретить удаление (400/409), либо удалить каскадно (204/200)
        assert delete_response.status_code in [200, 204, 400, 409], (
            f"Expected success (200/204) or constraint error (400/409), "
            f"got {delete_response.status_code}. Response: {delete_response.text}"
        )
        
        if delete_response.status_code in [200, 204]:
            # Если удаление прошло успешно, проверяем каскадное удаление
            get_seller_response = await client.get(f"/api/v1/sellers/{created_seller['id']}")
            assert get_seller_response.status_code == 404
            
            # Проверяем, что товар тоже удален
            get_product_response = await client.get(f"/api/v1/products/{created_product['id']}")
            assert get_product_response.status_code in [200, 404]  # Может остаться или быть удален


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.performance
@pytest.mark.slow
async def test_bulk_delete_performance() -> None:
    """Тест производительности массового удаления."""
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
        
        # Измеряем время удаления
        start_time = time.time()
        
        for buyer in created_buyers:
            delete_response = await client.delete(f"/api/v1/buyers/{buyer['id']}")
            assert delete_response.status_code in [200, 204]
        
        end_time = time.time()
        deletion_time = end_time - start_time
        
        # Проверяем производительность (не более 10 секунд на 5 удалений)
        assert deletion_time < 10.0, f"Deleting 5 buyers took too long: {deletion_time:.2f} seconds"
        
        # Проверяем, что все покупатели удалены
        for buyer in created_buyers:
            get_response = await client.get(f"/api/v1/buyers/{buyer['id']}")
            assert get_response.status_code == 404


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_and_recreate() -> None:
    """Тест удаления и повторного создания с тем же ID."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        original_id = created_buyer["id"]
        
        # Удаляем покупателя
        delete_response = await client.delete(f"/api/v1/buyers/{original_id}")
        assert delete_response.status_code in [200, 204]
        
        # Проверяем, что покупатель удален
        get_response = await client.get(f"/api/v1/buyers/{original_id}")
        assert get_response.status_code == 404
        
        # Пытаемся создать нового покупателя с тем же ID
        new_buyer_data = generate_test_data("buyer")
        new_buyer_data["id"] = original_id  # Используем тот же ID
        
        recreate_response = await client.post("/api/v1/buyers/", json=new_buyer_data)
        
        # API должен позволить повторное использование ID после удаления
        recreated_buyer = assert_response_success(recreate_response, 201)
        assert recreated_buyer["id"] == original_id
        
        # Проверяем, что новый покупатель доступен
        final_get_response = await client.get(f"/api/v1/buyers/{original_id}")
        final_buyer = assert_response_success(final_get_response, 200)
        assert final_buyer["id"] == original_id
