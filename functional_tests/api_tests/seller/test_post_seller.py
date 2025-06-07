"""
Тесты POST /api/v1/sellers/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/seller/test_post_seller.py
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/sellers/"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_seller_success(api_client: httpx.AsyncClient) -> None:
    """Тест создания продавца: 201."""
    # Подготовка данных
    input_json = generate_test_data("seller")
    
    # Выполнение запроса
    response = await api_client.post(URI, json=input_json)
    
    # Проверка ответа
    response_data = assert_response_success(response, 201)
    
    # Валидация полей
    validate_entity_fields(response_data, "seller")
    
    # Проверка соответствия входных и выходных данных
    assert response_data["keycloak_uuid"] == input_json["keycloak_uuid"]
    assert response_data["is_online"] == input_json["is_online"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_seller_invalid_data(api_client: httpx.AsyncClient) -> None:
    """Тест создания продавца с невалидными данными: 422."""
    # Тест с невалидными типами данных
    invalid_data = {
        "id": "invalid-uuid",  # Невалидный UUID
        "keycloak_uuid": 123,  # Должно быть строкой
        "is_online": "not_boolean",  # Невалидный тип
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
async def test_post_seller_missing_fields(api_client: httpx.AsyncClient) -> None:
    """Тест создания продавца с отсутствующими полями: 422."""
    # Тест с отсутствующими обязательными полями
    incomplete_data = {
        "id": "550e8400-e29b-41d4-a716-446655440000"
        # Отсутствуют keycloak_uuid и is_online
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
async def test_post_seller_duplicate_id(api_client: httpx.AsyncClient) -> None:
    """Тест создания продавца с дублирующимся ID: 409."""
    # Создаем первого продавца
    input_json = generate_test_data("seller")
    
    response1 = await api_client.post(URI, json=input_json)
    assert_response_success(response1, 201)
    
    # Пытаемся создать второго продавца с тем же ID
    response2 = await api_client.post(URI, json=input_json)
    
    # Ожидаем ошибку конфликта
    assert response2.status_code in [409, 400], (
        f"Expected conflict error (409 or 400), got {response2.status_code}. "
        f"Response: {response2.text}"
    )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_seller_boolean_variations(api_client: httpx.AsyncClient) -> None:
    """Тест различных вариантов boolean значений."""
    # Тестируем различные представления boolean
    boolean_variations = [
        (True, True),
        (False, False),
        ("true", True),  # Может быть принято как True
        ("false", False),  # Может быть принято как False
        (1, True),  # Может быть принято как True
        (0, False),  # Может быть принято как False
    ]
    
    for input_value, expected_value in boolean_variations:
        input_json = generate_test_data("seller")
        input_json["is_online"] = input_value
        
        response = await api_client.post(URI, json=input_json)
        
        # API может либо принять значение (201), либо отклонить (400/422)
        if response.status_code == 201:
            response_data = assert_response_success(response, 201)
            validate_entity_fields(response_data, "seller")
            # Проверяем, что boolean значение корректно обработано
            assert isinstance(response_data["is_online"], bool)
        else:
            assert response.status_code in [400, 422], (
                f"Expected success (201) or validation error (400/422) for value {input_value}, "
                f"got {response.status_code}. Response: {response.text}"
            )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_seller_uuid_formats(api_client: httpx.AsyncClient) -> None:
    """Тест различных форматов UUID."""
    # Тестируем различные форматы UUID
    uuid_formats = [
        "550e8400-e29b-41d4-a716-446655440000",  # Стандартный формат
        "550E8400-E29B-41D4-A716-446655440000",  # Верхний регистр
        "550e8400e29b41d4a716446655440000",      # Без дефисов (может не поддерживаться)
        "{550e8400-e29b-41d4-a716-446655440000}",  # С фигурными скобками (может не поддерживаться)
    ]
    
    for uuid_format in uuid_formats:
        input_json = generate_test_data("seller")
        input_json["id"] = uuid_format
        input_json["keycloak_uuid"] = uuid_format.replace("550e8400", "660e8400")  # Другой UUID
        
        response = await api_client.post(URI, json=input_json)
        
        # Стандартные форматы должны работать, нестандартные могут отклоняться
        if uuid_format in ["550e8400-e29b-41d4-a716-446655440000", "550E8400-E29B-41D4-A716-446655440000"]:
            response_data = assert_response_success(response, 201)
            validate_entity_fields(response_data, "seller")
        else:
            # Нестандартные форматы могут быть отклонены
            assert response.status_code in [201, 400, 422], (
                f"Expected success (201) or validation error (400/422) for UUID format {uuid_format}, "
                f"got {response.status_code}. Response: {response.text}"
            )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.integration
@pytest.mark.fast
async def test_post_seller_and_verify_creation(api_client: httpx.AsyncClient) -> None:
    """Интеграционный тест: создание и проверка через GET."""
    # Создаем продавца
    input_json = generate_test_data("seller")
    create_response = await api_client.post(URI, json=input_json)
    created_seller = assert_response_success(create_response, 201)
    
    # Проверяем, что продавец появился в списке
    list_response = await api_client.get(URI)
    sellers_list = assert_response_success(list_response, 200)
    
    # Ищем созданного продавца в списке
    seller_ids = [seller["id"] for seller in sellers_list]
    assert created_seller["id"] in seller_ids, (
        f"Created seller {created_seller['id']} not found in sellers list"
    )
    
    # Находим созданного продавца и проверяем данные
    found_seller = next(seller for seller in sellers_list if seller["id"] == created_seller["id"])
    assert found_seller["keycloak_uuid"] == created_seller["keycloak_uuid"]
    assert found_seller["is_online"] == created_seller["is_online"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.performance
@pytest.mark.slow
async def test_post_multiple_sellers_performance(api_client: httpx.AsyncClient) -> None:
    """Тест производительности создания нескольких продавцов."""
    import time
    
    # Создаем несколько продавцов и измеряем время
    start_time = time.time()
    created_sellers = []
    
    for i in range(5):
        input_json = generate_test_data("seller")
        response = await api_client.post(URI, json=input_json)
        seller_data = assert_response_success(response, 201)
        created_sellers.append(seller_data)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Проверяем, что все продавцы созданы
    assert len(created_sellers) == 5
    
    # Проверяем производительность (не более 10 секунд на 5 запросов)
    assert total_time < 10.0, f"Creating 5 sellers took too long: {total_time:.2f} seconds"
    
    # Проверяем, что все ID уникальны
    seller_ids = [seller["id"] for seller in created_sellers]
    assert len(set(seller_ids)) == 5, "Not all seller IDs are unique"
