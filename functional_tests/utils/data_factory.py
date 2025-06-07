"""Фабрика для создания тестовых данных."""

import uuid
from typing import Dict, Any, List, Optional
from faker import Faker
from utils.api_client import APIClient

fake = Faker('ru_RU')


class TestDataFactory:
    """Фабрика для создания тестовых данных через API."""
    
    def __init__(self, api_client: APIClient):
        self.api_client = api_client
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
    
    async def create_buyer(self, **kwargs) -> Dict[str, Any]:
        """Создание тестового покупателя."""
        buyer_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": fake.boolean(),
            **kwargs
        }
        
        result = await self.api_client.create_buyer(buyer_data)
        self.created_entities['buyers'].append(result['data']['id'])
        return result
    
    async def create_seller(self, **kwargs) -> Dict[str, Any]:
        """Создание тестового продавца."""
        seller_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": fake.boolean(),
            **kwargs
        }
        
        result = await self.api_client.create_seller(seller_data)
        self.created_entities['sellers'].append(result['data']['id'])
        return result
    
    async def create_wood_type(self, **kwargs) -> Dict[str, Any]:
        """Создание тестового типа древесины."""
        wood_type_data = {
            "id": str(uuid.uuid4()),
            "neme": fake.word(),  # Используем typo как в оригинальном API
            "description": fake.text(max_nb_chars=200),
            **kwargs
        }
        
        result = await self.api_client.create_wood_type(wood_type_data)
        self.created_entities['wood_types'].append(result['data']['id'])
        return result
    
    async def create_wood_type_price(self, wood_type_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Создание тестовой цены на тип древесины."""
        if wood_type_id is None:
            wood_type = await self.create_wood_type()
            wood_type_id = wood_type['data']['id']
        
        price_data = {
            "id": str(uuid.uuid4()),
            "wood_type_id": wood_type_id,
            "price_per_cubic_meter": fake.pydecimal(left_digits=4, right_digits=2, positive=True),
            "effective_from": fake.date_time().isoformat(),
            **kwargs
        }
        
        result = await self.api_client.create_wood_type_price(price_data)
        self.created_entities['wood_type_prices'].append(result['data']['id'])
        return result
    
    async def create_wooden_board(self, **kwargs) -> Dict[str, Any]:
        """Создание тестовой деревянной доски."""
        board_data = {
            "id": str(uuid.uuid4()),
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
        """Создание тестового изображения."""
        image_data = {
            "id": str(uuid.uuid4()),
            "url": fake.image_url(),
            "alt_text": fake.sentence(),
            **kwargs
        }
        
        result = await self.api_client.create_image(image_data)
        self.created_entities['images'].append(result['data']['id'])
        return result
    
    async def create_product(self, seller_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Создание тестового продукта."""
        if seller_id is None:
            seller = await self.create_seller()
            seller_id = seller['data']['id']
        
        product_data = {
            "id": str(uuid.uuid4()),
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
        """Создание тестового треда чата."""
        if buyer_id is None:
            buyer = await self.create_buyer()
            buyer_id = buyer['data']['id']
        
        if seller_id is None:
            seller = await self.create_seller()
            seller_id = seller['data']['id']
        
        thread_data = {
            "id": str(uuid.uuid4()),
            "buyer_id": buyer_id,
            "seller_id": seller_id,
            "subject": fake.sentence(),
            **kwargs
        }
        
        result = await self.api_client.create_chat_thread(thread_data)
        self.created_entities['chat_threads'].append(result['data']['id'])
        return result
    
    async def create_chat_message(self, thread_id: Optional[str] = None, sender_id: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Создание тестового сообщения чата."""
        if thread_id is None:
            thread = await self.create_chat_thread()
            thread_id = thread['data']['id']
        
        if sender_id is None:
            buyer = await self.create_buyer()
            sender_id = buyer['data']['id']
        
        message_data = {
            "id": str(uuid.uuid4()),
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
