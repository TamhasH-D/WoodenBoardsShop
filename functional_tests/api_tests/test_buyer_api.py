"""Функциональные тесты для Buyer API с поддержкой UUID генерации."""

import pytest
import uuid
from typing import Dict, Any
from base.test_base import BaseAPITest, APITestMixin
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory
from utils.test_logger import LogCapture


class TestBuyerAPI(BaseAPITest, APITestMixin):
    """Тесты для API покупателей."""
    
    @pytest.mark.asyncio
    async def test_create_buyer_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного создания покупателя с корректным UUID."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory

        # Используем фабрику для генерации уникальных UUID
        buyer_data = {
            "id": test_data_factory.generate_uuid(),
            "keycloak_uuid": test_data_factory.generate_uuid(),
            "is_online": True
        }

        response = await self.test_create_entity(
            api_client.create_buyer,
            buyer_data
        )

        # Проверяем, что backend вернул тот же UUID, который мы передали
        assert response["data"]["id"] == buyer_data["id"]
        assert response["data"]["keycloak_uuid"] == buyer_data["keycloak_uuid"]
        assert response["data"]["is_online"] == buyer_data["is_online"]
    
    @pytest.mark.asyncio
    async def test_create_buyer_missing_uuid(self, api_client: APIClient):
        """Тест создания покупателя без UUID - должен вернуть ошибку."""
        self.api_client = api_client

        # Тест без обязательного поля id (UUID)
        invalid_data = {
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True
        }

        with pytest.raises(Exception):  # Ожидаем ошибку валидации
            await api_client.create_buyer(invalid_data)

    @pytest.mark.asyncio
    async def test_create_buyer_invalid_uuid_format(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест создания покупателя с невалидным форматом UUID."""
        self.api_client = api_client

        # Используем фабрику для создания данных с невалидным UUID
        invalid_data = test_data_factory.create_invalid_uuid_data("buyer")

        with pytest.raises(Exception):  # Ожидаем ошибку валидации UUID
            await api_client.create_buyer(invalid_data)

    @pytest.mark.asyncio
    async def test_create_buyer_duplicate_uuid(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест создания покупателя с дублирующимся UUID."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory

        # Создаем первого покупателя
        first_buyer = await test_data_factory.create_buyer()
        first_buyer_id = first_buyer["data"]["id"]

        # Пытаемся создать второго покупателя с тем же UUID
        duplicate_data = test_data_factory.create_duplicate_uuid_data(
            first_buyer_id,
            "buyer"
        )

        with pytest.raises(Exception):  # Ожидаем ошибку дублирования UUID
            await api_client.create_buyer(duplicate_data)
    
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
    async def test_buyer_uuid_consistency(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест консистентности UUID покупателя через все операции."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory

        # Создаем покупателя с определенными UUID
        original_uuid = test_data_factory.generate_uuid()
        keycloak_uuid = test_data_factory.generate_uuid()

        original_data = {
            "id": original_uuid,
            "keycloak_uuid": keycloak_uuid,
            "is_online": True
        }

        # Создаем покупателя
        created_buyer = await api_client.create_buyer(original_data)

        # Проверяем, что UUID сохранился при создании
        assert created_buyer["data"]["id"] == original_uuid
        assert created_buyer["data"]["keycloak_uuid"] == keycloak_uuid

        # Получаем покупателя и проверяем UUID
        retrieved_buyer = await api_client.get_buyer(original_uuid)
        assert retrieved_buyer["data"]["id"] == original_uuid
        assert retrieved_buyer["data"]["keycloak_uuid"] == keycloak_uuid

        # Обновляем покупателя и проверяем, что UUID не изменился
        update_data = {"is_online": False}
        updated_buyer = await api_client.update_buyer(original_uuid, update_data)
        assert updated_buyer["data"]["id"] == original_uuid
        assert updated_buyer["data"]["keycloak_uuid"] == keycloak_uuid
        assert updated_buyer["data"]["is_online"] == False

        # Финальная проверка через получение
        final_buyer = await api_client.get_buyer(original_uuid)
        assert final_buyer["data"]["id"] == original_uuid
        assert final_buyer["data"]["keycloak_uuid"] == keycloak_uuid

    @pytest.mark.asyncio
    async def test_buyer_uuid_in_list(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест корректности UUID в списке покупателей."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory

        # Создаем покупателей с известными UUID
        created_buyers = []
        for i in range(3):
            buyer = await test_data_factory.create_buyer()
            created_buyers.append(buyer["data"])

        # Получаем список покупателей
        buyers_list = await api_client.get_buyers()

        # Проверяем, что все созданные покупатели есть в списке с правильными UUID
        list_buyer_ids = [buyer["id"] for buyer in buyers_list["data"]]

        for created_buyer in created_buyers:
            assert created_buyer["id"] in list_buyer_ids

            # Находим покупателя в списке и проверяем все поля
            list_buyer = next(
                buyer for buyer in buyers_list["data"]
                if buyer["id"] == created_buyer["id"]
            )
            assert list_buyer["keycloak_uuid"] == created_buyer["keycloak_uuid"]
            assert list_buyer["is_online"] == created_buyer["is_online"]
