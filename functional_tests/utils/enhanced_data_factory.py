"""Расширенная фабрика для создания тестовых данных."""

import uuid
import random
import string
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from utils.api_client import APIClient


class EnhancedTestDataFactory:
    """Расширенная фабрика для создания реалистичных тестовых данных."""
    
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
        
        # Предустановленные данные для реалистичных тестов
        self.wood_types_templates = [
            {"neme": "Сосна", "descrioption": "Хвойная древесина, легкая в обработке"},
            {"neme": "Дуб", "descrioption": "Твердая лиственная древесина высокого качества"},
            {"neme": "Береза", "descrioption": "Светлая лиственная древесина"},
            {"neme": "Ель", "descrioption": "Хвойная древесина с приятным ароматом"},
            {"neme": "Лиственница", "descrioption": "Прочная хвойная древесина"},
            {"neme": "Осина", "descrioption": "Мягкая лиственная древесина"},
            {"neme": "Кедр", "descrioption": "Ценная хвойная древесина"},
        ]
        
        self.product_templates = [
            {"title": "Доска обрезная", "descrioption": "Качественная обрезная доска"},
            {"title": "Брус строительный", "descrioption": "Строительный брус для каркаса"},
            {"title": "Вагонка", "descrioption": "Вагонка для внутренней отделки"},
            {"title": "Половая доска", "descrioption": "Доска для настила пола"},
            {"title": "Блок-хаус", "descrioption": "Имитация бревна для отделки"},
            {"title": "Имитация бруса", "descrioption": "Отделочный материал под брус"},
            {"title": "Планкен", "descrioption": "Фасадная доска"},
        ]
        
        self.locations = [
            "Москва, ул. Строительная, 15",
            "Санкт-Петербург, пр. Лесной, 42",
            "Екатеринбург, ул. Деревообрабатывающая, 8",
            "Новосибирск, ул. Промышленная, 23",
            "Казань, ул. Лесопильная, 7",
            "Нижний Новгород, ул. Складская, 12",
        ]
        
        self.chat_messages = [
            "Здравствуйте! Интересует ваш товар.",
            "Какая цена за кубометр?",
            "Возможна ли доставка?",
            "Есть ли скидки при больших объемах?",
            "Когда можно забрать товар?",
            "Спасибо за информацию!",
            "Можно посмотреть товар перед покупкой?",
            "Какие способы оплаты принимаете?",
            "Есть ли сертификаты качества?",
            "Сколько времени займет доставка?",
        ]
    
    def _generate_random_string(self, length: int = 8) -> str:
        """Генерирует случайную строку."""
        return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))
    
    def _generate_realistic_price(self, volume: float, wood_type: str = None) -> float:
        """Генерирует реалистичную цену на основе объема и типа древесины."""
        # Базовые цены за кубометр для разных типов древесины
        base_prices = {
            "Сосна": 15000,
            "Ель": 16000,
            "Береза": 18000,
            "Осина": 14000,
            "Дуб": 35000,
            "Лиственница": 25000,
            "Кедр": 40000,
        }
        
        base_price = base_prices.get(wood_type, 20000)
        # Добавляем случайное отклонение ±20%
        variation = random.uniform(0.8, 1.2)
        price_per_cubic = base_price * variation
        
        return round(volume * price_per_cubic, 2)
    
    async def create_buyer_data(self, **kwargs) -> Dict[str, Any]:
        """Создает данные для покупателя."""
        buyer_id = str(uuid.uuid4())
        data = {
            "id": buyer_id,
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": kwargs.get("is_online", random.choice([True, False]))
        }
        data.update(kwargs)
        self.created_entities['buyers'].append(buyer_id)
        return data
    
    async def create_seller_data(self, **kwargs) -> Dict[str, Any]:
        """Создает данные для продавца."""
        seller_id = str(uuid.uuid4())
        data = {
            "id": seller_id,
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": kwargs.get("is_online", random.choice([True, False]))
        }
        data.update(kwargs)
        self.created_entities['sellers'].append(seller_id)
        return data
    
    async def create_wood_type_data(self, **kwargs) -> Dict[str, Any]:
        """Создает данные для типа древесины."""
        wood_type_id = str(uuid.uuid4())
        
        # Используем шаблон или создаем уникальные данные
        if not kwargs.get("neme") and not kwargs.get("descrioption"):
            template = random.choice(self.wood_types_templates)
            unique_suffix = self._generate_random_string(4)
            neme = f"{template['neme']} {unique_suffix}"
            descrioption = f"{template['descrioption']} (тест {unique_suffix})"
        else:
            neme = kwargs.get("neme", f"Древесина {self._generate_random_string()}")
            descrioption = kwargs.get("descrioption", "Тестовое описание древесины")
        
        data = {
            "id": wood_type_id,
            "neme": neme,  # Сохраняем typo для совместимости
            "descrioption": descrioption  # Сохраняем typo для совместимости
        }
        data.update(kwargs)
        self.created_entities['wood_types'].append(wood_type_id)
        return data
    
    async def create_wood_type_price_data(self, wood_type_id: str, **kwargs) -> Dict[str, Any]:
        """Создает данные для цены на тип древесины."""
        price_id = str(uuid.uuid4())
        data = {
            "id": price_id,
            "price": kwargs.get("price", round(random.uniform(10000, 30000), 2)),
            "wood_type_id": wood_type_id
        }
        data.update(kwargs)
        self.created_entities['wood_type_prices'].append(price_id)
        return data
    
    async def create_product_data(self, seller_id: str, wood_type_id: str, **kwargs) -> Dict[str, Any]:
        """Создает данные для продукта."""
        product_id = str(uuid.uuid4())
        
        # Генерируем реалистичные данные
        volume = kwargs.get("volume", round(random.uniform(0.5, 50.0), 2))
        
        # Используем шаблон или создаем уникальные данные
        if not kwargs.get("title"):
            template = random.choice(self.product_templates)
            unique_suffix = self._generate_random_string(4)
            title = f"{template['title']} {unique_suffix}"
            descrioption = f"{template['descrioption']} (тест {unique_suffix})"
        else:
            title = kwargs.get("title")
            descrioption = kwargs.get("descrioption", "Тестовое описание продукта")
        
        # Генерируем цену на основе объема
        price = kwargs.get("price", self._generate_realistic_price(volume))
        
        data = {
            "id": product_id,
            "volume": volume,
            "price": price,
            "title": title,
            "descrioption": descrioption,  # Сохраняем typo для совместимости
            "delivery_possible": kwargs.get("delivery_possible", random.choice([True, False])),
            "pickup_location": kwargs.get("pickup_location", random.choice(self.locations)),
            "seller_id": seller_id,
            "wood_type_id": wood_type_id
        }
        data.update(kwargs)
        self.created_entities['products'].append(product_id)
        return data
    
    async def create_wooden_board_data(self, **kwargs) -> Dict[str, Any]:
        """Создает данные для деревянной доски."""
        board_id = str(uuid.uuid4())
        
        # Стандартные размеры досок
        standard_lengths = [2.0, 3.0, 4.0, 6.0]
        standard_widths = [0.1, 0.15, 0.2, 0.25, 0.3]
        standard_heights = [0.025, 0.032, 0.04, 0.05]
        
        length = kwargs.get("lenght", random.choice(standard_lengths))  # Сохраняем typo
        width = kwargs.get("width", random.choice(standard_widths))
        height = kwargs.get("height", random.choice(standard_heights))
        
        data = {
            "id": board_id,
            "lenght": length,  # Сохраняем typo
            "width": width,
            "height": height,
            "volume": kwargs.get("volume", round(length * width * height, 4))
        }
        data.update(kwargs)
        self.created_entities['wooden_boards'].append(board_id)
        return data
    
    async def create_chat_thread_data(self, buyer_id: str, seller_id: str, **kwargs) -> Dict[str, Any]:
        """Создает данные для треда чата."""
        thread_id = str(uuid.uuid4())
        data = {
            "id": thread_id,
            "buyer_id": buyer_id,
            "seller_id": seller_id
        }
        data.update(kwargs)
        self.created_entities['chat_threads'].append(thread_id)
        return data
    
    async def create_chat_message_data(self, thread_id: str, buyer_id: str, **kwargs) -> Dict[str, Any]:
        """Создает данные для сообщения чата."""
        message_id = str(uuid.uuid4())
        data = {
            "id": message_id,
            "content": kwargs.get("content", random.choice(self.chat_messages)),
            "thread_id": thread_id,
            "buyer_id": buyer_id
        }
        data.update(kwargs)
        self.created_entities['chat_messages'].append(message_id)
        return data
    
    async def create_image_data(self, product_id: str, **kwargs) -> Dict[str, Any]:
        """Создает данные для изображения."""
        image_id = str(uuid.uuid4())
        data = {
            "id": image_id,
            "url": kwargs.get("url", f"https://example.com/images/test_{self._generate_random_string()}.jpg"),
            "product_id": product_id
        }
        data.update(kwargs)
        self.created_entities['images'].append(image_id)
        return data
    
    async def create_complete_marketplace_scenario(self) -> Dict[str, Any]:
        """Создает полный сценарий маркетплейса с взаимосвязанными данными."""
        scenario_data = {
            "buyers": [],
            "sellers": [],
            "wood_types": [],
            "products": [],
            "chat_threads": [],
            "chat_messages": []
        }
        
        # Создаем покупателей
        for i in range(3):
            buyer_data = await self.create_buyer_data()
            response = await self.api_client.post("/api/v1/buyers/", json=buyer_data)
            if response.status_code == 201:
                scenario_data["buyers"].append(response.json()["data"])
        
        # Создаем продавцов
        for i in range(2):
            seller_data = await self.create_seller_data()
            response = await self.api_client.post("/api/v1/sellers/", json=seller_data)
            if response.status_code == 201:
                scenario_data["sellers"].append(response.json()["data"])
        
        # Создаем типы древесины
        for template in self.wood_types_templates[:3]:
            wood_type_data = await self.create_wood_type_data(
                neme=template["neme"],
                descrioption=template["descrioption"]
            )
            response = await self.api_client.post("/api/v1/wood-types/", json=wood_type_data)
            if response.status_code == 201:
                scenario_data["wood_types"].append(response.json()["data"])
        
        # Создаем продукты
        if scenario_data["sellers"] and scenario_data["wood_types"]:
            for seller in scenario_data["sellers"]:
                for wood_type in scenario_data["wood_types"]:
                    product_data = await self.create_product_data(
                        seller_id=seller["id"],
                        wood_type_id=wood_type["id"]
                    )
                    response = await self.api_client.post("/api/v1/products/", json=product_data)
                    if response.status_code == 201:
                        scenario_data["products"].append(response.json()["data"])
        
        # Создаем чаты между покупателями и продавцами
        if scenario_data["buyers"] and scenario_data["sellers"]:
            for buyer in scenario_data["buyers"]:
                for seller in scenario_data["sellers"]:
                    thread_data = await self.create_chat_thread_data(
                        buyer_id=buyer["id"],
                        seller_id=seller["id"]
                    )
                    response = await self.api_client.post("/api/v1/chat-threads/", json=thread_data)
                    if response.status_code == 201:
                        thread = response.json()["data"]
                        scenario_data["chat_threads"].append(thread)
                        
                        # Добавляем несколько сообщений в каждый чат
                        for _ in range(random.randint(1, 3)):
                            message_data = await self.create_chat_message_data(
                                thread_id=thread["id"],
                                buyer_id=buyer["id"]
                            )
                            msg_response = await self.api_client.post("/api/v1/chat-messages/", json=message_data)
                            if msg_response.status_code == 201:
                                scenario_data["chat_messages"].append(msg_response.json()["data"])
        
        return scenario_data
    
    async def cleanup(self):
        """Очищает созданные тестовые данные."""
        cleanup_order = [
            ('chat_messages', '/api/v1/chat-messages'),
            ('chat_threads', '/api/v1/chat-threads'),
            ('images', '/api/v1/images'),
            ('products', '/api/v1/products'),
            ('wooden_boards', '/api/v1/wooden-boards'),
            ('wood_type_prices', '/api/v1/wood-type-prices'),
            ('wood_types', '/api/v1/wood-types'),
            ('sellers', '/api/v1/sellers'),
            ('buyers', '/api/v1/buyers')
        ]
        
        for entity_type, endpoint in cleanup_order:
            for entity_id in self.created_entities[entity_type]:
                try:
                    await self.api_client.delete(f"{endpoint}/{entity_id}")
                except Exception:
                    pass
        
        for entity_list in self.created_entities.values():
            entity_list.clear()
