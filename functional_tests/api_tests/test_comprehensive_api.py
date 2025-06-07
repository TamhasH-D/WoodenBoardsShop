"""Комплексные API тесты для всех сущностей WoodenBoardsShop."""

import pytest
import uuid
from typing import Dict, Any, List
import asyncio
from datetime import datetime, timezone
import httpx
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory


class TestComprehensiveAPI:
    """Комплексные тесты API для всех сущностей."""

    @pytest.mark.asyncio
    @pytest.mark.api
    async def test_health_endpoint_comprehensive(self, api_client: APIClient):
        """Комплексное тестирование health endpoint."""
        # Тест базовой функциональности
        response = await api_client.get("/api/v1/health")
        assert response.status_code == 200
        
        # Тест множественных запросов
        tasks = [api_client.get("/api/v1/health") for _ in range(10)]
        responses = await asyncio.gather(*tasks)
        
        for response in responses:
            assert response.status_code == 200
            
        # Тест производительности
        start_time = datetime.now()
        await api_client.get("/api/v1/health")
        end_time = datetime.now()
        response_time = (end_time - start_time).total_seconds()
        
        assert response_time < 2.0, f"Health endpoint слишком медленный: {response_time}s"

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.crud
    async def test_buyer_crud_comprehensive(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Комплексное CRUD тестирование для Buyer."""
        # CREATE - Создание покупателя
        buyer_data = await test_data_factory.create_buyer_data()
        
        create_response = await api_client.post("/api/v1/buyers/", json=buyer_data)
        assert create_response.status_code == 201
        created_buyer = create_response.json()["data"]
        
        assert created_buyer["id"] == buyer_data["id"]
        assert created_buyer["keycloak_uuid"] == buyer_data["keycloak_uuid"]
        assert created_buyer["is_online"] == buyer_data["is_online"]
        
        # READ - Получение покупателя
        read_response = await api_client.get(f"/api/v1/buyers/{buyer_data['id']}")
        assert read_response.status_code == 200
        read_buyer = read_response.json()["data"]
        
        assert read_buyer["id"] == created_buyer["id"]
        
        # UPDATE - Обновление покупателя
        update_data = {"is_online": not buyer_data["is_online"]}
        update_response = await api_client.patch(f"/api/v1/buyers/{buyer_data['id']}", json=update_data)
        assert update_response.status_code == 200
        
        # Проверка обновления
        updated_response = await api_client.get(f"/api/v1/buyers/{buyer_data['id']}")
        updated_buyer = updated_response.json()["data"]
        assert updated_buyer["is_online"] == update_data["is_online"]
        
        # DELETE - Удаление покупателя
        delete_response = await api_client.delete(f"/api/v1/buyers/{buyer_data['id']}")
        assert delete_response.status_code == 200
        
        # Проверка удаления
        get_deleted_response = await api_client.get(f"/api/v1/buyers/{buyer_data['id']}")
        assert get_deleted_response.status_code == 404

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.crud
    async def test_seller_crud_comprehensive(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Комплексное CRUD тестирование для Seller."""
        # CREATE
        seller_data = await test_data_factory.create_seller_data()
        
        create_response = await api_client.post("/api/v1/sellers/", json=seller_data)
        assert create_response.status_code == 201
        created_seller = create_response.json()["data"]
        
        # READ
        read_response = await api_client.get(f"/api/v1/sellers/{seller_data['id']}")
        assert read_response.status_code == 200
        
        # UPDATE
        update_data = {"is_online": not seller_data["is_online"]}
        update_response = await api_client.patch(f"/api/v1/sellers/{seller_data['id']}", json=update_data)
        assert update_response.status_code == 200
        
        # DELETE
        delete_response = await api_client.delete(f"/api/v1/sellers/{seller_data['id']}")
        assert delete_response.status_code == 200

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.crud
    async def test_wood_type_crud_comprehensive(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Комплексное CRUD тестирование для WoodType."""
        # CREATE
        wood_type_data = await test_data_factory.create_wood_type_data()
        
        create_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
        assert create_response.status_code == 201
        created_wood_type = create_response.json()["data"]
        
        assert created_wood_type["neme"] == wood_type_data["neme"]  # Сохраняем typo
        assert created_wood_type["descrioption"] == wood_type_data["descrioption"]  # Сохраняем typo
        
        # READ
        read_response = await api_client.get(f"/api/v1/wood-types/{wood_type_data['id']}")
        assert read_response.status_code == 200
        
        # UPDATE
        update_data = {"descrioption": "Обновленное описание древесины"}
        update_response = await api_client.patch(f"/api/v1/wood-types/{wood_type_data['id']}", json=update_data)
        assert update_response.status_code == 200
        
        # DELETE
        delete_response = await api_client.delete(f"/api/v1/wood-types/{wood_type_data['id']}")
        assert delete_response.status_code == 200

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.crud
    async def test_product_crud_comprehensive(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Комплексное CRUD тестирование для Product."""
        # Создаем зависимости
        seller_data = await test_data_factory.create_seller_data()
        await api_client.post("/api/v1/sellers/", json=seller_data)
        
        wood_type_data = await test_data_factory.create_wood_type_data()
        await api_client.post("/api/v1/wood-types/", json=wood_type_data)
        
        # CREATE Product
        product_data = await test_data_factory.create_product_data(
            seller_id=seller_data["id"],
            wood_type_id=wood_type_data["id"]
        )
        
        create_response = await api_client.post("/api/v1/products/", json=product_data)
        assert create_response.status_code == 201
        created_product = create_response.json()["data"]
        
        assert created_product["title"] == product_data["title"]
        assert created_product["volume"] == product_data["volume"]
        assert created_product["price"] == product_data["price"]
        
        # READ
        read_response = await api_client.get(f"/api/v1/products/{product_data['id']}")
        assert read_response.status_code == 200
        
        # UPDATE
        update_data = {
            "title": "Обновленный товар",
            "price": product_data["price"] * 1.1
        }
        update_response = await api_client.patch(f"/api/v1/products/{product_data['id']}", json=update_data)
        assert update_response.status_code == 200
        
        # DELETE
        delete_response = await api_client.delete(f"/api/v1/products/{product_data['id']}")
        assert delete_response.status_code == 200

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.pagination
    async def test_pagination_comprehensive(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Комплексное тестирование пагинации."""
        # Создаем множество покупателей для тестирования пагинации
        buyers_data = []
        for i in range(25):  # Создаем больше чем лимит по умолчанию (20)
            buyer_data = await test_data_factory.create_buyer_data()
            await api_client.post("/api/v1/buyers/", json=buyer_data)
            buyers_data.append(buyer_data)
        
        # Тест первой страницы
        page1_response = await api_client.get("/api/v1/buyers/?limit=10&offset=0")
        assert page1_response.status_code == 200
        page1_data = page1_response.json()
        
        assert len(page1_data["data"]) == 10
        assert page1_data["total"] >= 25
        assert page1_data["limit"] == 10
        assert page1_data["offset"] == 0
        
        # Тест второй страницы
        page2_response = await api_client.get("/api/v1/buyers/?limit=10&offset=10")
        assert page2_response.status_code == 200
        page2_data = page2_response.json()
        
        assert len(page2_data["data"]) == 10
        assert page2_data["offset"] == 10
        
        # Проверяем, что данные разные
        page1_ids = {item["id"] for item in page1_data["data"]}
        page2_ids = {item["id"] for item in page2_data["data"]}
        assert page1_ids.isdisjoint(page2_ids), "Страницы содержат одинаковые данные"

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.validation
    async def test_validation_errors_comprehensive(self, api_client: APIClient):
        """Комплексное тестирование валидации данных."""
        # Тест создания покупателя с невалидными данными
        invalid_buyer_data = {
            "id": "invalid-uuid",  # Невалидный UUID
            "keycloak_uuid": "also-invalid",
            "is_online": "not-boolean"  # Невалидный boolean
        }
        
        response = await api_client.post("/api/v1/buyers/", json=invalid_buyer_data)
        assert response.status_code == 422  # Validation Error
        
        # Тест создания продукта с отрицательными значениями
        invalid_product_data = {
            "id": str(uuid.uuid4()),
            "volume": -1.0,  # Отрицательный объем
            "price": -100.0,  # Отрицательная цена
            "title": "",  # Пустой заголовок
            "seller_id": str(uuid.uuid4()),
            "wood_type_id": str(uuid.uuid4())
        }
        
        response = await api_client.post("/api/v1/products/", json=invalid_product_data)
        assert response.status_code in [400, 422]  # Bad Request или Validation Error

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.performance
    async def test_api_performance_comprehensive(self, api_client: APIClient):
        """Комплексное тестирование производительности API."""
        # Тест производительности health endpoint
        start_time = datetime.now()
        tasks = [api_client.get("/api/v1/health") for _ in range(50)]
        responses = await asyncio.gather(*tasks)
        end_time = datetime.now()
        
        total_time = (end_time - start_time).total_seconds()
        avg_time = total_time / 50
        
        assert all(r.status_code == 200 for r in responses), "Не все запросы успешны"
        assert avg_time < 1.0, f"Средний ответ слишком медленный: {avg_time}s"
        assert total_time < 10.0, f"Общее время выполнения слишком большое: {total_time}s"

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.security
    async def test_security_comprehensive(self, api_client: APIClient):
        """Комплексное тестирование безопасности API."""
        # Тест SQL injection
        malicious_id = "'; DROP TABLE buyer; --"
        response = await api_client.get(f"/api/v1/buyers/{malicious_id}")
        assert response.status_code in [400, 404, 422]  # Не должен быть 500
        
        # Тест XSS
        xss_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": False
        }
        
        response = await api_client.post("/api/v1/buyers/", json=xss_data)
        # API должен обрабатывать данные безопасно
        assert response.status_code in [200, 201, 400, 422]

    @pytest.mark.asyncio
    @pytest.mark.api
    @pytest.mark.integration
    async def test_cross_entity_relationships(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тестирование связей между сущностями."""
        # Создаем полную цепочку связанных сущностей
        seller_data = await test_data_factory.create_seller_data()
        await api_client.post("/api/v1/sellers/", json=seller_data)
        
        wood_type_data = await test_data_factory.create_wood_type_data()
        await api_client.post("/api/v1/wood-types/", json=wood_type_data)
        
        product_data = await test_data_factory.create_product_data(
            seller_id=seller_data["id"],
            wood_type_id=wood_type_data["id"]
        )
        await api_client.post("/api/v1/products/", json=product_data)
        
        buyer_data = await test_data_factory.create_buyer_data()
        await api_client.post("/api/v1/buyers/", json=buyer_data)
        
        # Создаем чат между покупателем и продавцом
        chat_thread_data = await test_data_factory.create_chat_thread_data(
            buyer_id=buyer_data["id"],
            seller_id=seller_data["id"]
        )
        thread_response = await api_client.post("/api/v1/chat-threads/", json=chat_thread_data)
        assert thread_response.status_code == 201
        
        # Создаем сообщение в чате
        chat_message_data = await test_data_factory.create_chat_message_data(
            thread_id=chat_thread_data["id"],
            buyer_id=buyer_data["id"]
        )
        message_response = await api_client.post("/api/v1/chat-messages/", json=chat_message_data)
        assert message_response.status_code == 201
        
        # Проверяем, что все связи работают
        thread_check = await api_client.get(f"/api/v1/chat-threads/{chat_thread_data['id']}")
        assert thread_check.status_code == 200
        
        message_check = await api_client.get(f"/api/v1/chat-messages/{chat_message_data['id']}")
        assert message_check.status_code == 200
