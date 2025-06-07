"""Функциональные тесты для Buyer API."""

import pytest
import uuid
from typing import Dict, Any
from base.test_base import BaseAPITest, APITestMixin
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory


class TestBuyerAPI(BaseAPITest, APITestMixin):
    """Тесты для API покупателей."""
    
    @pytest.mark.asyncio
    async def test_create_buyer_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного создания покупателя."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        buyer_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True
        }
        
        response = await self.test_create_entity(
            api_client.create_buyer,
            buyer_data
        )
        
        # Дополнительные проверки для buyer
        assert response["data"]["keycloak_uuid"] == buyer_data["keycloak_uuid"]
        assert response["data"]["is_online"] == buyer_data["is_online"]
    
    @pytest.mark.asyncio
    async def test_create_buyer_invalid_data(self, api_client: APIClient):
        """Тест создания покупателя с невалидными данными."""
        self.api_client = api_client
        
        # Тест без обязательных полей
        invalid_data = {"is_online": True}
        
        with pytest.raises(Exception):  # Ожидаем ошибку валидации
            await api_client.create_buyer(invalid_data)
    
    @pytest.mark.asyncio
    async def test_get_buyer_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного получения покупателя."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя
        buyer = await test_data_factory.create_buyer()
        buyer_id = buyer["data"]["id"]
        
        # Получаем покупателя
        response = await self.test_get_entity(
            api_client.get_buyer,
            buyer_id
        )
        
        assert response["data"]["id"] == buyer_id
    
    @pytest.mark.asyncio
    async def test_get_buyer_not_found(self, api_client: APIClient):
        """Тест получения несуществующего покупателя."""
        self.api_client = api_client
        
        non_existent_id = str(uuid.uuid4())
        
        with pytest.raises(Exception):  # Ожидаем 404 ошибку
            await api_client.get_buyer(non_existent_id)
    
    @pytest.mark.asyncio
    async def test_update_buyer_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного обновления покупателя."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя
        buyer = await test_data_factory.create_buyer(is_online=False)
        buyer_id = buyer["data"]["id"]
        
        # Обновляем покупателя
        update_data = {"is_online": True}
        
        await self.test_update_entity(
            api_client.update_buyer,
            buyer_id,
            update_data
        )
        
        # Проверяем, что изменения применились
        updated_buyer = await api_client.get_buyer(buyer_id)
        assert updated_buyer["data"]["is_online"] == True
    
    @pytest.mark.asyncio
    async def test_update_buyer_not_found(self, api_client: APIClient):
        """Тест обновления несуществующего покупателя."""
        self.api_client = api_client
        
        non_existent_id = str(uuid.uuid4())
        update_data = {"is_online": True}
        
        with pytest.raises(Exception):  # Ожидаем 404 ошибку
            await api_client.update_buyer(non_existent_id, update_data)
    
    @pytest.mark.asyncio
    async def test_delete_buyer_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного удаления покупателя."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя
        buyer = await test_data_factory.create_buyer()
        buyer_id = buyer["data"]["id"]
        
        # Удаляем покупателя
        await self.test_delete_entity(
            api_client.delete_buyer,
            buyer_id
        )
        
        # Проверяем, что покупатель удален
        with pytest.raises(Exception):  # Ожидаем 404 ошибку
            await api_client.get_buyer(buyer_id)
    
    @pytest.mark.asyncio
    async def test_delete_buyer_not_found(self, api_client: APIClient):
        """Тест удаления несуществующего покупателя."""
        self.api_client = api_client
        
        non_existent_id = str(uuid.uuid4())
        
        with pytest.raises(Exception):  # Ожидаем 404 ошибку
            await api_client.delete_buyer(non_existent_id)
    
    @pytest.mark.asyncio
    async def test_list_buyers_empty(self, api_client: APIClient):
        """Тест получения пустого списка покупателей."""
        self.api_client = api_client
        
        response = await self.test_list_entities(
            api_client.get_buyers,
            min_count=0
        )
        
        await self.assert_list_response(response, min_count=0)
    
    @pytest.mark.asyncio
    async def test_list_buyers_with_data(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест получения списка покупателей с данными."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем несколько покупателей
        buyers = []
        for i in range(3):
            buyer = await test_data_factory.create_buyer()
            buyers.append(buyer)
        
        response = await self.test_list_entities(
            api_client.get_buyers,
            min_count=3
        )
        
        await self.assert_list_response(response, min_count=3)
        
        # Проверяем, что созданные покупатели есть в списке
        buyer_ids = [buyer["data"]["id"] for buyer in buyers]
        response_ids = [item["id"] for item in response["data"]]
        
        for buyer_id in buyer_ids:
            assert buyer_id in response_ids
    
    @pytest.mark.asyncio
    async def test_list_buyers_pagination(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест пагинации списка покупателей."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем больше покупателей, чем помещается на одной странице
        buyers = []
        for i in range(25):  # Больше чем лимит по умолчанию (20)
            buyer = await test_data_factory.create_buyer()
            buyers.append(buyer)
        
        # Получаем первую страницу
        first_page = await api_client.get_buyers(limit=10, offset=0)
        assert len(first_page["data"]) == 10
        assert first_page["total"] >= 25
        
        # Получаем вторую страницу
        second_page = await api_client.get_buyers(limit=10, offset=10)
        assert len(second_page["data"]) == 10
        
        # Проверяем, что данные на страницах разные
        first_page_ids = [item["id"] for item in first_page["data"]]
        second_page_ids = [item["id"] for item in second_page["data"]]
        
        assert len(set(first_page_ids) & set(second_page_ids)) == 0  # Нет пересечений
    
    @pytest.mark.asyncio
    async def test_buyer_data_persistence(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест сохранности данных покупателя."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя с определенными данными
        original_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True
        }
        
        created_buyer = await api_client.create_buyer(original_data)
        buyer_id = created_buyer["data"]["id"]
        
        # Получаем покупателя несколько раз и проверяем консистентность
        for _ in range(3):
            retrieved_buyer = await api_client.get_buyer(buyer_id)
            
            assert retrieved_buyer["data"]["id"] == original_data["id"]
            assert retrieved_buyer["data"]["keycloak_uuid"] == original_data["keycloak_uuid"]
            assert retrieved_buyer["data"]["is_online"] == original_data["is_online"]
