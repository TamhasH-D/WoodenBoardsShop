"""
Тесты POST /api/v1/products/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/product/test_post_product.py
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/products/"
SELLERS_URI = "/api/v1/sellers/"
WOOD_TYPES_URI = "/api/v1/wood-types/"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_product_success(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара: 201."""
    # Сначала создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)

    # Создаем тип древесины
    wood_type_data = generate_test_data("wood_type")
    wood_type_response = await api_client.post(WOOD_TYPES_URI, json=wood_type_data)
    created_wood_type = assert_response_success(wood_type_response, 201)

    # Подготовка данных товара
    input_json = generate_test_data("product")
    input_json["seller_id"] = created_seller["id"]  # Используем реальный ID продавца
    input_json["wood_type_id"] = created_wood_type["id"]  # Используем реальный ID типа древесины

    # Выполнение запроса
    response = await api_client.post(URI, json=input_json)

    # Проверка ответа
    response_data = assert_response_success(response, 201)

    # Валидация полей
    validate_entity_fields(response_data, "product")

    # Проверка соответствия входных и выходных данных
    assert response_data["neme"] == input_json["neme"]
    assert response_data["descrioption"] == input_json["descrioption"]
    assert response_data["price"] == input_json["price"]
    assert response_data["seller_id"] == input_json["seller_id"]
    assert response_data["volume"] == input_json["volume"]
    assert response_data["title"] == input_json["title"]
    assert response_data["pickup_location"] == input_json["pickup_location"]
    assert response_data["wood_type_id"] == input_json["wood_type_id"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_invalid_data(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с невалидными данными: 422."""
    # Создаем продавца для валидного seller_id
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Тест с невалидными типами данных
    invalid_data = {
        "id": "invalid-uuid",  # Невалидный UUID
        "neme": 123,  # Должно быть строкой
        "descrioption": None,  # Не должно быть null
        "price": "not_a_number",  # Должно быть числом
        "seller_id": created_seller["id"]  # Валидный seller_id
    }
    
    response = await api_client.post(URI, json=invalid_data)
    
    # Ожидаем ошибку валидации
    assert response.status_code in [400, 422], (
        f"Expected validation error (400 or 422), got {response.status_code}. "
        f"Response: {response.text}"
    )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_missing_fields(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с отсутствующими полями: 422."""
    # Тест с отсутствующими обязательными полями
    incomplete_data = {
        "id": "550e8400-e29b-41d4-a716-446655440000"
        # Отсутствуют neme, descrioption, price, seller_id
    }
    
    response = await api_client.post(URI, json=incomplete_data)
    
    # Ожидаем ошибку валидации
    assert response.status_code in [400, 422], (
        f"Expected validation error (400 or 422), got {response.status_code}. "
        f"Response: {response.text}"
    )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_nonexistent_seller(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с несуществующим seller_id: 400/422."""
    # Подготовка данных с несуществующим seller_id
    input_json = generate_test_data("product")
    input_json["seller_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий ID
    
    response = await api_client.post(URI, json=input_json)
    
    # Ожидаем ошибку валидации или внешнего ключа
    assert response.status_code in [400, 422], (
        f"Expected validation error (400 or 422), got {response.status_code}. "
        f"Response: {response.text}"
    )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_negative_price(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с отрицательной ценой."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Подготовка данных с отрицательной ценой
    input_json = generate_test_data("product")
    input_json["seller_id"] = created_seller["id"]
    input_json["price"] = -100.0  # Отрицательная цена
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять отрицательную цену (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "product")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_zero_price(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с нулевой ценой."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Подготовка данных с нулевой ценой
    input_json = generate_test_data("product")
    input_json["seller_id"] = created_seller["id"]
    input_json["price"] = 0.0  # Нулевая цена
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять нулевую цену (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "product")
        assert response_data["price"] == 0.0


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_large_price(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с очень большой ценой."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Подготовка данных с очень большой ценой
    input_json = generate_test_data("product")
    input_json["seller_id"] = created_seller["id"]
    input_json["price"] = 999999999.99  # Очень большая цена
    
    response = await api_client.post(URI, json=input_json)
    
    # API должен принять большую цену
    response_data = assert_response_success(response, 201)
    validate_entity_fields(response_data, "product")
    assert response_data["price"] == input_json["price"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_empty_strings(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с пустыми строками."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Подготовка данных с пустыми строками
    input_json = generate_test_data("product")
    input_json["seller_id"] = created_seller["id"]
    input_json["neme"] = ""  # Пустое название
    input_json["descrioption"] = ""  # Пустое описание
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять пустые строки (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "product")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_product_long_strings(api_client: httpx.AsyncClient) -> None:
    """Тест создания товара с очень длинными строками."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Подготовка данных с очень длинными строками
    input_json = generate_test_data("product")
    input_json["seller_id"] = created_seller["id"]
    input_json["neme"] = "А" * 1000  # Очень длинное название
    input_json["descrioption"] = "Б" * 5000  # Очень длинное описание
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять длинные строки (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "product")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.integration
@pytest.mark.fast
async def test_post_product_and_verify_creation(api_client: httpx.AsyncClient) -> None:
    """Интеграционный тест: создание и проверка через GET."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Создаем товар
    input_json = generate_test_data("product")
    input_json["seller_id"] = created_seller["id"]
    create_response = await api_client.post(URI, json=input_json)
    created_product = assert_response_success(create_response, 201)
    
    # Проверяем, что товар появился в списке
    list_response = await api_client.get(URI)
    products_list = assert_response_success(list_response, 200)
    
    # Ищем созданный товар в списке
    product_ids = [product["id"] for product in products_list]
    assert created_product["id"] in product_ids, (
        f"Created product {created_product['id']} not found in products list"
    )
    
    # Находим созданный товар и проверяем данные
    found_product = next(product for product in products_list if product["id"] == created_product["id"])
    assert found_product["neme"] == created_product["neme"]
    assert found_product["descrioption"] == created_product["descrioption"]
    assert found_product["price"] == created_product["price"]
    assert found_product["seller_id"] == created_product["seller_id"]
