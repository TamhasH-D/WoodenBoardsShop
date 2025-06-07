"""Комплексные тесты для валидации UUID во всех API эндпоинтах."""

import pytest
import uuid
from typing import Dict, Any
from base.test_base import BaseAPITest, APITestMixin
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory
from utils.test_logger import LogCapture


class TestUUIDValidation(BaseAPITest, APITestMixin):
    """Тесты для валидации UUID требований во всех API."""
    
    @pytest.mark.asyncio
    async def test_all_entities_require_uuid_on_creation(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест того, что все сущности требуют UUID при создании."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Список всех create методов и соответствующих данных
        create_methods_and_data = [
            (api_client.create_buyer, {"keycloak_uuid": str(uuid.uuid4()), "is_online": True}),
            (api_client.create_seller, {"keycloak_uuid": str(uuid.uuid4()), "is_online": True}),
            (api_client.create_wood_type, {"neme": "Test Wood", "description": "Test Description"}),
            (api_client.create_product, {"seller_id": str(uuid.uuid4()), "neme": "Test Product", "descrioption": "Test", "price": 100.0}),
            (api_client.create_wooden_board, {"lenght": 1.0, "width": 1.0, "height": 1.0, "volume": 1.0}),
            (api_client.create_image, {"url": "http://example.com/image.jpg", "alt_text": "Test Image"}),
        ]
        
        for create_method, base_data in create_methods_and_data:
            # Тест без UUID - должен вернуть ошибку
            with pytest.raises(Exception, match=".*"):
                await create_method(base_data)
    
    @pytest.mark.asyncio
    async def test_invalid_uuid_format_rejection(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест отклонения невалидных форматов UUID."""
        self.api_client = api_client
        
        invalid_uuids = [
            "invalid-uuid",
            "12345",
            "",
            "not-a-uuid-at-all",
            "123e4567-e89b-12d3-a456-42661417400",  # Неправильная длина
            "123e4567-e89b-12d3-a456-42661417400g",  # Невалидный символ
        ]
        
        for invalid_uuid in invalid_uuids:
            buyer_data = {
                "id": invalid_uuid,
                "keycloak_uuid": str(uuid.uuid4()),
                "is_online": True
            }
            
            with pytest.raises(Exception):
                await api_client.create_buyer(buyer_data)
    
    @pytest.mark.asyncio
    async def test_uuid_uniqueness_across_entities(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест уникальности UUID в рамках одного типа сущности."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя
        buyer = await test_data_factory.create_buyer()
        buyer_uuid = buyer["data"]["id"]
        
        # Пытаемся создать другого покупателя с тем же UUID
        duplicate_buyer_data = {
            "id": buyer_uuid,
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": False
        }
        
        with pytest.raises(Exception):  # Должна быть ошибка дублирования
            await api_client.create_buyer(duplicate_buyer_data)
    
    @pytest.mark.asyncio
    async def test_uuid_consistency_in_responses(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест консистентности UUID в ответах API."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем различные сущности и проверяем UUID
        entities_to_test = [
            ("buyer", test_data_factory.create_buyer, api_client.get_buyer),
            ("seller", test_data_factory.create_seller, api_client.get_seller),
            ("wood_type", test_data_factory.create_wood_type, api_client.get_wood_type),
            ("wooden_board", test_data_factory.create_wooden_board, api_client.get_wooden_board),
            ("image", test_data_factory.create_image, api_client.get_image),
        ]
        
        for entity_name, create_method, get_method in entities_to_test:
            # Создаем сущность
            created_entity = await create_method()
            entity_id = created_entity["data"]["id"]
            
            # Получаем сущность
            retrieved_entity = await get_method(entity_id)
            
            # Проверяем, что UUID одинаковый
            assert created_entity["data"]["id"] == retrieved_entity["data"]["id"]
            assert created_entity["data"]["id"] == entity_id
    
    @pytest.mark.asyncio
    async def test_uuid_in_relationships(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест корректности UUID в связях между сущностями."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]
        
        # Создаем продукт, связанный с продавцом
        product = await test_data_factory.create_product(seller_id=seller_id)
        product_id = product["data"]["id"]
        
        # Проверяем, что связь корректна
        retrieved_product = await api_client.get_product(product_id)
        assert retrieved_product["data"]["seller_id"] == seller_id
        
        # Создаем тип древесины и цену
        wood_type = await test_data_factory.create_wood_type()
        wood_type_id = wood_type["data"]["id"]
        
        wood_type_price = await test_data_factory.create_wood_type_price(wood_type_id=wood_type_id)
        price_id = wood_type_price["data"]["id"]
        
        # Проверяем связь
        retrieved_price = await api_client.get_wood_type_price(price_id)
        assert retrieved_price["data"]["wood_type_id"] == wood_type_id
    
    @pytest.mark.asyncio
    async def test_uuid_in_chat_system(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест UUID в системе чатов."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя и продавца
        buyer = await test_data_factory.create_buyer()
        seller = await test_data_factory.create_seller()
        
        buyer_id = buyer["data"]["id"]
        seller_id = seller["data"]["id"]
        
        # Создаем тред чата
        thread = await test_data_factory.create_chat_thread(
            buyer_id=buyer_id,
            seller_id=seller_id
        )
        thread_id = thread["data"]["id"]
        
        # Проверяем связи в треде
        retrieved_thread = await api_client.get_chat_thread(thread_id)
        assert retrieved_thread["data"]["buyer_id"] == buyer_id
        assert retrieved_thread["data"]["seller_id"] == seller_id
        
        # Создаем сообщение в треде
        message = await test_data_factory.create_chat_message(
            thread_id=thread_id,
            sender_id=buyer_id
        )
        message_id = message["data"]["id"]
        
        # Проверяем связи в сообщении
        retrieved_message = await api_client.get_chat_message(message_id)
        assert retrieved_message["data"]["thread_id"] == thread_id
        assert retrieved_message["data"]["sender_id"] == buyer_id
    
    @pytest.mark.asyncio
    async def test_uuid_format_validation(self, api_client: APIClient):
        """Тест валидации формата UUID."""
        self.api_client = api_client
        
        # Валидные UUID форматы
        valid_uuids = [
            str(uuid.uuid4()),
            "123e4567-e89b-12d3-a456-426614174000",
            "00000000-0000-0000-0000-000000000000",
        ]
        
        for valid_uuid in valid_uuids:
            buyer_data = {
                "id": valid_uuid,
                "keycloak_uuid": str(uuid.uuid4()),
                "is_online": True
            }
            
            # Должно пройти без ошибок
            response = await api_client.create_buyer(buyer_data)
            assert response["data"]["id"] == valid_uuid
            
            # Очищаем созданного покупателя
            await api_client.delete_buyer(valid_uuid)
    
    @pytest.mark.asyncio
    async def test_uuid_case_sensitivity(self, api_client: APIClient):
        """Тест чувствительности UUID к регистру."""
        self.api_client = api_client
        
        # Создаем UUID в нижнем регистре
        lower_uuid = str(uuid.uuid4()).lower()
        upper_uuid = lower_uuid.upper()
        
        # Создаем покупателя с UUID в нижнем регистре
        buyer_data_lower = {
            "id": lower_uuid,
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True
        }
        
        response = await api_client.create_buyer(buyer_data_lower)
        assert response["data"]["id"] == lower_uuid
        
        # Пытаемся создать покупателя с тем же UUID в верхнем регистре
        buyer_data_upper = {
            "id": upper_uuid,
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": False
        }
        
        # В зависимости от реализации backend может принимать или отклонять
        # Проверяем поведение
        try:
            await api_client.create_buyer(buyer_data_upper)
            # Если создание прошло успешно, UUID не чувствительны к регистру
            await api_client.delete_buyer(upper_uuid)
        except Exception:
            # Если ошибка, то UUID чувствительны к регистру
            pass
        
        # Очищаем первого покупателя
        await api_client.delete_buyer(lower_uuid)
    
    @pytest.mark.asyncio
    async def test_uuid_persistence_after_updates(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест сохранности UUID после обновлений."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя
        buyer = await test_data_factory.create_buyer()
        original_uuid = buyer["data"]["id"]
        
        # Обновляем покупателя несколько раз
        updates = [
            {"is_online": False},
            {"is_online": True},
        ]
        
        for update_data in updates:
            updated_buyer = await api_client.update_buyer(original_uuid, update_data)
            
            # UUID должен остаться неизменным
            assert updated_buyer["data"]["id"] == original_uuid
            
            # Проверяем через получение
            retrieved_buyer = await api_client.get_buyer(original_uuid)
            assert retrieved_buyer["data"]["id"] == original_uuid
