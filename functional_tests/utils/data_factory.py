"""Фабрика для создания тестовых данных с поддержкой UUID генерации."""

import uuid
from typing import Dict, Any, List, Optional, Set
from faker import Faker
from utils.api_client import APIClient

fake = Faker('ru_RU')


class UUIDManager:
    """Менеджер для управления уникальностью UUID в рамках тестового запуска."""

    def __init__(self):
        self._used_uuids: Set[str] = set()

    def generate_unique_uuid(self) -> str:
        """Генерация уникального UUID в рамках тестового запуска."""
        while True:
            new_uuid = str(uuid.uuid4())
            if new_uuid not in self._used_uuids:
                self._used_uuids.add(new_uuid)
                return new_uuid

    def clear(self):
        """Очистка списка использованных UUID."""
        self._used_uuids.clear()


class TestDataFactory:
    """Фабрика для создания тестовых данных через API с автоматической генерацией UUID."""

    def __init__(self, api_client: APIClient):
        self.api_client = api_client
        self.uuid_manager = UUIDManager()
        self.created_entities = {
            'buyers': [],
            'sellers': [],
            'products': [],
            'wood_types': [],
            'wood_type_prices': [],
            'wooden_boards': [],
            'images': [],
            'chat_threads': [],
            'chat_messages': []
        }

    def generate_uuid(self) -> str:
        """Генерация уникального UUID для тестовых данных."""
        return self.uuid_manager.generate_unique_uuid()
    
    async def create_buyer(self, **kwargs) -> Dict[str, Any]:
        """Создание тестового покупателя.

        Args:
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания покупателя

        Note:
            Backend ожидает, что frontend передает UUID в поле 'id'.
            Также генерируется keycloak_uuid для имитации аутентификации.
        """
        buyer_data = {
            "id": self.generate_uuid(),
            "keycloak_uuid": self.generate_uuid(),
            "is_online": fake.boolean(),
            **kwargs
        }

        result = await self.api_client.create_buyer(buyer_data)
        self.created_entities['buyers'].append(result['data']['id'])
        return result
    
    async def create_seller(self, **kwargs) -> Dict[str, Any]:
        """Создание тестового продавца.

        Args:
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания продавца

        Note:
            Backend ожидает, что frontend передает UUID в поле 'id'.
            Также генерируется keycloak_uuid для имитации аутентификации.
        """
        seller_data = {
            "id": self.generate_uuid(),
            "keycloak_uuid": self.generate_uuid(),
            "is_online": fake.boolean(),
            **kwargs
        }

        result = await self.api_client.create_seller(seller_data)
        self.created_entities['sellers'].append(result['data']['id'])
        return result
    
    async def create_wood_type(self, **kwargs) -> Dict[str, Any]:
        """Создание тестового типа древесины.

        Args:
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания типа древесины

        Note:
            Backend ожидает UUID в поле 'id'.
            Используется 'neme' вместо 'name' для совместимости с backend API.
        """
        wood_type_data = {
            "id": self.generate_uuid(),
            "neme": fake.word(),  # Используем typo как в оригинальном API
            "description": fake.text(max_nb_chars=200),
            **kwargs
        }

        result = await self.api_client.create_wood_type(wood_type_data)
        self.created_entities['wood_types'].append(result['data']['id'])
        return result
    
    async def create_wood_type_price(self, wood_type_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Создание тестовой цены на тип древесины.

        Args:
            wood_type_id: ID типа древесины. Если не указан, создается новый тип
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания цены

        Note:
            Backend ожидает UUID в поле 'id' и валидный wood_type_id.
        """
        if wood_type_id is None:
            wood_type = await self.create_wood_type()
            wood_type_id = wood_type['data']['id']

        price_data = {
            "id": self.generate_uuid(),
            "wood_type_id": wood_type_id,
            "price_per_cubic_meter": fake.pydecimal(left_digits=4, right_digits=2, positive=True),
            "effective_from": fake.date_time().isoformat(),
            **kwargs
        }

        result = await self.api_client.create_wood_type_price(price_data)
        self.created_entities['wood_type_prices'].append(result['data']['id'])
        return result
    
    async def create_wooden_board(self, **kwargs) -> Dict[str, Any]:
        """Создание тестовой деревянной доски.

        Args:
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания доски

        Note:
            Backend ожидает UUID в поле 'id'.
            Используется 'lenght' вместо 'length' для совместимости с backend API.
        """
        board_data = {
            "id": self.generate_uuid(),
            "lenght": fake.pydecimal(left_digits=2, right_digits=2, positive=True),  # Используем typo как в API
            "width": fake.pydecimal(left_digits=2, right_digits=2, positive=True),
            "height": fake.pydecimal(left_digits=2, right_digits=2, positive=True),
            "volume": fake.pydecimal(left_digits=3, right_digits=4, positive=True),
            **kwargs
        }

        result = await self.api_client.create_wooden_board(board_data)
        self.created_entities['wooden_boards'].append(result['data']['id'])
        return result
    
    async def create_image(self, **kwargs) -> Dict[str, Any]:
        """Создание тестового изображения.

        Args:
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания изображения

        Note:
            Backend ожидает UUID в поле 'id'.
        """
        image_data = {
            "id": self.generate_uuid(),
            "url": fake.image_url(),
            "alt_text": fake.sentence(),
            **kwargs
        }

        result = await self.api_client.create_image(image_data)
        self.created_entities['images'].append(result['data']['id'])
        return result
    
    async def create_product(self, seller_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Создание тестового продукта.

        Args:
            seller_id: ID продавца. Если не указан, создается новый продавец
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания продукта

        Note:
            Backend ожидает UUID в поле 'id' и валидный seller_id.
            Используются typo 'neme' и 'descrioption' для совместимости с backend API.
        """
        if seller_id is None:
            seller = await self.create_seller()
            seller_id = seller['data']['id']

        product_data = {
            "id": self.generate_uuid(),
            "seller_id": seller_id,
            "neme": fake.word(),  # Используем typo как в API
            "descrioption": fake.text(max_nb_chars=500),  # Используем typo как в API
            "price": fake.pydecimal(left_digits=4, right_digits=2, positive=True),
            **kwargs
        }

        result = await self.api_client.create_product(product_data)
        self.created_entities['products'].append(result['data']['id'])
        return result
    
    async def create_chat_thread(self, buyer_id: Optional[str] = None, seller_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Создание тестового треда чата.

        Args:
            buyer_id: ID покупателя. Если не указан, создается новый покупатель
            seller_id: ID продавца. Если не указан, создается новый продавец
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания треда чата

        Note:
            Backend ожидает UUID в поле 'id' и валидные buyer_id, seller_id.
        """
        if buyer_id is None:
            buyer = await self.create_buyer()
            buyer_id = buyer['data']['id']

        if seller_id is None:
            seller = await self.create_seller()
            seller_id = seller['data']['id']

        thread_data = {
            "id": self.generate_uuid(),
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "subject": fake.sentence(),
            **kwargs
        }

        result = await self.api_client.create_chat_thread(thread_data)
        self.created_entities['chat_threads'].append(result['data']['id'])
        return result
    
    async def create_chat_message(self, thread_id: Optional[str] = None, sender_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Создание тестового сообщения чата.

        Args:
            thread_id: ID треда чата. Если не указан, создается новый тред
            sender_id: ID отправителя. Если не указан, создается новый покупатель
            **kwargs: Дополнительные поля для переопределения значений по умолчанию

        Returns:
            Dict с результатом создания сообщения

        Note:
            Backend ожидает UUID в поле 'id' и валидные thread_id, sender_id.
        """
        if thread_id is None:
            thread = await self.create_chat_thread()
            thread_id = thread['data']['id']

        if sender_id is None:
            buyer = await self.create_buyer()
            sender_id = buyer['data']['id']

        message_data = {
            "id": self.generate_uuid(),
            "thread_id": thread_id,
            "sender_id": sender_id,
            "content": fake.text(max_nb_chars=1000),
            "timestamp": fake.date_time().isoformat(),
            **kwargs
        }

        result = await self.api_client.create_chat_message(message_data)
        self.created_entities['chat_messages'].append(result['data']['id'])
        return result
    
    async def create_complete_product_set(self) -> Dict[str, Any]:
        """Создание полного набора связанных данных для продукта."""
        # Создаем продавца
        seller = await self.create_seller()
        
        # Создаем тип древесины и цену
        wood_type = await self.create_wood_type()
        wood_type_price = await self.create_wood_type_price(wood_type['data']['id'])
        
        # Создаем деревянную доску
        wooden_board = await self.create_wooden_board()
        
        # Создаем изображение
        image = await self.create_image()
        
        # Создаем продукт
        product = await self.create_product(seller['data']['id'])
        
        return {
            'seller': seller,
            'wood_type': wood_type,
            'wood_type_price': wood_type_price,
            'wooden_board': wooden_board,
            'image': image,
            'product': product
        }
    
    async def create_chat_scenario(self) -> Dict[str, Any]:
        """Создание сценария чата между покупателем и продавцом."""
        buyer = await self.create_buyer()
        seller = await self.create_seller()
        
        thread = await self.create_chat_thread(
            buyer_id=buyer['data']['id'],
            seller_id=seller['data']['id']
        )
        
        # Создаем несколько сообщений
        messages = []
        for i in range(3):
            sender_id = buyer['data']['id'] if i % 2 == 0 else seller['data']['id']
            message = await self.create_chat_message(
                thread_id=thread['data']['id'],
                sender_id=sender_id
            )
            messages.append(message)
        
        return {
            'buyer': buyer,
            'seller': seller,
            'thread': thread,
            'messages': messages
        }
    
    def create_invalid_uuid_data(self, entity_type: str, **kwargs) -> Dict[str, Any]:
        """Создание данных с невалидным UUID для негативных тестов.

        Args:
            entity_type: Тип сущности ('buyer', 'seller', 'product', и т.д.)
            **kwargs: Дополнительные поля

        Returns:
            Dict с данными содержащими невалидный UUID
        """
        base_data = {
            "buyer": {"keycloak_uuid": self.generate_uuid(), "is_online": True},
            "seller": {"keycloak_uuid": self.generate_uuid(), "is_online": True},
            "wood_type": {"neme": fake.word(), "description": fake.text()},
            "product": {"neme": fake.word(), "descrioption": fake.text(), "price": 100.0},
            "wooden_board": {"lenght": 1.0, "width": 1.0, "height": 1.0, "volume": 1.0},
            "image": {"url": fake.image_url(), "alt_text": fake.sentence()},
        }

        data = base_data.get(entity_type, {})
        data.update(kwargs)

        # Добавляем невалидный UUID
        data["id"] = "invalid-uuid-format"

        return data

    def create_duplicate_uuid_data(self, existing_uuid: str, entity_type: str, **kwargs) -> Dict[str, Any]:
        """Создание данных с дублирующимся UUID для негативных тестов.

        Args:
            existing_uuid: Существующий UUID для дублирования
            entity_type: Тип сущности
            **kwargs: Дополнительные поля

        Returns:
            Dict с данными содержащими дублирующийся UUID
        """
        data = self.create_invalid_uuid_data(entity_type, **kwargs)
        data["id"] = existing_uuid  # Используем существующий UUID
        return data

    async def cleanup(self):
        """Очистка всех созданных тестовых данных."""
        # Удаляем в обратном порядке зависимостей
        for message_id in self.created_entities['chat_messages']:
            try:
                await self.api_client.delete_chat_message(message_id)
            except Exception:
                pass  # Игнорируем ошибки при очистке
        
        for thread_id in self.created_entities['chat_threads']:
            try:
                await self.api_client.delete_chat_thread(thread_id)
            except Exception:
                pass
        
        for product_id in self.created_entities['products']:
            try:
                await self.api_client.delete_product(product_id)
            except Exception:
                pass
        
        for image_id in self.created_entities['images']:
            try:
                await self.api_client.delete_image(image_id)
            except Exception:
                pass
        
        for board_id in self.created_entities['wooden_boards']:
            try:
                await self.api_client.delete_wooden_board(board_id)
            except Exception:
                pass
        
        for price_id in self.created_entities['wood_type_prices']:
            try:
                await self.api_client.delete_wood_type_price(price_id)
            except Exception:
                pass
        
        for wood_type_id in self.created_entities['wood_types']:
            try:
                await self.api_client.delete_wood_type(wood_type_id)
            except Exception:
                pass
        
        for seller_id in self.created_entities['sellers']:
            try:
                await self.api_client.delete_seller(seller_id)
            except Exception:
                pass
        
        for buyer_id in self.created_entities['buyers']:
            try:
                await self.api_client.delete_buyer(buyer_id)
            except Exception:
                pass
        
        # Очищаем списки
        for entity_list in self.created_entities.values():
            entity_list.clear()

        # Очищаем UUID менеджер
        self.uuid_manager.clear()

    async def create_complete_product_set(self) -> Dict[str, Any]:
        """Создание полного набора связанных данных для интеграционных тестов.

        Returns:
            Dict с созданными сущностями и их связями
        """
        # Создаем продавца
        seller = await self.create_seller()

        # Создаем тип древесины
        wood_type = await self.create_wood_type(
            neme="Дуб",
            description="Высококачественная дубовая древесина"
        )

        # Создаем цену на древесину
        wood_type_price = await self.create_wood_type_price(
            wood_type_id=wood_type["data"]["id"],
            price_per_cubic_meter=5000.0
        )

        # Создаем деревянную доску
        wooden_board = await self.create_wooden_board(
            lenght=2.0,
            width=0.2,
            height=0.05,
            volume=0.02
        )

        # Создаем изображение
        image = await self.create_image(
            url="https://example.com/oak_board.jpg",
            alt_text="Дубовая доска премиум качества"
        )

        # Создаем продукт
        product = await self.create_product(
            seller_id=seller["data"]["id"],
            neme="Дубовая доска премиум",
            descrioption="Высококачественная дубовая доска для строительства",
            price=150.0
        )

        return {
            "seller": seller,
            "wood_type": wood_type,
            "wood_type_price": wood_type_price,
            "wooden_board": wooden_board,
            "image": image,
            "product": product
        }
