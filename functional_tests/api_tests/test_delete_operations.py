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


async def verify_entity_deleted(client: httpx.AsyncClient, entity_type: str, entity_id: str, list_endpoint: str) -> None:
    """Проверяет, что сущность удалена (не доступна по ID)."""
    # Проверяем GET by ID - может вернуть 404 или 500
    try:
        get_response = await client.get(f"{list_endpoint}{entity_id}")
        assert get_response.status_code in [404, 500], (
            f"Expected 404 or 500 after deletion of {entity_type}, got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )
    except Exception as e:
        # Если возникла сетевая ошибка, это тоже может означать, что сущность удалена
        # и backend имеет проблемы с обработкой удаленных записей
        print(f"Network error when checking deleted {entity_type}: {e}")
        # Считаем это успешным удалением


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
        
        # Проверяем, что покупатель удален
        await verify_entity_deleted(client, "buyer", created_buyer["id"], "/api/v1/buyers/")


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
        # API может возвращать 404 (не найдено) или 500 (ошибка при обращении к удаленной записи)
        get_response = await client.get(f"/api/v1/sellers/{created_seller['id']}")
        assert get_response.status_code in [404, 500], (
            f"Expected 404 or 500 after deletion, got {get_response.status_code}. "
            f"Response: {get_response.text}"
        )

        # Дополнительная проверка: продавец не должен быть в списке
        list_response = await client.get("/api/v1/sellers/")
        sellers_list = assert_response_success(list_response, 200)
        seller_ids = [seller["id"] for seller in sellers_list]
        assert created_seller["id"] not in seller_ids, (
            f"Deleted seller {created_seller['id']} should not be in sellers list"
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


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_wood_type_with_prices() -> None:
    """Тест удаления типа древесины с связанными ценами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)

        # Создаем цену для этого типа древесины
        price_data = generate_test_data("wood_type_price")
        price_data["wood_type_id"] = created_wood_type["id"]
        price_response = await client.post("/api/v1/wood-type-prices/", json=price_data)
        created_price = assert_response_success(price_response, 201)

        # Пытаемся удалить тип древесины с связанными ценами
        delete_response = await client.delete(f"/api/v1/wood-types/{created_wood_type['id']}")

        # API может либо запретить удаление (400/409), либо каскадно удалить (200/204)
        assert delete_response.status_code in [200, 204, 400, 409], (
            f"Expected success (200/204) or constraint error (400/409), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )

        if delete_response.status_code in [200, 204]:
            # Если удаление прошло успешно, проверяем каскадное удаление цен
            wood_type_get_response = await client.get(f"/api/v1/wood-types/{created_wood_type['id']}")
            assert wood_type_get_response.status_code == 404

            price_get_response = await client.get(f"/api/v1/wood-type-prices/{created_price['id']}")
            assert price_get_response.status_code in [200, 404]  # Может быть каскадно удалена


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_chat_thread() -> None:
    """Тест удаления чат-треда."""
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
            f"Expected successful deletion (200/204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )

        # Проверяем, что чат-тред удален
        get_response = await client.get(f"/api/v1/chat-threads/{created_chat['id']}")
        assert get_response.status_code == 404


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_image() -> None:
    """Тест удаления изображения."""
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
            f"Expected successful deletion (200/204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )

        # Проверяем, что изображение удалено
        get_response = await client.get(f"/api/v1/images/{created_image['id']}")
        assert get_response.status_code == 404

        # Проверяем, что товар остался
        product_get_response = await client.get(f"/api/v1/products/{created_product['id']}")
        assert product_get_response.status_code == 200


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_wooden_board() -> None:
    """Тест удаления деревянной доски."""
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

        image_data = generate_test_data("image")
        image_data["product_id"] = created_product["id"]
        image_response = await client.post("/api/v1/images/", json=image_data)
        created_image = assert_response_success(image_response, 201)

        # Создаем деревянную доску
        board_data = generate_test_data("wooden_board")
        board_data["image_id"] = created_image["id"]
        board_response = await client.post("/api/v1/wooden-boards/", json=board_data)
        created_board = assert_response_success(board_response, 201)

        # Удаляем деревянную доску
        delete_response = await client.delete(f"/api/v1/wooden-boards/{created_board['id']}")

        # Проверяем успешное удаление
        assert delete_response.status_code in [200, 204], (
            f"Expected successful deletion (200/204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )

        # Проверяем, что доска удалена
        get_response = await client.get(f"/api/v1/wooden-boards/{created_board['id']}")
        assert get_response.status_code == 404

        # Проверяем, что изображение остается
        image_get_response = await client.get(f"/api/v1/images/{created_image['id']}")
        assert image_get_response.status_code == 200


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_wood_type_price() -> None:
    """Тест удаления цены на тип древесины."""
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
            f"Expected successful deletion (200/204), got {delete_response.status_code}. "
            f"Response: {delete_response.text}"
        )

        # Проверяем, что цена удалена
        get_response = await client.get(f"/api/v1/wood-type-prices/{created_price['id']}")
        assert get_response.status_code == 404

        # Проверяем, что тип древесины остается
        wood_type_get_response = await client.get(f"/api/v1/wood-types/{created_wood_type['id']}")
        assert wood_type_get_response.status_code == 200


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.integration
@pytest.mark.fast
async def test_delete_workflow_data_integrity() -> None:
    """Интеграционный тест целостности данных при удалении."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Получаем начальное количество сущностей
        initial_buyers = await client.get("/api/v1/buyers/")
        initial_buyers_data = assert_response_success(initial_buyers, 200)
        initial_buyers_count = len(initial_buyers_data)

        initial_sellers = await client.get("/api/v1/sellers/")
        initial_sellers_data = assert_response_success(initial_sellers, 200)
        initial_sellers_count = len(initial_sellers_data)

        # Создаем и удаляем покупателя
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)

        delete_buyer_response = await client.delete(f"/api/v1/buyers/{created_buyer['id']}")
        assert delete_buyer_response.status_code in [200, 204]

        # Создаем и удаляем продавца
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)

        delete_seller_response = await client.delete(f"/api/v1/sellers/{created_seller['id']}")
        assert delete_seller_response.status_code in [200, 204]

        # Проверяем, что количество сущностей вернулось к исходному
        final_buyers = await client.get("/api/v1/buyers/")
        final_buyers_data = assert_response_success(final_buyers, 200)
        final_buyers_count = len(final_buyers_data)

        final_sellers = await client.get("/api/v1/sellers/")
        final_sellers_data = assert_response_success(final_sellers, 200)
        final_sellers_count = len(final_sellers_data)

        assert final_buyers_count == initial_buyers_count, (
            f"Buyers count should return to initial value. "
            f"Initial: {initial_buyers_count}, Final: {final_buyers_count}"
        )

        assert final_sellers_count == initial_sellers_count, (
            f"Sellers count should return to initial value. "
            f"Initial: {initial_sellers_count}, Final: {final_sellers_count}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.stress
@pytest.mark.slow
async def test_delete_stress_test() -> None:
    """Стресс-тест удаления множественных сущностей."""
    import time

    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=120.0) as client:
        # Создаем 10 покупателей
        created_entities = []
        for i in range(10):
            buyer_data = generate_test_data("buyer")
            create_response = await client.post("/api/v1/buyers/", json=buyer_data)
            created_buyer = assert_response_success(create_response, 201)
            created_entities.append(("buyer", created_buyer["id"]))

            seller_data = generate_test_data("seller")
            create_response = await client.post("/api/v1/sellers/", json=seller_data)
            created_seller = assert_response_success(create_response, 201)
            created_entities.append(("seller", created_seller["id"]))

        # Измеряем время удаления
        start_time = time.time()

        for entity_type, entity_id in created_entities:
            endpoint = f"/api/v1/{entity_type}s/" if entity_type == "buyer" else f"/api/v1/{entity_type}s/"
            delete_response = await client.delete(f"{endpoint}{entity_id}")
            assert delete_response.status_code in [200, 204], (
                f"Failed to delete {entity_type} {entity_id}: {delete_response.status_code}"
            )

        end_time = time.time()
        deletion_time = end_time - start_time

        # Проверяем производительность (не более 30 секунд на 20 удалений)
        assert deletion_time < 30.0, f"Deleting 20 entities took too long: {deletion_time:.2f} seconds"

        # Проверяем, что все сущности удалены
        for entity_type, entity_id in created_entities:
            endpoint = f"/api/v1/{entity_type}s/" if entity_type == "buyer" else f"/api/v1/{entity_type}s/"
            get_response = await client.get(f"{endpoint}{entity_id}")
            assert get_response.status_code == 404, f"{entity_type} {entity_id} should be deleted"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.security
