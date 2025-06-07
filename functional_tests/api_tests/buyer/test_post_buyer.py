"""
Тесты POST /api/v1/buyers/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/buyer/test_post_buyer.py
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/buyers/"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_buyer_success(api_client: httpx.AsyncClient) -> None:
    """Тест создания покупателя: 201."""
    # Подготовка данных
    input_json = generate_test_data("buyer")
    
    # Выполнение запроса
    response = await api_client.post(URI, json=input_json)
    
    # Проверка ответа
    response_data = assert_response_success(response, 201)
    
    # Валидация полей
    validate_entity_fields(response_data, "buyer")
    
    # Проверка соответствия входных и выходных данных
    assert response_data["keycloak_uuid"] == input_json["keycloak_uuid"]
    assert response_data["is_online"] == input_json["is_online"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_buyer_invalid_data(api_client: httpx.AsyncClient) -> None:
    """Тест создания покупателя с невалидными данными: 422."""
    # Тест с отсутствующими обязательными полями
    invalid_data = {
        "id": "invalid-uuid",  # Невалидный UUID
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
async def test_post_buyer_missing_fields(api_client: httpx.AsyncClient) -> None:
    """Тест создания покупателя с отсутствующими полями: 422."""
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
async def test_post_buyer_duplicate_id(api_client: httpx.AsyncClient) -> None:
    """Тест создания покупателя с дублирующимся ID: 409."""
    # Создаем первого покупателя
    input_json = generate_test_data("buyer")
    
    response1 = await api_client.post(URI, json=input_json)
    assert_response_success(response1, 201)
    
    # Пытаемся создать второго покупателя с тем же ID
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
async def test_post_buyer_empty_body(api_client: httpx.AsyncClient) -> None:
    """Тест создания покупателя с пустым телом запроса: 422."""
    response = await api_client.post(URI, json={})

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
async def test_post_buyer_invalid_json(api_client: httpx.AsyncClient) -> None:
    """Тест создания покупателя с невалидным JSON: 400."""
    # Отправляем невалидный JSON как строку
    response = await api_client.post(
        URI,
        content="invalid json content",
        headers={"Content-Type": "application/json"}
    )

    # Ожидаем ошибку парсинга JSON
    assert response.status_code == 400, (
        f"Expected JSON parse error (400), got {response.status_code}. "
        f"Response: {response.text}"
    )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_buyer_extra_fields(api_client: httpx.AsyncClient) -> None:
    """Тест создания покупателя с дополнительными полями."""
    # Добавляем дополнительные поля к валидным данным
    input_json = generate_test_data("buyer")
    input_json.update({
        "extra_field": "should_be_ignored",
        "another_field": 123
    })
    
    response = await api_client.post(URI, json=input_json)
    
    # API должен либо игнорировать дополнительные поля (201), 
    # либо отклонить запрос (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "buyer")
        
        # Проверяем, что дополнительные поля не включены в ответ
        assert "extra_field" not in response_data
        assert "another_field" not in response_data
