"""Интеграционные тесты для UUID функциональности в end-to-end сценариях."""

import pytest
import uuid
from typing import Dict, Any, List
from base.test_base import BaseAPITest, APITestMixin
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory
from utils.test_logger import LogCapture


class TestUUIDIntegration(BaseAPITest, APITestMixin):
    """Интеграционные тесты для UUID в комплексных сценариях."""
    
    @pytest.mark.asyncio
    async def test_complete_marketplace_scenario_with_uuid_tracking(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест полного сценария маркетплейса с отслеживанием UUID."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем покупателя и продавца с отслеживанием UUID
        buyer = await test_data_factory.create_buyer()
        seller = await test_data_factory.create_seller()
        
        buyer_uuid = buyer["data"]["id"]
        seller_uuid = seller["data"]["id"]
        
        # Создаем тип древесины и цену
        wood_type = await test_data_factory.create_wood_type(neme="Дуб")
        wood_type_uuid = wood_type["data"]["id"]
        
        wood_price = await test_data_factory.create_wood_type_price(
            wood_type_id=wood_type_uuid,
            price_per_cubic_meter=5000.0
        )
        price_uuid = wood_price["data"]["id"]
        
        # Создаем деревянную доску
        wooden_board = await test_data_factory.create_wooden_board(
            lenght=2.0,
            width=0.2,
            height=0.05,
            volume=0.02
        )
        board_uuid = wooden_board["data"]["id"]
        
        # Создаем изображение для продукта
        image = await test_data_factory.create_image(
            url="https://example.com/board.jpg",
            alt_text="Дубовая доска"
        )
        image_uuid = image["data"]["id"]
        
        # Создаем продукт
        product = await test_data_factory.create_product(
            seller_id=seller_uuid,
            neme="Дубовая доска премиум",
            descrioption="Высококачественная дубовая доска",
            price=150.0
        )
        product_uuid = product["data"]["id"]
        
        # Создаем чат между покупателем и продавцом
        chat_thread = await test_data_factory.create_chat_thread(
            buyer_id=buyer_uuid,
            seller_id=seller_uuid,
            subject="Вопрос о дубовой доске"
        )
        thread_uuid = chat_thread["data"]["id"]
        
        # Создаем сообщения в чате
        buyer_message = await test_data_factory.create_chat_message(
            thread_id=thread_uuid,
            sender_id=buyer_uuid,
            content="Здравствуйте! Интересует ваша дубовая доска."
        )
        buyer_message_uuid = buyer_message["data"]["id"]
        
        seller_message = await test_data_factory.create_chat_message(
            thread_id=thread_uuid,
            sender_id=seller_uuid,
            content="Добро пожаловать! Готов ответить на ваши вопросы."
        )
        seller_message_uuid = seller_message["data"]["id"]
        
        # Проверяем все UUID через получение данных
        entities_to_verify = [
            (api_client.get_buyer, buyer_uuid),
            (api_client.get_seller, seller_uuid),
            (api_client.get_wood_type, wood_type_uuid),
            (api_client.get_wood_type_price, price_uuid),
            (api_client.get_wooden_board, board_uuid),
            (api_client.get_image, image_uuid),
            (api_client.get_product, product_uuid),
            (api_client.get_chat_thread, thread_uuid),
            (api_client.get_chat_message, buyer_message_uuid),
            (api_client.get_chat_message, seller_message_uuid),
        ]
        
        for get_method, entity_uuid in entities_to_verify:
            retrieved_entity = await get_method(entity_uuid)
            assert retrieved_entity["data"]["id"] == entity_uuid
        
        # Проверяем связи между сущностями
        retrieved_product = await api_client.get_product(product_uuid)
        assert retrieved_product["data"]["seller_id"] == seller_uuid
        
        retrieved_price = await api_client.get_wood_type_price(price_uuid)
        assert retrieved_price["data"]["wood_type_id"] == wood_type_uuid
        
        retrieved_thread = await api_client.get_chat_thread(thread_uuid)
        assert retrieved_thread["data"]["buyer_id"] == buyer_uuid
        assert retrieved_thread["data"]["seller_id"] == seller_uuid
        
        retrieved_buyer_message = await api_client.get_chat_message(buyer_message_uuid)
        assert retrieved_buyer_message["data"]["thread_id"] == thread_uuid
        assert retrieved_buyer_message["data"]["sender_id"] == buyer_uuid
        
        retrieved_seller_message = await api_client.get_chat_message(seller_message_uuid)
        assert retrieved_seller_message["data"]["thread_id"] == thread_uuid
        assert retrieved_seller_message["data"]["sender_id"] == seller_uuid
    
    @pytest.mark.asyncio
    async def test_uuid_consistency_across_operations(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест консистентности UUID при различных операциях."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_uuid = seller["data"]["id"]
        
        # Создаем продукт
        product = await test_data_factory.create_product(seller_id=seller_uuid)
        product_uuid = product["data"]["id"]
        
        # Выполняем различные операции и проверяем UUID
        operations = [
            # Обновление продукта
            lambda: api_client.update_product(product_uuid, {"price": 200.0}),
            # Обновление продавца
            lambda: api_client.update_seller(seller_uuid, {"is_online": False}),
            # Получение продукта
            lambda: api_client.get_product(product_uuid),
            # Получение продавца
            lambda: api_client.get_seller(seller_uuid),
        ]
        
        for operation in operations:
            result = await operation()
            
            # UUID должен остаться неизменным
            if "data" in result:
                entity_id = result["data"]["id"]
                assert entity_id in [product_uuid, seller_uuid]
    
    @pytest.mark.asyncio
    async def test_uuid_uniqueness_across_entity_types(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест уникальности UUID между разными типами сущностей."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем различные сущности
        entities = []
        
        # Создаем по одной сущности каждого типа
        buyer = await test_data_factory.create_buyer()
        entities.append(("buyer", buyer["data"]["id"]))
        
        seller = await test_data_factory.create_seller()
        entities.append(("seller", seller["data"]["id"]))
        
        wood_type = await test_data_factory.create_wood_type()
        entities.append(("wood_type", wood_type["data"]["id"]))
        
        wooden_board = await test_data_factory.create_wooden_board()
        entities.append(("wooden_board", wooden_board["data"]["id"]))
        
        image = await test_data_factory.create_image()
        entities.append(("image", image["data"]["id"]))
        
        product = await test_data_factory.create_product(seller_id=seller["data"]["id"])
        entities.append(("product", product["data"]["id"]))
        
        # Проверяем, что все UUID уникальны
        all_uuids = [entity[1] for entity in entities]
        unique_uuids = set(all_uuids)
        
        assert len(all_uuids) == len(unique_uuids), "Найдены дублирующиеся UUID между разными типами сущностей"
        
        # Проверяем, что каждый UUID валиден
        for entity_type, entity_uuid in entities:
            # Проверяем формат UUID
            uuid.UUID(entity_uuid)  # Должно пройти без ошибок
    
    @pytest.mark.asyncio
    async def test_uuid_in_bulk_operations(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест UUID при массовых операциях."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем много сущностей одного типа
        buyers_count = 10
        created_buyers = []
        
        for i in range(buyers_count):
            buyer = await test_data_factory.create_buyer()
            created_buyers.append(buyer["data"])
        
        # Проверяем уникальность UUID
        buyer_uuids = [buyer["id"] for buyer in created_buyers]
        unique_uuids = set(buyer_uuids)
        
        assert len(buyer_uuids) == len(unique_uuids), "Найдены дублирующиеся UUID при массовом создании"
        
        # Получаем список всех покупателей
        buyers_list = await api_client.get_buyers(limit=50)
        list_buyer_uuids = [buyer["id"] for buyer in buyers_list["data"]]
        
        # Проверяем, что все созданные покупатели есть в списке
        for buyer_uuid in buyer_uuids:
            assert buyer_uuid in list_buyer_uuids
        
        # Проверяем каждого покупателя индивидуально
        for buyer_uuid in buyer_uuids:
            retrieved_buyer = await api_client.get_buyer(buyer_uuid)
            assert retrieved_buyer["data"]["id"] == buyer_uuid
    
    @pytest.mark.asyncio
    async def test_uuid_cascade_operations(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест UUID при каскадных операциях (удаление связанных сущностей)."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем связанные сущности
        seller = await test_data_factory.create_seller()
        seller_uuid = seller["data"]["id"]
        
        # Создаем несколько продуктов для продавца
        products = []
        for i in range(3):
            product = await test_data_factory.create_product(seller_id=seller_uuid)
            products.append(product["data"])
        
        product_uuids = [product["id"] for product in products]
        
        # Проверяем, что все продукты связаны с продавцом
        for product_uuid in product_uuids:
            retrieved_product = await api_client.get_product(product_uuid)
            assert retrieved_product["data"]["seller_id"] == seller_uuid
        
        # Удаляем продукты по одному
        for product_uuid in product_uuids:
            await api_client.delete_product(product_uuid)
            
            # Проверяем, что продукт удален
            with pytest.raises(Exception):
                await api_client.get_product(product_uuid)
        
        # Проверяем, что продавец все еще существует
        retrieved_seller = await api_client.get_seller(seller_uuid)
        assert retrieved_seller["data"]["id"] == seller_uuid
        
        # Удаляем продавца
        await api_client.delete_seller(seller_uuid)
        
        # Проверяем, что продавец удален
        with pytest.raises(Exception):
            await api_client.get_seller(seller_uuid)
    
    @pytest.mark.asyncio
    async def test_uuid_data_integrity_after_system_restart_simulation(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест целостности UUID после имитации перезапуска системы."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем набор связанных данных
        complete_set = await test_data_factory.create_complete_product_set()
        
        # Извлекаем UUID всех созданных сущностей
        seller_uuid = complete_set["seller"]["data"]["id"]
        wood_type_uuid = complete_set["wood_type"]["data"]["id"]
        price_uuid = complete_set["wood_type_price"]["data"]["id"]
        board_uuid = complete_set["wooden_board"]["data"]["id"]
        image_uuid = complete_set["image"]["data"]["id"]
        product_uuid = complete_set["product"]["data"]["id"]
        
        # Имитируем "перезапуск" - повторно получаем все данные
        # В реальной системе это было бы после перезапуска сервера
        
        # Проверяем, что все UUID остались валидными и данные доступны
        entities_to_check = [
            (api_client.get_seller, seller_uuid),
            (api_client.get_wood_type, wood_type_uuid),
            (api_client.get_wood_type_price, price_uuid),
            (api_client.get_wooden_board, board_uuid),
            (api_client.get_image, image_uuid),
            (api_client.get_product, product_uuid),
        ]
        
        for get_method, entity_uuid in entities_to_check:
            # Получаем данные несколько раз для проверки консистентности
            for attempt in range(3):
                retrieved_entity = await get_method(entity_uuid)
                assert retrieved_entity["data"]["id"] == entity_uuid
        
        # Проверяем связи между сущностями
        retrieved_product = await api_client.get_product(product_uuid)
        assert retrieved_product["data"]["seller_id"] == seller_uuid
        
        retrieved_price = await api_client.get_wood_type_price(price_uuid)
        assert retrieved_price["data"]["wood_type_id"] == wood_type_uuid
