"""Функциональные тесты для Seller API."""

import pytest
import uuid
from typing import Dict, Any
from base.test_base import BaseAPITest, APITestMixin
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory


class TestSellerAPI(BaseAPITest, APITestMixin):
    """Тесты для API продавцов."""
    
    @pytest.mark.asyncio
    async def test_create_seller_success(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест успешного создания продавца."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        seller_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": False
        }
        
        response = await self.test_create_entity(
            api_client.create_seller,
            seller_data
        )
        
        # Дополнительные проверки для seller
        assert response["data"]["keycloak_uuid"] == seller_data["keycloak_uuid"]
        assert response["data"]["is_online"] == seller_data["is_online"]
    
    @pytest.mark.asyncio
    async def test_create_seller_duplicate_keycloak_uuid(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест создания продавца с дублирующимся keycloak_uuid."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем первого продавца
        keycloak_uuid = str(uuid.uuid4())
        first_seller = await test_data_factory.create_seller(keycloak_uuid=keycloak_uuid)
        
        # Пытаемся создать второго продавца с тем же keycloak_uuid
        duplicate_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": keycloak_uuid,
            "is_online": True
        }
        
        with pytest.raises(Exception):  # Ожидаем ошибку уникальности
            await api_client.create_seller(duplicate_data)
    
    @pytest.mark.asyncio
    async def test_get_seller_success(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест успешного получения продавца."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]
        
        # Получаем продавца
        response = await self.test_get_entity(
            api_client.get_seller,
            seller_id
        )
        
        assert response["data"]["id"] == seller_id
    
    @pytest.mark.asyncio
    async def test_update_seller_online_status(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест обновления статуса онлайн продавца."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца в офлайне
        seller = await test_data_factory.create_seller(is_online=False)
        seller_id = seller["data"]["id"]
        
        # Переводим в онлайн
        update_data = {"is_online": True}
        await self.test_update_entity(
            api_client.update_seller,
            seller_id,
            update_data
        )
        
        # Проверяем изменения
        updated_seller = await api_client.get_seller(seller_id)
        assert updated_seller["data"]["is_online"] == True
        
        # Переводим обратно в офлайн
        update_data = {"is_online": False}
        await api_client.update_seller(seller_id, update_data)
        
        # Проверяем изменения
        updated_seller = await api_client.get_seller(seller_id)
        assert updated_seller["data"]["is_online"] == False
    
    @pytest.mark.asyncio
    async def test_delete_seller_success(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест успешного удаления продавца."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]
        
        # Удаляем продавца
        await self.test_delete_entity(
            api_client.delete_seller,
            seller_id
        )
        
        # Проверяем, что продавец удален
        with pytest.raises(Exception):  # Ожидаем 404 ошибку
            await api_client.get_seller(seller_id)
    
    @pytest.mark.asyncio
    async def test_list_sellers_with_filtering(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест получения списка продавцов с фильтрацией."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавцов с разными статусами
        online_sellers = []
        offline_sellers = []
        
        for i in range(3):
            online_seller = await test_data_factory.create_seller(is_online=True)
            online_sellers.append(online_seller)
            
            offline_seller = await test_data_factory.create_seller(is_online=False)
            offline_sellers.append(offline_seller)
        
        # Получаем всех продавцов
        all_sellers = await api_client.get_sellers()
        
        await self.assert_list_response(all_sellers, min_count=6)
        
        # Проверяем, что все созданные продавцы есть в списке
        all_seller_ids = [seller["id"] for seller in all_sellers["data"]]
        
        for seller in online_sellers + offline_sellers:
            assert seller["data"]["id"] in all_seller_ids
    
    @pytest.mark.asyncio
    async def test_seller_business_workflow(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест бизнес-процесса работы с продавцом."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # 1. Создаем продавца
        seller = await test_data_factory.create_seller(is_online=False)
        seller_id = seller["data"]["id"]
        
        # 2. Продавец заходит в систему (становится онлайн)
        await api_client.update_seller(seller_id, {"is_online": True})
        
        # 3. Проверяем статус
        online_seller = await api_client.get_seller(seller_id)
        assert online_seller["data"]["is_online"] == True
        
        # 4. Создаем продукт для этого продавца
        product = await test_data_factory.create_product(seller_id=seller_id)
        
        # 5. Проверяем, что продукт создан
        created_product = await api_client.get_product(product["data"]["id"])
        assert created_product["data"]["seller_id"] == seller_id
        
        # 6. Продавец выходит из системы
        await api_client.update_seller(seller_id, {"is_online": False})
        
        # 7. Проверяем финальный статус
        offline_seller = await api_client.get_seller(seller_id)
        assert offline_seller["data"]["is_online"] == False
    
    @pytest.mark.asyncio
    async def test_seller_concurrent_updates(self, api_client: httpx.AsyncClient, test_data_factory: TestDataFactory):
        """Тест конкурентных обновлений продавца."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца
        seller = await test_data_factory.create_seller(is_online=False)
        seller_id = seller["data"]["id"]
        
        # Выполняем несколько обновлений подряд
        updates = [
            {"is_online": True},
            {"is_online": False},
            {"is_online": True},
        ]
        
        for update_data in updates:
            await api_client.update_seller(seller_id, update_data)
            
            # Проверяем, что изменения применились
            updated_seller = await api_client.get_seller(seller_id)
            assert updated_seller["data"]["is_online"] == update_data["is_online"]
    
    @pytest.mark.asyncio
    async def test_seller_data_validation(self, api_client: httpx.AsyncClient):
        """Тест валидации данных продавца."""
        self.api_client = api_client
        
        # Тест с невалидным UUID
        invalid_data_cases = [
            {"id": "invalid-uuid", "keycloak_uuid": str(uuid.uuid4()), "is_online": True},
            {"id": str(uuid.uuid4()), "keycloak_uuid": "invalid-uuid", "is_online": True},
            {"id": str(uuid.uuid4()), "keycloak_uuid": str(uuid.uuid4()), "is_online": "not-boolean"},
        ]
        
        for invalid_data in invalid_data_cases:
            with pytest.raises(Exception):  # Ожидаем ошибку валидации
                await api_client.create_seller(invalid_data)
