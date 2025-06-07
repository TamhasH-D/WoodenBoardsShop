"""
Тесты POST /api/v1/images/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/image/test_post_image.py
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/images/"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_image_success() -> None:
    """Тест создания изображения: 201."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Сначала создаем продавца
        seller_data = generate_test_data("seller")
        seller_response = await client.post("/api/v1/sellers/", json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        # Создаем тип древесины
        wood_type_data = generate_test_data("wood_type")
        wood_type_response = await client.post("/api/v1/wood-types/", json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем товар
        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["wood_type_id"] = created_wood_type["id"]
        product_response = await client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(product_response, 201)
        
        # Подготовка данных изображения
        input_json = generate_test_data("image")
        input_json["product_id"] = created_product["id"]  # Используем реальный ID товара
        
        # Выполнение запроса
        response = await client.post(URI, json=input_json)
        
        # Проверка ответа
        response_data = assert_response_success(response, 201)
        
        # Валидация полей
        validate_entity_fields(response_data, "image")
        
        # Проверка соответствия входных и выходных данных
        assert response_data["image_path"] == input_json["image_path"]
        assert response_data["product_id"] == input_json["product_id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_image_invalid_data() -> None:
    """Тест создания изображения с невалидными данными: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем зависимости для валидного product_id
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
        
        # Тест с невалидными типами данных
        invalid_data = {
            "id": "invalid-uuid",  # Невалидный UUID
            "image_path": 123,  # Должно быть строкой
            "product_id": created_product["id"]  # Валидный product_id
        }
        
        response = await client.post(URI, json=invalid_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_image_missing_fields() -> None:
    """Тест создания изображения с отсутствующими полями: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с отсутствующими обязательными полями
        incomplete_data = {
            "id": "550e8400-e29b-41d4-a716-446655440000"
            # Отсутствуют image_path и product_id
        }
        
        response = await client.post(URI, json=incomplete_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_image_nonexistent_product() -> None:
    """Тест создания изображения с несуществующим product_id: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Подготовка данных с несуществующим product_id
        input_json = generate_test_data("image")
        input_json["product_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий ID
        
        response = await client.post(URI, json=input_json)
        
        # Ожидаем ошибку валидации или внешнего ключа
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_image_empty_path() -> None:
    """Тест создания изображения с пустым путем."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем зависимости
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
        
        # Подготовка данных с пустым путем
        input_json = generate_test_data("image")
        input_json["product_id"] = created_product["id"]
        input_json["image_path"] = ""  # Пустой путь
        
        response = await client.post(URI, json=input_json)
        
        # API может либо принять пустой путь (201), либо отклонить (400/422)
        assert response.status_code in [201, 400, 422], (
            f"Expected success (201) or validation error (400/422), got {response.status_code}. "
            f"Response: {response.text}"
        )
        
        if response.status_code == 201:
            response_data = assert_response_success(response, 201)
            validate_entity_fields(response_data, "image")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_image_various_paths() -> None:
    """Тест создания изображения с различными путями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем зависимости
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
        
        # Тестируем различные форматы путей
        test_paths = [
            "/images/test.jpg",
            "images/test.png",
            "./images/test.gif",
            "../images/test.bmp",
            "C:\\images\\test.jpeg",  # Windows путь
            "/var/www/images/test.webp",
            "https://example.com/image.jpg",  # URL
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",  # Base64
        ]
        
        for path in test_paths:
            input_json = generate_test_data("image")
            input_json["product_id"] = created_product["id"]
            input_json["image_path"] = path
            
            response = await client.post(URI, json=input_json)
            
            # API должен принимать различные форматы путей
            assert response.status_code in [201, 400, 422], (
                f"Expected success (201) or validation error (400/422) for path '{path}', "
                f"got {response.status_code}. Response: {response.text}"
            )
            
            if response.status_code == 201:
                response_data = assert_response_success(response, 201)
                validate_entity_fields(response_data, "image")
                assert response_data["image_path"] == path


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_images() -> None:
    """Тест получения списка изображений: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        response = await client.get(URI)
        
        response_data = assert_response_success(response, 200)
        
        # Проверяем, что возвращается список
        assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
        
        # Проверяем структуру каждого элемента
        for image in response_data:
            validate_entity_fields(image, "image")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_image_workflow() -> None:
    """Интеграционный тест: создание и проверка изображения."""
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
        input_json = generate_test_data("image")
        input_json["product_id"] = created_product["id"]
        create_response = await client.post(URI, json=input_json)
        created_image = assert_response_success(create_response, 201)
        
        # Проверяем, что изображение появилось в списке
        list_response = await client.get(URI)
        images_list = assert_response_success(list_response, 200)
        
        # Ищем созданное изображение в списке
        image_ids = [img["id"] for img in images_list]
        assert created_image["id"] in image_ids, (
            f"Created image {created_image['id']} not found in images list"
        )
        
        # Находим созданное изображение и проверяем данные
        found_image = next(img for img in images_list if img["id"] == created_image["id"])
        assert found_image["image_path"] == created_image["image_path"]
        assert found_image["product_id"] == created_image["product_id"]
