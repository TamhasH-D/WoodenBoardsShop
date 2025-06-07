"""
Тесты POST /api/v1/wooden-boards/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/wooden_board/test_post_wooden_board.py
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/wooden-boards/"
SELLERS_URI = "/api/v1/sellers/"
PRODUCTS_URI = "/api/v1/products/"
IMAGES_URI = "/api/v1/images/"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_wooden_board_success(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски: 201."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    # Создаем товар
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_response = await api_client.post(PRODUCTS_URI, json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    # Создаем изображение
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post(IMAGES_URI, json=image_data)
    created_image = assert_response_success(image_response, 201)
    
    # Подготовка данных деревянной доски
    input_json = generate_test_data("wooden_board")
    input_json["image_id"] = created_image["id"]  # Используем реальный ID изображения
    
    # Выполнение запроса
    response = await api_client.post(URI, json=input_json)
    
    # Проверка ответа
    response_data = assert_response_success(response, 201)
    
    # Валидация полей
    validate_entity_fields(response_data, "wooden_board")
    
    # Проверка соответствия входных и выходных данных
    assert response_data["height"] == input_json["height"]
    assert response_data["width"] == input_json["width"]
    assert response_data["lenght"] == input_json["lenght"]
    assert response_data["image_id"] == input_json["image_id"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wooden_board_invalid_data(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски с невалидными данными: 422."""
    # Создаем зависимости для валидного image_id
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_response = await api_client.post(PRODUCTS_URI, json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post(IMAGES_URI, json=image_data)
    created_image = assert_response_success(image_response, 201)
    
    # Тест с невалидными типами данных
    invalid_data = {
        "id": "invalid-uuid",  # Невалидный UUID
        "height": "not_a_number",  # Должно быть числом
        "width": None,  # Не должно быть null
        "lenght": -1.0,  # Может быть невалидным (отрицательное значение)
        "image_id": created_image["id"]  # Валидный image_id
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
async def test_post_wooden_board_missing_fields(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски с отсутствующими полями: 422."""
    # Тест с отсутствующими обязательными полями
    incomplete_data = {
        "id": "550e8400-e29b-41d4-a716-446655440000"
        # Отсутствуют height, width, lenght, image_id
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
async def test_post_wooden_board_nonexistent_image(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски с несуществующим image_id: 400/422."""
    # Подготовка данных с несуществующим image_id
    input_json = generate_test_data("wooden_board")
    input_json["image_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий ID
    
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
async def test_post_wooden_board_negative_dimensions(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски с отрицательными размерами."""
    # Создаем зависимости
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_response = await api_client.post(PRODUCTS_URI, json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post(IMAGES_URI, json=image_data)
    created_image = assert_response_success(image_response, 201)
    
    # Подготовка данных с отрицательными размерами
    input_json = generate_test_data("wooden_board")
    input_json["image_id"] = created_image["id"]
    input_json["height"] = -1.0  # Отрицательная высота
    input_json["width"] = -2.0   # Отрицательная ширина
    input_json["lenght"] = -3.0  # Отрицательная длина
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять отрицательные размеры (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "wooden_board")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wooden_board_zero_dimensions(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски с нулевыми размерами."""
    # Создаем зависимости
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_response = await api_client.post(PRODUCTS_URI, json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post(IMAGES_URI, json=image_data)
    created_image = assert_response_success(image_response, 201)
    
    # Подготовка данных с нулевыми размерами
    input_json = generate_test_data("wooden_board")
    input_json["image_id"] = created_image["id"]
    input_json["height"] = 0.0  # Нулевая высота
    input_json["width"] = 0.0   # Нулевая ширина
    input_json["lenght"] = 0.0  # Нулевая длина
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять нулевые размеры (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "wooden_board")
        assert response_data["height"] == 0.0
        assert response_data["width"] == 0.0
        assert response_data["lenght"] == 0.0


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wooden_board_large_dimensions(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски с очень большими размерами."""
    # Создаем зависимости
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_response = await api_client.post(PRODUCTS_URI, json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post(IMAGES_URI, json=image_data)
    created_image = assert_response_success(image_response, 201)
    
    # Подготовка данных с очень большими размерами
    input_json = generate_test_data("wooden_board")
    input_json["image_id"] = created_image["id"]
    input_json["height"] = 999999.99  # Очень большая высота
    input_json["width"] = 888888.88   # Очень большая ширина
    input_json["lenght"] = 777777.77  # Очень большая длина
    
    response = await api_client.post(URI, json=input_json)
    
    # API должен принять большие размеры
    response_data = assert_response_success(response, 201)
    validate_entity_fields(response_data, "wooden_board")
    assert response_data["height"] == input_json["height"]
    assert response_data["width"] == input_json["width"]
    assert response_data["lenght"] == input_json["lenght"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wooden_board_precision_dimensions(api_client: httpx.AsyncClient) -> None:
    """Тест создания деревянной доски с высокой точностью размеров."""
    # Создаем зависимости
    seller_data = generate_test_data("seller")
    seller_response = await api_client.post(SELLERS_URI, json=seller_data)
    created_seller = assert_response_success(seller_response, 201)
    
    product_data = generate_test_data("product")
    product_data["seller_id"] = created_seller["id"]
    product_response = await api_client.post(PRODUCTS_URI, json=product_data)
    created_product = assert_response_success(product_response, 201)
    
    image_data = generate_test_data("image")
    image_data["product_id"] = created_product["id"]
    image_response = await api_client.post(IMAGES_URI, json=image_data)
    created_image = assert_response_success(image_response, 201)
    
    # Подготовка данных с высокой точностью
    input_json = generate_test_data("wooden_board")
    input_json["image_id"] = created_image["id"]
    input_json["height"] = 1.23456789  # Высокая точность
    input_json["width"] = 2.98765432   # Высокая точность
    input_json["lenght"] = 3.14159265  # Высокая точность
    
    response = await api_client.post(URI, json=input_json)
    
    # API должен принять точные размеры
    response_data = assert_response_success(response, 201)
    validate_entity_fields(response_data, "wooden_board")
    
    # Проверяем точность (может быть округление)
    assert abs(response_data["height"] - input_json["height"]) < 0.01
    assert abs(response_data["width"] - input_json["width"]) < 0.01
    assert abs(response_data["lenght"] - input_json["lenght"]) < 0.01
