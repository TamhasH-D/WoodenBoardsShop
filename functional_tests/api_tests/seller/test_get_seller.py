"""
Тесты GET /api/v1/sellers/ endpoint.
Аналогично backend/backend/tests/endpoint_tests/seller/test_get_seller.py
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
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_sellers_empty_list(api_client: httpx.AsyncClient) -> None:
    """Тест получения пустого списка продавцов: 200."""
    response = await api_client.get(URI)
    
    response_data = assert_response_success(response, 200)
    
    # Проверяем, что возвращается список (может быть пустым)
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_sellers_with_data(api_client: httpx.AsyncClient) -> None:
    """Тест получения списка продавцов с данными: 200."""
    # Создаем несколько продавцов
    sellers_data = []
    for i in range(3):
        seller_data = generate_test_data("seller")
        response = await api_client.post(URI, json=seller_data)
        created_seller = assert_response_success(response, 201)
        sellers_data.append(created_seller)
    
    # Получаем список продавцов
    response = await api_client.get(URI)
    response_data = assert_response_success(response, 200)
    
    # Проверяем, что возвращается список
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
    assert len(response_data) >= 3, f"Expected at least 3 sellers, got {len(response_data)}"
    
    # Проверяем структуру каждого продавца
    for seller in response_data:
        validate_entity_fields(seller, "seller")
    
    # Проверяем, что все созданные продавцы присутствуют в списке
    response_ids = [seller["id"] for seller in response_data]
    for created_seller in sellers_data:
        assert created_seller["id"] in response_ids, (
            f"Created seller {created_seller['id']} not found in response"
        )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.pagination
@pytest.mark.fast
async def test_get_sellers_pagination_limit(api_client: httpx.AsyncClient) -> None:
    """Тест пагинации с параметром limit."""
    # Создаем несколько продавцов для тестирования пагинации
    for i in range(5):
        seller_data = generate_test_data("seller")
        response = await api_client.post(URI, json=seller_data)
        assert_response_success(response, 201)
    
    # Тестируем пагинацию с limit
    response = await api_client.get(URI, params={"limit": 2})
    response_data = assert_response_success(response, 200)
    
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
    
    # Проверяем структуру возвращенных данных
    for seller in response_data:
        validate_entity_fields(seller, "seller")


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.pagination
@pytest.mark.fast
async def test_get_sellers_pagination_offset(api_client: httpx.AsyncClient) -> None:
    """Тест пагинации с параметрами offset и limit."""
    # Создаем продавцов
    created_sellers = []
    for i in range(4):
        seller_data = generate_test_data("seller")
        response = await api_client.post(URI, json=seller_data)
        created_seller = assert_response_success(response, 201)
        created_sellers.append(created_seller)
    
    # Получаем первую страницу
    first_page_response = await api_client.get(URI, params={"limit": 2, "offset": 0})
    first_page_data = assert_response_success(first_page_response, 200)
    
    # Получаем вторую страницу
    second_page_response = await api_client.get(URI, params={"limit": 2, "offset": 2})
    second_page_data = assert_response_success(second_page_response, 200)
    
    # Проверяем, что страницы не пересекаются
    first_page_ids = [seller["id"] for seller in first_page_data]
    second_page_ids = [seller["id"] for seller in second_page_data]
    
    # Не должно быть пересечений между страницами
    intersection = set(first_page_ids) & set(second_page_ids)
    assert len(intersection) == 0, f"Pages should not overlap, but found common IDs: {intersection}"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_sellers_invalid_pagination_params(api_client: httpx.AsyncClient) -> None:
    """Тест с невалидными параметрами пагинации."""
    # Тестируем с невалидными параметрами
    test_cases = [
        {"limit": -1},  # Отрицательный limit
        {"limit": "invalid"},  # Нечисловой limit
        {"offset": -1},  # Отрицательный offset
        {"offset": "invalid"},  # Нечисловой offset
        {"limit": 0},  # Нулевой limit
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
@pytest.mark.validation
@pytest.mark.fast
async def test_get_sellers_large_limit(api_client: httpx.AsyncClient) -> None:
    """Тест с очень большим значением limit."""
    response = await api_client.get(URI, params={"limit": 10000})
    
    # API должен либо обработать запрос (200), либо ограничить limit (200),
    # либо вернуть ошибку (400)
    assert response.status_code in [200, 400], (
        f"Expected success (200) or error (400), got {response.status_code}. "
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
async def test_get_sellers_consistency_check(api_client: httpx.AsyncClient) -> None:
    """Тест консистентности данных при множественных запросах."""
    # Создаем продавца
    seller_data = generate_test_data("seller")
    create_response = await api_client.post(URI, json=seller_data)
    created_seller = assert_response_success(create_response, 201)
    
    # Выполняем несколько GET запросов подряд
    responses = []
    for i in range(3):
        response = await api_client.get(URI)
        response_data = assert_response_success(response, 200)
        responses.append(response_data)
    
    # Проверяем, что созданный продавец присутствует во всех ответах
    for response_data in responses:
        seller_ids = [seller["id"] for seller in response_data]
        assert created_seller["id"] in seller_ids, (
            f"Created seller {created_seller['id']} not found in one of the responses"
        )


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.validation
@pytest.mark.fast
async def test_get_sellers_with_query_params(api_client: httpx.AsyncClient) -> None:
    """Тест с дополнительными query параметрами."""
    # Добавляем различные query параметры
    response = await api_client.get(
        URI,
        params={
            "limit": 10,
            "offset": 0,
            "extra_param": "should_be_ignored",
            "another_param": 123
        }
    )
    
    # API должен игнорировать неизвестные параметры и вернуть данные
    response_data = assert_response_success(response, 200)
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.performance
@pytest.mark.slow
async def test_get_sellers_performance(api_client: httpx.AsyncClient) -> None:
    """Тест производительности получения списка продавцов."""
    import time
    
    # Создаем несколько продавцов
    for i in range(10):
        seller_data = generate_test_data("seller")
        response = await api_client.post(URI, json=seller_data)
        assert_response_success(response, 201)
    
    # Измеряем время выполнения GET запроса
    start_time = time.time()
    response = await api_client.get(URI)
    end_time = time.time()
    
    response_data = assert_response_success(response, 200)
    request_time = end_time - start_time
    
    # Проверяем производительность (не более 5 секунд)
    assert request_time < 5.0, f"GET request took too long: {request_time:.2f} seconds"
    
    # Проверяем, что получили данные
    assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
    assert len(response_data) >= 10, f"Expected at least 10 sellers, got {len(response_data)}"


@pytest.mark.anyio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.integration
@pytest.mark.fast
async def test_get_sellers_after_multiple_operations(api_client: httpx.AsyncClient) -> None:
    """Интеграционный тест: проверка списка после различных операций."""
    # Получаем начальное состояние
    initial_response = await api_client.get(URI)
    initial_data = assert_response_success(initial_response, 200)
    initial_count = len(initial_data)
    
    # Создаем несколько продавцов
    created_sellers = []
    for i in range(3):
        seller_data = generate_test_data("seller")
        create_response = await api_client.post(URI, json=seller_data)
        created_seller = assert_response_success(create_response, 201)
        created_sellers.append(created_seller)
    
    # Проверяем финальное состояние
    final_response = await api_client.get(URI)
    final_data = assert_response_success(final_response, 200)
    
    # Должно быть на 3 продавца больше
    assert len(final_data) == initial_count + 3, (
        f"Expected {initial_count + 3} sellers, got {len(final_data)}"
    )
    
    # Все созданные продавцы должны быть в финальном списке
    final_ids = [seller["id"] for seller in final_data]
    for created_seller in created_sellers:
        assert created_seller["id"] in final_ids, (
            f"Created seller {created_seller['id']} not found in final list"
        )