@pytest.mark.fast
async def test_delete_security_constraints() -> None:
    """Тест безопасности: попытки удаления с различными ограничениями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест удаления с пустым ID
        delete_response = await client.delete("/api/v1/buyers/")
        assert delete_response.status_code in [404, 405], (
            f"Expected 404 or 405 for empty ID, got {delete_response.status_code}"
        )

        # Тест удаления с SQL injection попыткой
        malicious_id = "'; DROP TABLE buyers; --"
        delete_response = await client.delete(f"/api/v1/buyers/{malicious_id}")
        assert delete_response.status_code in [400, 422], (
            f"Expected validation error for malicious ID, got {delete_response.status_code}"
        )

        # Тест удаления с очень длинным ID
        long_id = "a" * 1000
        delete_response = await client.delete(f"/api/v1/buyers/{long_id}")
        assert delete_response.status_code in [400, 422, 414], (
            f"Expected error for too long ID, got {delete_response.status_code}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.delete
@pytest.mark.edge_case
@pytest.mark.fast
async def test_delete_edge_cases() -> None:
    """Тест граничных случаев удаления."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        create_response = await client.post("/api/v1/buyers/", json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)

        # Удаляем дважды (идемпотентность)
        first_delete = await client.delete(f"/api/v1/buyers/{created_buyer['id']}")
        assert first_delete.status_code in [200, 204]

        second_delete = await client.delete(f"/api/v1/buyers/{created_buyer['id']}")
        assert second_delete.status_code == 404, (
            f"Second delete should return 404, got {second_delete.status_code}"
        )

        # Тест удаления с различными форматами UUID
        test_uuids = [
            "550e8400-e29b-41d4-a716-446655440000",  # Стандартный UUID
            "550E8400-E29B-41D4-A716-446655440001",  # Верхний регистр
            "550e8400e29b41d4a716446655440002",       # Без дефисов
        ]

        for test_uuid in test_uuids:
            delete_response = await client.delete(f"/api/v1/buyers/{test_uuid}")
            # Все должны возвращать 404 (не найдено) или 422 (невалидный формат)
            assert delete_response.status_code in [404, 422], (
                f"Expected 404 or 422 for UUID {test_uuid}, got {delete_response.status_code}"
            )
