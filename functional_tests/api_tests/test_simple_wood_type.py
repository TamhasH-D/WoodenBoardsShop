"""
Простой тест wood_type API без anyio маркера.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/wood-types/"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_simple_post_wood_type_success() -> None:
    """Простой тест создания типа древесины: 201."""
    # Создаем клиент напрямую
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Подготовка данных
        input_json = generate_test_data("wood_type")

        # Выполнение запроса
        response = await client.post(URI, json=input_json)

        # Проверка ответа
        response_data = assert_response_success(response, 201)

        # Валидация полей
        validate_entity_fields(response_data, "wood_type")

        # Проверка соответствия входных и выходных данных
        assert response_data["neme"] == input_json["neme"]
        assert response_data["description"] == input_json["description"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_simple_get_wood_types() -> None:
    """Простой тест получения списка типов древесины: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        response = await client.get(URI)

        response_data = assert_response_success(response, 200)

        # Проверяем, что возвращается список
        assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"

        # Проверяем структуру каждого элемента
        for wood_type in response_data:
            validate_entity_fields(wood_type, "wood_type")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_simple_wood_type_workflow() -> None:
    """Простой интеграционный тест: создание и проверка."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тип древесины
        input_json = generate_test_data("wood_type")
        create_response = await client.post(URI, json=input_json)
        created_wood_type = assert_response_success(create_response, 201)

        # Проверяем, что тип древесины появился в списке
        list_response = await client.get(URI)
        wood_types_list = assert_response_success(list_response, 200)

        # Ищем созданный тип древесины в списке
        wood_type_ids = [wt["id"] for wt in wood_types_list]
        assert created_wood_type["id"] in wood_type_ids, (
            f"Created wood_type {created_wood_type['id']} not found in wood_types list"
        )

        # Находим созданный тип древесины и проверяем данные
        found_wood_type = next(wt for wt in wood_types_list if wt["id"] == created_wood_type["id"])
        assert found_wood_type["neme"] == created_wood_type["neme"]
        assert found_wood_type["description"] == created_wood_type["description"]
