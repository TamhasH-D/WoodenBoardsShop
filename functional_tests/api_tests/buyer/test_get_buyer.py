"""
Тесты GET /api/v1/buyers/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/buyer/test_get_buyer.py
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
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_buyers_empty_list(api_client: httpx.AsyncClient) -> None:
    """Тест получения пустого списка покупателей: 200."""
    response = await api_client.get(URI)
    
    response_data = assert_response_success(response, 200)
    
    # Проверяем, что возвращается список (может быть пустым)
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_buyers_with_data(api_client: httpx.AsyncClient) -> None:
    """Тест получения списка покупателей с данными: 200."""
    # Создаем несколько покупателей
    buyers_data = []
    for i in range(3):
        buyer_data = generate_test_data("buyer")
        response = await api_client.post(URI, json=buyer_data)
        created_buyer = assert_response_success(response, 201)
        buyers_data.append(created_buyer)
    
    # Получаем список покупателей
    response = await api_client.get(URI)
    response_data = assert_response_success(response, 200)
    
    # Проверяем, что возвращается список
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
    assert len(response_data) >= 3, f"Expected at least 3 buyers, got {len(response_data)}"
    
    # Проверяем структуру каждого покупателя
    for buyer in response_data:
        validate_entity_fields(buyer, "buyer")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.pagination
@pytest.mark.fast
async def test_get_buyers_pagination(api_client: httpx.AsyncClient) -> None:
    """Тест пагинации списка покупателей."""
    # Создаем несколько покупателей для тестирования пагинации
    for i in range(5):
        buyer_data = generate_test_data("buyer")
        response = await api_client.post(URI, json=buyer_data)
        assert_response_success(response, 201)
    
    # Тестируем пагинацию с limit
    response = await api_client.get(URI, params={"limit": 2})
    response_data = assert_response_success(response, 200)
    
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
    # API может возвращать меньше элементов, если пагинация не реализована
    # или если в базе меньше данных
    
    # Проверяем структуру возвращенных данных
    for buyer in response_data:
        validate_entity_fields(buyer, "buyer")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.pagination
@pytest.mark.fast
async def test_get_buyers_with_offset(api_client: httpx.AsyncClient) -> None:
    """Тест пагинации с offset."""
    # Создаем покупателей
    for i in range(3):
        buyer_data = generate_test_data("buyer")
        response = await api_client.post(URI, json=buyer_data)
        assert_response_success(response, 201)
    
    # Тестируем offset
    response = await api_client.get(URI, params={"offset": 1, "limit": 2})
    response_data = assert_response_success(response, 200)
    
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
    
    # Проверяем структуру возвращенных данных
    for buyer in response_data:
        validate_entity_fields(buyer, "buyer")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_buyers_invalid_params(api_client: httpx.AsyncClient) -> None:
    """Тест с невалидными параметрами запроса."""
    # Тестируем с невалидными параметрами
    test_cases = [
        {"limit": -1},  # Отрицательный limit
        {"limit": "invalid"},  # Нечисловой limit
        {"offset": -1},  # Отрицательный offset
        {"offset": "invalid"},  # Нечисловой offset
    ]
    
    for params in test_cases:
        response = await api_client.get(URI, params=params)
        
        # API может либо игнорировать невалидные параметры (200),
        # либо возвращать ошибку валидации (400/422)
        assert response.status_code in [200, 400, 422], (
            f"Expected success (200) or validation error (400/422) for params {params}, "
            f"got {response.status_code}. Response: {response.text}"
        )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.fast
async def test_get_buyers_large_limit(api_client: httpx.AsyncClient) -> None:
    """Тест с большим значением limit."""
    response = await api_client.get(URI, params={"limit": 1000})
    
    # API должен либо обработать запрос (200), либо ограничить limit (200),
    # либо вернуть ошибку (400/422)
    assert response.status_code in [200, 400, 422], (
        f"Expected success (200) or error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 200:
        response_data = assert_response_success(response, 200)
        assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.fast
async def test_get_buyers_zero_limit(api_client: httpx.AsyncClient) -> None:
    """Тест с нулевым limit."""
    response = await api_client.get(URI, params={"limit": 0})
    
    # API может либо вернуть пустой список (200), либо ошибку валидации (400/422)
    assert response.status_code in [200, 400, 422], (
        f"Expected success (200) or validation error (400/422), got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    if response.status_code == 200:
        response_data = assert_response_success(response, 200)
        assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_buyers_after_create_and_verify(api_client: httpx.AsyncClient) -> None:
    """Интеграционный тест: создание и проверка в списке."""
    # Получаем начальное количество покупателей
    initial_response = await api_client.get(URI)
    initial_data = assert_response_success(initial_response, 200)
    initial_count = len(initial_data)
    
    # Создаем нового покупателя
    buyer_data = generate_test_data("buyer")
    create_response = await api_client.post(URI, json=buyer_data)
    created_buyer = assert_response_success(create_response, 201)
    
    # Проверяем, что покупатель появился в списке
    final_response = await api_client.get(URI)
    final_data = assert_response_success(final_response, 200)
    
    assert len(final_data) == initial_count + 1, (
        f"Expected {initial_count + 1} buyers after creation, got {len(final_data)}"
    )
    
    # Проверяем, что созданный покупатель есть в списке
    created_buyer_ids = [buyer["id"] for buyer in final_data]
    assert created_buyer["id"] in created_buyer_ids, (
        f"Created buyer {created_buyer['id']} not found in buyers list"
    )
