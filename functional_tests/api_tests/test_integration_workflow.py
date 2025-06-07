"""
Интеграционные тесты полного workflow API.
Проверяют взаимодействие между различными endpoints.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.slow
async def test_complete_marketplace_workflow(api_client: httpx.AsyncClient) -> None:
    """Тест полного workflow маркетплейса: создание всех сущностей."""
    
    # 1. Создаем покупателя
    buyer_data = generate_test_data("buyer")
    buyer_response = await api_client.post("/api/v1/buyers/", json=buyer_data)
    created_buyer = assert_response_success(buyer_response, 201)
    validate_entity_fields(created_buyer, "buyer")
    
    # 2. Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post("/api/v1/sellers/", json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    validate_entity_fields(created_seller, "seller")
    
    # 3. Создаем тип древесины
    wood_type_data = generate_test_data("wood_type")
    wood_type_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
    created_wood_type = assert_response_success(wood_type_response, 201)
    validate_entity_fields(created_wood_type, "wood_type")
    
    # 4. Создаем товар
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_response = await api_client.post("/api/v1/products/", json=product_data)
    created_product = assert_response_success(product_response, 201)
    validate_entity_fields(created_product, "product")
    
    # 5. Создаем изображение
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post("/api/v1/images/", json=image_data)
    created_image = assert_response_success(image_response, 201)
    validate_entity_fields(created_image, "image")
    
    # 6. Создаем деревянную доску
    wooden_board_data = generate_test_data("wooden_board")
    wooden_board_data["image_id"] = created_image["id"]
    wooden_board_response = await api_client.post("/api/v1/wooden-boards/", json=wooden_board_data)
    created_wooden_board = assert_response_success(wooden_board_response, 201)
    validate_entity_fields(created_wooden_board, "wooden_board")
    
    # 7. Проверяем, что все сущности доступны через GET
    
    # Проверяем покупателя
    buyers_response = await api_client.get("/api/v1/buyers/")
    buyers_list = assert_response_success(buyers_response, 200)
    buyer_ids = [buyer["id"] for buyer in buyers_list]
    assert created_buyer["id"] in buyer_ids
    
    # Проверяем продавца
    sellers_response = await api_client.get("/api/v1/sellers/")
    sellers_list = assert_response_success(sellers_response, 200)
    seller_ids = [seller["id"] for seller in sellers_list]
    assert created_seller["id"] in seller_ids
    
    # Проверяем тип древесины
    wood_types_response = await api_client.get("/api/v1/wood-types/")
    wood_types_list = assert_response_success(wood_types_response, 200)
    wood_type_ids = [wood_type["id"] for wood_type in wood_types_list]
    assert created_wood_type["id"] in wood_type_ids
    
    # Проверяем товар
    products_response = await api_client.get("/api/v1/products/")
    products_list = assert_response_success(products_response, 200)
    product_ids = [product["id"] for product in products_list]
    assert created_product["id"] in product_ids
    
    # Проверяем изображение
    images_response = await api_client.get("/api/v1/images/")
    images_list = assert_response_success(images_response, 200)
    image_ids = [image["id"] for image in images_list]
    assert created_image["id"] in image_ids
    
    # Проверяем деревянную доску
    wooden_boards_response = await api_client.get("/api/v1/wooden-boards/")
    wooden_boards_list = assert_response_success(wooden_boards_response, 200)
    wooden_board_ids = [board["id"] for board in wooden_boards_list]
    assert created_wooden_board["id"] in wooden_board_ids
    
    # 8. Проверяем связи между сущностями
    
    # Товар должен быть связан с продавцом
    found_product = next(p for p in products_list if p["id"] == created_product["id"])
    assert found_product["seller_id"] == created_seller["id"]
    
    # Изображение должно быть связано с товаром
    found_image = next(i for i in images_list if i["id"] == created_image["id"])
    assert found_image["product_id"] == created_product["id"]
    
    # Деревянная доска должна быть связана с изображением
    found_wooden_board = next(b for b in wooden_boards_list if b["id"] == created_wooden_board["id"])
    assert found_wooden_board["image_id"] == created_image["id"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_buyer_seller_interaction(api_client: httpx.AsyncClient) -> None:
    """Тест взаимодействия между покупателем и продавцом."""
    
    # Создаем покупателя
    buyer_data = generate_test_data("buyer")
    buyer_response = await api_client.post("/api/v1/buyers/", json=buyer_data)
    created_buyer = assert_response_success(buyer_response, 201)
    
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post("/api/v1/sellers/", json=seller_data)
    created_seller = assert_response_success(seller_response, 201)

    # Создаем тип древесины
    wood_type_data = generate_test_data("wood_type")
    wood_type_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
    created_wood_type = assert_response_success(wood_type_response, 201)

    # Создаем товар от продавца
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_data["wood_type_id"] = created_wood_type["id"]
    product_response = await api_client.post("/api/v1/products/", json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    # Проверяем, что покупатель может видеть товары продавца
    products_response = await api_client.get("/api/v1/products/")
    products_list = assert_response_success(products_response, 200)
    
    # Находим товар созданного продавца
    seller_products = [p for p in products_list if p["seller_id"] == created_seller["id"]]
    assert len(seller_products) >= 1
    assert created_product["id"] in [p["id"] for p in seller_products]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_product_image_wooden_board_chain(api_client: httpx.AsyncClient) -> None:
    """Тест цепочки связей: товар -> изображение -> деревянная доска."""
    
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post("/api/v1/sellers/", json=seller_data)
    created_seller = assert_response_success(seller_response, 201)

    # Создаем тип древесины
    wood_type_data = generate_test_data("wood_type")
    wood_type_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
    created_wood_type = assert_response_success(wood_type_response, 201)

    # Создаем товар
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_data["wood_type_id"] = created_wood_type["id"]
    product_response = await api_client.post("/api/v1/products/", json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    # Создаем изображение для товара
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post("/api/v1/images/", json=image_data)
    created_image = assert_response_success(image_response, 201)
    
    # Создаем деревянную доску с изображением
    wooden_board_data = generate_test_data("wooden_board")
    wooden_board_data["image_id"] = created_image["id"]
    wooden_board_response = await api_client.post("/api/v1/wooden-boards/", json=wooden_board_data)
    created_wooden_board = assert_response_success(wooden_board_response, 201)
    
    # Проверяем полную цепочку связей
    
    # Получаем деревянную доску по ID
    wooden_board_get_response = await api_client.get(f"/api/v1/wooden-boards/{created_wooden_board['id']}")
    wooden_board_details = assert_response_success(wooden_board_get_response, 200)
    
    # Получаем изображение по ID из деревянной доски
    image_get_response = await api_client.get(f"/api/v1/images/{wooden_board_details['image_id']}")
    image_details = assert_response_success(image_get_response, 200)
    
    # Получаем товар по ID из изображения
    product_get_response = await api_client.get(f"/api/v1/products/{image_details['product_id']}")
    product_details = assert_response_success(product_get_response, 200)
    
    # Проверяем, что цепочка связей корректна
    assert wooden_board_details["image_id"] == created_image["id"]
    assert image_details["product_id"] == created_product["id"]
    assert product_details["seller_id"] == created_seller["id"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.performance
@pytest.mark.slow
async def test_bulk_operations_performance(api_client: httpx.AsyncClient) -> None:
    """Тест производительности массовых операций."""
    import time
    
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post("/api/v1/sellers/", json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Измеряем время создания множества товаров
    start_time = time.time()
    created_products = []
    
    for i in range(10):
        product_data = generate_test_data("product")
        product_data["seller_id"] = created_seller["id"]
        product_data["neme"] = f"Товар {i+1}"
        
        product_response = await api_client.post("/api/v1/products/", json=product_data)
        created_product = assert_response_success(product_response, 201)
        created_products.append(created_product)
    
    creation_time = time.time() - start_time
    
    # Измеряем время получения списка товаров
    start_time = time.time()
    products_response = await api_client.get("/api/v1/products/")
    products_list = assert_response_success(products_response, 200)
    retrieval_time = time.time() - start_time
    
    # Проверяем производительность
    assert creation_time < 30.0, f"Creating 10 products took too long: {creation_time:.2f} seconds"
    assert retrieval_time < 5.0, f"Retrieving products took too long: {retrieval_time:.2f} seconds"
    
    # Проверяем, что все товары созданы
    assert len(created_products) == 10
    product_ids = [p["id"] for p in products_list]
    for created_product in created_products:
        assert created_product["id"] in product_ids


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.error_handling
@pytest.mark.fast
async def test_cascade_dependency_validation(api_client: httpx.AsyncClient) -> None:
    """Тест валидации каскадных зависимостей."""
    
    # Пытаемся создать товар без продавца
    product_data = generate_test_data("product")
    product_data["seller_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий ID
    
    product_response = await api_client.post("/api/v1/products/", json=product_data)
    assert product_response.status_code in [400, 422], (
        f"Expected validation error for non-existent seller, got {product_response.status_code}"
    )
    
    # Пытаемся создать изображение без товара
    image_data = generate_test_data("image")
    image_data["product_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий ID
    
    image_response = await api_client.post("/api/v1/images/", json=image_data)
    assert image_response.status_code in [400, 422], (
        f"Expected validation error for non-existent product, got {image_response.status_code}"
    )
    
    # Пытаемся создать деревянную доску без изображения
    wooden_board_data = generate_test_data("wooden_board")
    wooden_board_data["image_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий ID
    
    wooden_board_response = await api_client.post("/api/v1/wooden-boards/", json=wooden_board_data)
    assert wooden_board_response.status_code in [400, 422], (
        f"Expected validation error for non-existent image, got {wooden_board_response.status_code}"
    )
