"""
Тесты PATCH операций для всех endpoints.
Проверяют обновление сущностей и валидацию изменений.
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
@pytest.mark.patch
@pytest.mark.crud
@pytest.mark.fast
async def test_patch_buyer_success() -> None:
    """Тест обновления покупателя: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Обновляем покупателя
        update_data = {
            "is_online": not created_buyer["is_online"]  # Меняем статус
        }
        
        patch_response = await client.patch(f"/api/v1/buyers/{created_buyer['id']}", json=update_data)
        patch_result = assert_response_success(patch_response, 200)

        # PATCH может вернуть None, получаем обновленные данные через GET
        get_response = await client.get(f"/api/v1/buyers/{created_buyer['id']}")
        updated_buyer = assert_response_success(get_response, 200)

        # Валидация полей
        validate_entity_fields(updated_buyer, "buyer")

        # Проверка изменений
        assert updated_buyer["id"] == created_buyer["id"]
        assert updated_buyer["is_online"] == update_data["is_online"]
        assert updated_buyer["keycloak_uuid"] == created_buyer["keycloak_uuid"]  # Не изменилось


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.crud
@pytest.mark.fast
async def test_patch_seller_success() -> None:
    """Тест обновления продавца: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем продавца
        seller_data = generate_test_data("seller")
        create_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(create_response, 201)
        
        # Обновляем продавца
        update_data = {
            "is_online": not created_seller["is_online"]  # Меняем статус
        }
        
        patch_response = await client.patch(f"/api/v1/sellers/{created_seller['id']}", json=update_data)
        patch_result = assert_response_success(patch_response, 200)

        # PATCH может вернуть None, получаем обновленные данные через GET
        get_response = await client.get(f"/api/v1/sellers/{created_seller['id']}")
        updated_seller = assert_response_success(get_response, 200)

        # Валидация полей
        validate_entity_fields(updated_seller, "seller")

        # Проверка изменений
        assert updated_seller["id"] == created_seller["id"]
        assert updated_seller["is_online"] == update_data["is_online"]
        assert updated_seller["keycloak_uuid"] == created_seller["keycloak_uuid"]  # Не изменилось


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.crud
@pytest.mark.fast
async def test_patch_wood_type_success() -> None:
    """Тест обновления типа древесины: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        create_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(create_response, 201)
        
        # Обновляем тип древесины
        import time
        timestamp = str(int(time.time() * 1000))
        update_data = {
            "description": f"Обновленное описание {timestamp}"
        }
        
        patch_response = await client.patch(f"/api/v1/wood-types/{created_wood_type['id']}", json=update_data)
        updated_wood_type = assert_response_success(patch_response, 200)
        
        # Валидация полей
        validate_entity_fields(updated_wood_type, "wood_type")
        
        # Проверка изменений
        assert updated_wood_type["id"] == created_wood_type["id"]
        assert updated_wood_type["description"] == update_data["description"]
        assert updated_wood_type["neme"] == created_wood_type["neme"]  # Не изменилось


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.validation
@pytest.mark.fast
async def test_patch_nonexistent_entity() -> None:
    """Тест обновления несуществующей сущности: 404."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся обновить несуществующего покупателя
        nonexistent_id = "550e8400-e29b-41d4-a716-446655440000"
        update_data = {"is_online": True}
        
        patch_response = await client.patch(f"/api/v1/buyers/{nonexistent_id}", json=update_data)
        
        # Ожидаем ошибку "не найдено"
        assert patch_response.status_code == 404, (
            f"Expected 404 for non-existent entity, got {patch_response.status_code}. "
            f"Response: {patch_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.validation
@pytest.mark.fast
async def test_patch_invalid_id() -> None:
    """Тест обновления с невалидным ID: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Пытаемся обновить с невалидным ID
        invalid_id = "invalid-uuid"
        update_data = {"is_online": True}
        
        patch_response = await client.patch(f"/api/v1/buyers/{invalid_id}", json=update_data)
        
        # Ожидаем ошибку валидации
        assert patch_response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {patch_response.status_code}. "
            f"Response: {patch_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.validation
