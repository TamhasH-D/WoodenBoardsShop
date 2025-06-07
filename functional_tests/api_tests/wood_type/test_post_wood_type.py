"""
Тесты POST /api/v1/wood-types/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/wood_type/test_post_wood_type.py
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/wood-types/"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_wood_type_success(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины: 201."""
    # Подготовка данных
    input_json = generate_test_data("wood_type")
    
    # Выполнение запроса
    response = await api_client.post(URI, json=input_json)
    
    # Проверка ответа
    response_data = assert_response_success(response, 201)
    
    # Валидация полей
    validate_entity_fields(response_data, "wood_type")
    
    # Проверка соответствия входных и выходных данных
    assert response_data["neme"] == input_json["neme"]
    assert response_data["description"] == input_json["description"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_invalid_data(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины с невалидными данными: 422."""
    # Тест с невалидными типами данных
    invalid_data = {
        "id": "invalid-uuid",  # Невалидный UUID
        "neme": 123,  # Должно быть строкой
        "description": None,  # Не должно быть null
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
async def test_post_wood_type_missing_fields(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины с отсутствующими полями: 422."""
    # Тест с отсутствующими обязательными полями
    incomplete_data = {
        "id": "550e8400-e29b-41d4-a716-446655440000"
        # Отсутствуют neme и description
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
async def test_post_wood_type_empty_strings(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины с пустыми строками."""
    # Тест с пустыми строками
    input_json = generate_test_data("wood_type")
    input_json.update({
        "neme": "",
        "description": "",
    })
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять пустые строки (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "wood_type")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_long_strings(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины с длинными строками."""
    # Тест с очень длинными строками
    input_json = generate_test_data("wood_type")
    input_json.update({
        "neme": "А" * 1000,  # Очень длинное название
        "description": "Б" * 5000,  # Очень длинное описание
    })
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять длинные строки (201), либо отклонить (400/422)
    assert response.status_code in [201, 400, 422], (
        f"Expected success (201) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 201:
        response_data = assert_response_success(response, 201)
        validate_entity_fields(response_data, "wood_type")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_duplicate_id(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины с дублирующимся ID: 409."""
    # Создаем первый тип древесины
    input_json = generate_test_data("wood_type")
    
    response1 = await api_client.post(URI, json=input_json)
    assert_response_success(response1, 201)
    
    # Пытаемся создать второй тип древесины с тем же ID
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
async def test_post_wood_type_special_characters(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины со специальными символами."""
    # Тест со специальными символами
    input_json = generate_test_data("wood_type")
    input_json.update({
        "neme": "Дуб & Сосна (премиум) - 100%",
        "description": "Описание с символами: @#$%^&*()_+-=[]{}|;':\",./<>?",
    })
    
    response = await api_client.post(URI, json=input_json)
    
    # API должен принимать специальные символы
    response_data = assert_response_success(response, 201)
    validate_entity_fields(response_data, "wood_type")
    
    # Проверяем, что специальные символы сохранились
    assert response_data["neme"] == input_json["neme"]
    assert response_data["description"] == input_json["description"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_unicode_characters(api_client: httpx.AsyncClient) -> None:
    """Тест создания типа древесины с Unicode символами."""
    # Тест с Unicode символами
    input_json = generate_test_data("wood_type")
    input_json.update({
        "neme": "Дуб 🌳 Премиум",
        "description": "Описание с эмодзи 🌲🪵 и символами ñáéíóú",
    })
    
    response = await api_client.post(URI, json=input_json)
    
    # API должен поддерживать Unicode
    response_data = assert_response_success(response, 201)
    validate_entity_fields(response_data, "wood_type")
    
    # Проверяем, что Unicode символы сохранились
    assert response_data["neme"] == input_json["neme"]
    assert response_data["description"] == input_json["description"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_wood_type_whitespace_handling(api_client: httpx.AsyncClient) -> None:
    """Тест обработки пробелов в полях."""
    # Тест с пробелами в начале и конце
    input_json = generate_test_data("wood_type")
    input_json.update({
        "neme": "  Дуб с пробелами  ",
        "description": "\t\nОписание с табами и переносами\t\n",
    })
    
    response = await api_client.post(URI, json=input_json)
    
    # API может либо принять как есть, либо обрезать пробелы
    response_data = assert_response_success(response, 201)
    validate_entity_fields(response_data, "wood_type")
    
    # Проверяем, что данные сохранились (возможно, с обрезанными пробелами)
    assert len(response_data["neme"]) > 0
    assert len(response_data["description"]) > 0
