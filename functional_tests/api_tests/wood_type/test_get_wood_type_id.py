"""
Тесты GET /api/v1/wood-types/{wood_type_id} endpoint.
Аналогично backend/backend/tests/endpoint_tests/wood_type/test_get_wood_type_id.py
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    assert_response_error,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/wood-types/{wood_type_id}"
CREATE_URI = "/api/v1/wood-types/"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_wood_type_by_id_success(api_client: httpx.AsyncClient) -> None:
    """Тест получения типа древесины по ID: 200."""
    # Создаем тип древесины
    input_json = generate_test_data("wood_type")
    create_response = await api_client.post(CREATE_URI, json=input_json)
    created_wood_type = assert_response_success(create_response, 201)
    
    # Получаем тип древесины по ID
    response = await api_client.get(URI.format(wood_type_id=created_wood_type["id"]))
    response_data = assert_response_success(response, 200)
    
    # Валидация полей
    validate_entity_fields(response_data, "wood_type")
    
    # Проверка соответствия данных
    assert response_data["id"] == created_wood_type["id"]
    assert response_data["neme"] == created_wood_type["neme"]
    assert response_data["description"] == created_wood_type["description"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_wood_type_by_invalid_id(api_client: httpx.AsyncClient) -> None:
    """Тест получения типа древесины с невалидным ID: 400/422."""
    invalid_ids = [
        "invalid-uuid",
        "123",
        "not-a-uuid-at-all",
        "",
    ]
    
    for invalid_id in invalid_ids:
        response = await api_client.get(URI.format(wood_type_id=invalid_id))
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422) for ID '{invalid_id}', "
            f"got {response.status_code}. Response: {response.text}"
        )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.error_handling
@pytest.mark.fast
async def test_get_wood_type_by_nonexistent_id(api_client: httpx.AsyncClient) -> None:
    """Тест получения несуществующего типа древесины: 404."""
    # Используем валидный UUID, который не существует в базе
    nonexistent_id = "550e8400-e29b-41d4-a716-446655440000"
    
    response = await api_client.get(URI.format(wood_type_id=nonexistent_id))
    
    # Ожидаем ошибку "не найдено"
    assert response.status_code == 404, (
        f"Expected not found error (404), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    # Проверяем структуру ошибки
    assert_response_error(response, 404)


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_wood_type_after_create(api_client: httpx.AsyncClient) -> None:
    """Интеграционный тест: создание и немедленное получение."""
    # Создаем тип древесины
    input_json = generate_test_data("wood_type")
    create_response = await api_client.post(CREATE_URI, json=input_json)
    created_wood_type = assert_response_success(create_response, 201)
    
    # Немедленно получаем созданный тип древесины
    get_response = await api_client.get(URI.format(wood_type_id=created_wood_type["id"]))
    retrieved_wood_type = assert_response_success(get_response, 200)
    
    # Проверяем полное соответствие данных
    assert retrieved_wood_type["id"] == created_wood_type["id"]
    assert retrieved_wood_type["neme"] == created_wood_type["neme"]
    assert retrieved_wood_type["description"] == created_wood_type["description"]
    
    # Проверяем, что все поля присутствуют
    validate_entity_fields(retrieved_wood_type, "wood_type")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_wood_type_case_sensitive_id(api_client: httpx.AsyncClient) -> None:
    """Тест чувствительности к регистру в UUID."""
    # Создаем тип древесины
    input_json = generate_test_data("wood_type")
    create_response = await api_client.post(CREATE_URI, json=input_json)
    created_wood_type = assert_response_success(create_response, 201)
    
    original_id = created_wood_type["id"]
    
    # Тестируем с разным регистром
    uppercase_id = original_id.upper()
    lowercase_id = original_id.lower()
    
    # UUID должны быть нечувствительны к регистру
    for test_id in [uppercase_id, lowercase_id]:
        response = await api_client.get(URI.format(wood_type_id=test_id))
        
        # Должен вернуть тот же объект
        assert response.status_code == 200, (
            f"Expected success (200) for ID '{test_id}', got {response.status_code}. "
            f"Response: {response.text}"
        )
        
        response_data = assert_response_success(response, 200)
        assert response_data["id"] == created_wood_type["id"]


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_wood_type_with_special_characters_in_url(api_client: httpx.AsyncClient) -> None:
    """Тест с специальными символами в URL."""
    # Тестируем различные специальные символы в URL
    special_ids = [
        "550e8400-e29b-41d4-a716-446655440000%20",  # С пробелом (URL encoded)
        "550e8400-e29b-41d4-a716-446655440000/",     # С слешем
        "550e8400-e29b-41d4-a716-446655440000?test=1", # С query параметром
    ]
    
    for special_id in special_ids:
        response = await api_client.get(URI.format(wood_type_id=special_id))
        
        # Ожидаем ошибку валидации или 404
        assert response.status_code in [400, 404, 422], (
            f"Expected error (400/404/422) for special ID '{special_id}', "
            f"got {response.status_code}. Response: {response.text}"
        )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.performance
@pytest.mark.fast
async def test_get_wood_type_multiple_requests(api_client: httpx.AsyncClient) -> None:
    """Тест множественных запросов к одному ресурсу."""
    # Создаем тип древесины
    input_json = generate_test_data("wood_type")
    create_response = await api_client.post(CREATE_URI, json=input_json)
    created_wood_type = assert_response_success(create_response, 201)
    
    # Выполняем несколько запросов подряд
    for i in range(5):
        response = await api_client.get(URI.format(wood_type_id=created_wood_type["id"]))
        response_data = assert_response_success(response, 200)
        
        # Каждый запрос должен возвращать одинаковые данные
        assert response_data["id"] == created_wood_type["id"]
        assert response_data["neme"] == created_wood_type["neme"]
        assert response_data["description"] == created_wood_type["description"]
        
        validate_entity_fields(response_data, "wood_type")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_wood_type_with_query_params(api_client: httpx.AsyncClient) -> None:
    """Тест с дополнительными query параметрами."""
    # Создаем тип древесины
    input_json = generate_test_data("wood_type")
    create_response = await api_client.post(CREATE_URI, json=input_json)
    created_wood_type = assert_response_success(create_response, 201)
    
    # Добавляем различные query параметры
    response = await api_client.get(
        URI.format(wood_type_id=created_wood_type["id"]),
        params={"extra": "param", "test": "value"}
    )
    
    # API должен игнорировать дополнительные параметры и вернуть данные
    response_data = assert_response_success(response, 200)
    validate_entity_fields(response_data, "wood_type")
    assert response_data["id"] == created_wood_type["id"]