@pytest.mark.fast
async def test_patch_invalid_data() -> None:
    """Тест обновления с невалидными данными: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Пытаемся обновить с невалидными данными
        invalid_update_data = {
            "is_online": "not-a-boolean",  # Должно быть boolean
            "keycloak_uuid": "invalid-uuid"  # Невалидный UUID
        }
        
        patch_response = await client.patch(f"/api/v1/buyers/{created_buyer['id']}", json=invalid_update_data)
        
        # Ожидаем ошибку валидации
        assert patch_response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {patch_response.status_code}. "
            f"Response: {patch_response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.validation
@pytest.mark.fast
async def test_patch_readonly_fields() -> None:
    """Тест обновления readonly полей."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Пытаемся обновить readonly поля
        readonly_update_data = {
            "id": "550e8400-e29b-41d4-a716-446655440000",  # ID не должен изменяться
            "created_at": "2023-01-01T00:00:00Z",  # created_at не должен изменяться
            "updated_at": "2023-01-01T00:00:00Z"   # updated_at управляется системой
        }
        
        patch_response = await client.patch(f"/api/v1/buyers/{created_buyer['id']}", json=readonly_update_data)
        
        # API может либо игнорировать readonly поля (200), либо отклонить (400/422)
        assert patch_response.status_code in [200, 400, 422], (
            f"Expected success (200) or validation error (400/422), got {patch_response.status_code}. "
            f"Response: {patch_response.text}"
        )
        
        if patch_response.status_code == 200:
            updated_buyer = assert_response_success(patch_response, 200)
            # ID не должен измениться
            assert updated_buyer["id"] == created_buyer["id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.integration
@pytest.mark.fast
async def test_patch_product_with_dependencies() -> None:
    """Тест обновления товара с зависимостями."""
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
        
        # Обновляем товар
        update_data = {
            "price": created_product["price"] + 500.0,  # Увеличиваем цену
            "volume": created_product["volume"] + 0.5   # Увеличиваем объем
        }
        
        patch_response = await client.patch(f"/api/v1/products/{created_product['id']}", json=update_data)
        updated_product = assert_response_success(patch_response, 200)
        
        # Валидация полей
        validate_entity_fields(updated_product, "product")
        
        # Проверка изменений
        assert updated_product["id"] == created_product["id"]
        assert updated_product["price"] == update_data["price"]
        assert updated_product["volume"] == update_data["volume"]
        assert updated_product["seller_id"] == created_product["seller_id"]  # Не изменилось


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.integration
@pytest.mark.fast
async def test_patch_and_verify_changes() -> None:
    """Интеграционный тест: обновление и проверка изменений через GET."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        create_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(create_response, 201)
        
        # Обновляем тип древесины
        import time
        timestamp = str(int(time.time() * 1000))
        update_data = {
            "description": f"Проверочное описание {timestamp}"
        }
        
        patch_response = await client.patch(f"/api/v1/wood-types/{created_wood_type['id']}", json=update_data)
        updated_wood_type = assert_response_success(patch_response, 200)
        
        # Проверяем изменения через GET by ID
        get_response = await client.get(f"/api/v1/wood-types/{created_wood_type['id']}")
        retrieved_wood_type = assert_response_success(get_response, 200)
        
        # Проверяем, что изменения сохранились
        assert retrieved_wood_type["id"] == created_wood_type["id"]
        assert retrieved_wood_type["description"] == update_data["description"]
        assert retrieved_wood_type["neme"] == created_wood_type["neme"]
        
        # Проверяем, что изменения видны в списке
        list_response = await client.get("/api/v1/wood-types/")
        wood_types_list = assert_response_success(list_response, 200)
        
        found_wood_type = next(
            (wt for wt in wood_types_list if wt["id"] == created_wood_type["id"]), 
            None
        )
        assert found_wood_type is not None
        assert found_wood_type["description"] == update_data["description"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.performance
@pytest.mark.fast
async def test_patch_performance() -> None:
    """Тест производительности обновлений."""
    import time
    
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем несколько покупателей
        created_buyers = []
        for i in range(3):
            buyer_data = generate_test_data("buyer")
            create_response = await client.post("/api/v1/buyers/", json=buyer_data)
            created_buyer = assert_response_success(create_response, 201)
            created_buyers.append(created_buyer)
        
        # Измеряем время обновления
        start_time = time.time()
        
        for buyer in created_buyers:
            update_data = {"is_online": not buyer["is_online"]}
            patch_response = await client.patch(f"/api/v1/buyers/{buyer['id']}", json=update_data)
            updated_buyer = assert_response_success(patch_response, 200)
            assert updated_buyer["is_online"] == update_data["is_online"]
        
        end_time = time.time()
        update_time = end_time - start_time
        
        # Проверяем производительность (не более 5 секунд на 3 обновления)
        assert update_time < 5.0, f"Updating 3 buyers took too long: {update_time:.2f} seconds"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.patch
@pytest.mark.validation
@pytest.mark.fast
async def test_patch_empty_data() -> None:
    """Тест обновления с пустыми данными."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        
        # Пытаемся обновить пустыми данными
        empty_update_data = {}
        
        patch_response = await client.patch(f"/api/v1/buyers/{created_buyer['id']}", json=empty_update_data)
        
        # API должен либо принять пустое обновление (200), либо отклонить (400)
        assert patch_response.status_code in [200, 400], (
            f"Expected success (200) or error (400), got {patch_response.status_code}. "
            f"Response: {patch_response.text}"
        )
        
        if patch_response.status_code == 200:
            updated_buyer = assert_response_success(patch_response, 200)
            # Данные не должны измениться
            assert updated_buyer["id"] == created_buyer["id"]
            assert updated_buyer["keycloak_uuid"] == created_buyer["keycloak_uuid"]
            assert updated_buyer["is_online"] == created_buyer["is_online"]
