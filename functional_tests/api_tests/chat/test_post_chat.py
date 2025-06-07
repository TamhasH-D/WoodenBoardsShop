"""
Тесты POST /api/v1/chats/ endpoint.
Проверяют создание чатов между покупателями и продавцами.
"""

import pytest
import httpx

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)

URI = "/api/v1/chat-threads/"
BUYERS_URI = "/api/v1/buyers/"
SELLERS_URI = "/api/v1/sellers/"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.crud
@pytest.mark.fast
async def test_post_chat_success() -> None:
    """Тест создания чата: 201."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post(BUYERS_URI, json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)
        
        # Создаем продавца
        seller_data = generate_test_data("seller")
        seller_response = await client.post(SELLERS_URI, json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        # Подготовка данных чата
        input_json = generate_test_data("chat")
        input_json["buyer_id"] = created_buyer["id"]
        input_json["seller_id"] = created_seller["id"]
        
        # Выполнение запроса
        response = await client.post(URI, json=input_json)
        
        # Проверка ответа
        response_data = assert_response_success(response, 201)
        
        # Валидация полей
        validate_entity_fields(response_data, "chat")
        
        # Проверка соответствия входных и выходных данных
        assert response_data["buyer_id"] == input_json["buyer_id"]
        assert response_data["seller_id"] == input_json["seller_id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_chat_invalid_data() -> None:
    """Тест создания чата с невалидными данными: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с невалидными типами данных
        invalid_data = {
            "id": "invalid-uuid",  # Невалидный UUID
            "buyer_id": "invalid-buyer-id",  # Невалидный UUID
            "seller_id": 123  # Должно быть строкой UUID
        }
        
        response = await client.post(URI, json=invalid_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_chat_missing_fields() -> None:
    """Тест создания чата с отсутствующими полями: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с отсутствующими обязательными полями
        incomplete_data = {
            "id": "550e8400-e29b-41d4-a716-446655440000"
            # Отсутствуют buyer_id и seller_id
        }
        
        response = await client.post(URI, json=incomplete_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_chat_nonexistent_participants() -> None:
    """Тест создания чата с несуществующими участниками: 400/422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Подготовка данных с несуществующими участниками
        input_json = generate_test_data("chat")
        input_json["buyer_id"] = "550e8400-e29b-41d4-a716-446655440000"  # Несуществующий buyer
        input_json["seller_id"] = "550e8400-e29b-41d4-a716-446655440001"  # Несуществующий seller
        
        response = await client.post(URI, json=input_json)
        
        # Ожидаем ошибку валидации или внешнего ключа
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_chat_duplicate_participants() -> None:
    """Тест создания дублирующего чата между теми же участниками."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем участников
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post(BUYERS_URI, json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)
        
        seller_data = generate_test_data("seller")
        seller_response = await client.post(SELLERS_URI, json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        # Создаем первый чат
        first_chat_data = generate_test_data("chat")
        first_chat_data["buyer_id"] = created_buyer["id"]
        first_chat_data["seller_id"] = created_seller["id"]
        
        first_response = await client.post(URI, json=first_chat_data)
        first_chat = assert_response_success(first_response, 201)
        
        # Пытаемся создать второй чат между теми же участниками
        second_chat_data = generate_test_data("chat")
        second_chat_data["buyer_id"] = created_buyer["id"]
        second_chat_data["seller_id"] = created_seller["id"]
        
        second_response = await client.post(URI, json=second_chat_data)
        
        # API может либо создать новый чат (201), либо отклонить дублирование (400/409)
        assert second_response.status_code in [201, 400, 409], (
            f"Expected success (201) or conflict (400/409), got {second_response.status_code}. "
            f"Response: {second_response.text}"
        )
        
        if second_response.status_code == 201:
            second_chat = assert_response_success(second_response, 201)
            validate_entity_fields(second_chat, "chat")
            # Если разрешены дублирующие чаты, они должны иметь разные ID
            assert second_chat["id"] != first_chat["id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_post_chat_same_buyer_seller() -> None:
    """Тест создания чата, где buyer и seller - одно лицо."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post(BUYERS_URI, json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)
        
        # Создаем продавца с тем же keycloak_uuid (один пользователь)
        seller_data = generate_test_data("seller")
        seller_data["keycloak_uuid"] = created_buyer["keycloak_uuid"]
        seller_response = await client.post(SELLERS_URI, json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        # Пытаемся создать чат между buyer и seller с одинаковым keycloak_uuid
        chat_data = generate_test_data("chat")
        chat_data["buyer_id"] = created_buyer["id"]
        chat_data["seller_id"] = created_seller["id"]
        
        response = await client.post(URI, json=chat_data)
        
        # API может либо разрешить такой чат (201), либо запретить (400)
        assert response.status_code in [201, 400], (
            f"Expected success (201) or business logic error (400), got {response.status_code}. "
            f"Response: {response.text}"
        )
        
        if response.status_code == 201:
            chat = assert_response_success(response, 201)
            validate_entity_fields(chat, "chat")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.get
@pytest.mark.crud
@pytest.mark.fast
async def test_get_chats() -> None:
    """Тест получения списка чатов: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        response = await client.get(URI)
        
        response_data = assert_response_success(response, 200)
        
        # Проверяем, что возвращается список
        assert isinstance(response_data, list), f"Expected list, got {type(response_data)}"
        
        # Проверяем структуру каждого элемента
        for chat in response_data:
            validate_entity_fields(chat, "chat")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_chat_workflow() -> None:
    """Интеграционный тест: создание чата и проверка."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем участников
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post(BUYERS_URI, json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)
        
        seller_data = generate_test_data("seller")
        seller_response = await client.post(SELLERS_URI, json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        # Создаем чат
        input_json = generate_test_data("chat")
        input_json["buyer_id"] = created_buyer["id"]
        input_json["seller_id"] = created_seller["id"]
        
        create_response = await client.post(URI, json=input_json)
        created_chat = assert_response_success(create_response, 201)
        
        # Проверяем, что чат появился в списке
        list_response = await client.get(URI)
        chats_list = assert_response_success(list_response, 200)
        
        # Ищем созданный чат в списке
        chat_ids = [chat["id"] for chat in chats_list]
        assert created_chat["id"] in chat_ids, (
            f"Created chat {created_chat['id']} not found in chats list"
        )
        
        # Находим созданный чат и проверяем данные
        found_chat = next(chat for chat in chats_list if chat["id"] == created_chat["id"])
        assert found_chat["buyer_id"] == created_chat["buyer_id"]
        assert found_chat["seller_id"] == created_chat["seller_id"]


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.performance
@pytest.mark.fast
async def test_chat_creation_performance() -> None:
    """Тест производительности создания чатов."""
    import time
    
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем участников
        buyers = []
        sellers = []
        
        for i in range(2):
            buyer_data = generate_test_data("buyer")
            buyer_response = await client.post(BUYERS_URI, json=buyer_data)
            buyer = assert_response_success(buyer_response, 201)
            buyers.append(buyer)
            
            seller_data = generate_test_data("seller")
            seller_response = await client.post(SELLERS_URI, json=seller_data)
            seller = assert_response_success(seller_response, 201)
            sellers.append(seller)
        
        # Измеряем время создания чатов
        start_time = time.time()
        
        created_chats = []
        for i in range(2):
            chat_data = generate_test_data("chat")
            chat_data["buyer_id"] = buyers[i]["id"]
            chat_data["seller_id"] = sellers[i]["id"]
            
            create_response = await client.post(URI, json=chat_data)
            created_chat = assert_response_success(create_response, 201)
            created_chats.append(created_chat)
        
        end_time = time.time()
        creation_time = end_time - start_time
        
        # Проверяем производительность (не более 5 секунд на 2 чата)
        assert creation_time < 5.0, f"Creating 2 chats took too long: {creation_time:.2f} seconds"
        
        # Проверяем, что все чаты созданы корректно
        for chat in created_chats:
            validate_entity_fields(chat, "chat")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.integration
@pytest.mark.fast
async def test_chat_with_multiple_participants() -> None:
    """Тест создания чатов с множественными участниками."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем одного покупателя
        buyer_data = generate_test_data("buyer")
        buyer_response = await client.post(BUYERS_URI, json=buyer_data)
        created_buyer = assert_response_success(buyer_response, 201)
        
        # Создаем нескольких продавцов
        created_sellers = []
        for i in range(3):
            seller_data = generate_test_data("seller")
            seller_response = await client.post(SELLERS_URI, json=seller_data)
            created_seller = assert_response_success(seller_response, 201)
            created_sellers.append(created_seller)
        
        # Создаем чаты между одним покупателем и разными продавцами
        created_chats = []
        for seller in created_sellers:
            chat_data = generate_test_data("chat")
            chat_data["buyer_id"] = created_buyer["id"]
            chat_data["seller_id"] = seller["id"]
            
            create_response = await client.post(URI, json=chat_data)
            created_chat = assert_response_success(create_response, 201)
            created_chats.append(created_chat)
        
        # Проверяем, что все чаты созданы с одним покупателем
        for chat in created_chats:
            assert chat["buyer_id"] == created_buyer["id"]
            validate_entity_fields(chat, "chat")
        
        # Проверяем, что у каждого чата разный продавец
        seller_ids = [chat["seller_id"] for chat in created_chats]
        assert len(set(seller_ids)) == len(seller_ids), "All chats should have different sellers"
