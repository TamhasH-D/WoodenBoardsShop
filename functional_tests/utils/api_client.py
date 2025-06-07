"""API клиент для функциональных тестов."""

import httpx
from typing import Dict, Any, Optional, List
from uuid import UUID
import json


class APIClient:
    """Клиент для взаимодействия с API backend сервиса."""
    
    def __init__(self, client: httpx.AsyncClient):
        self.client = client
        self.base_url = "/api/v1"
    
    async def health_check(self) -> Dict[str, Any]:
        """Проверка здоровья сервиса."""
        response = await self.client.get(f"{self.base_url}/health/")
        response.raise_for_status()
        return response.json()
    
    # Buyer API
    async def create_buyer(self, buyer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание покупателя."""
        response = await self.client.post(f"{self.base_url}/buyers/", json=buyer_data)
        response.raise_for_status()
        return response.json()
    
    async def get_buyer(self, buyer_id: UUID) -> Dict[str, Any]:
        """Получение покупателя по ID."""
        response = await self.client.get(f"{self.base_url}/buyers/{buyer_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_buyer(self, buyer_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление покупателя."""
        response = await self.client.patch(f"{self.base_url}/buyers/{buyer_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_buyer(self, buyer_id: UUID) -> Dict[str, Any]:
        """Удаление покупателя."""
        response = await self.client.delete(f"{self.base_url}/buyers/{buyer_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_buyers(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка покупателей."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/buyers/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Seller API
    async def create_seller(self, seller_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание продавца."""
        response = await self.client.post(f"{self.base_url}/sellers/", json=seller_data)
        response.raise_for_status()
        return response.json()
    
    async def get_seller(self, seller_id: UUID) -> Dict[str, Any]:
        """Получение продавца по ID."""
        response = await self.client.get(f"{self.base_url}/sellers/{seller_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_seller(self, seller_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление продавца."""
        response = await self.client.patch(f"{self.base_url}/sellers/{seller_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_seller(self, seller_id: UUID) -> Dict[str, Any]:
        """Удаление продавца."""
        response = await self.client.delete(f"{self.base_url}/sellers/{seller_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_sellers(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка продавцов."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/sellers/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Product API
    async def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание продукта."""
        response = await self.client.post(f"{self.base_url}/products/", json=product_data)
        response.raise_for_status()
        return response.json()
    
    async def get_product(self, product_id: UUID) -> Dict[str, Any]:
        """Получение продукта по ID."""
        response = await self.client.get(f"{self.base_url}/products/{product_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_product(self, product_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление продукта."""
        response = await self.client.patch(f"{self.base_url}/products/{product_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_product(self, product_id: UUID) -> Dict[str, Any]:
        """Удаление продукта."""
        response = await self.client.delete(f"{self.base_url}/products/{product_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_products(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка продуктов."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/products/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Wood Type API
    async def create_wood_type(self, wood_type_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание типа древесины."""
        response = await self.client.post(f"{self.base_url}/wood-types/", json=wood_type_data)
        response.raise_for_status()
        return response.json()
    
    async def get_wood_type(self, wood_type_id: UUID) -> Dict[str, Any]:
        """Получение типа древесины по ID."""
        response = await self.client.get(f"{self.base_url}/wood-types/{wood_type_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_wood_type(self, wood_type_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление типа древесины."""
        response = await self.client.patch(f"{self.base_url}/wood-types/{wood_type_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_wood_type(self, wood_type_id: UUID) -> Dict[str, Any]:
        """Удаление типа древесины."""
        response = await self.client.delete(f"{self.base_url}/wood-types/{wood_type_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_wood_types(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка типов древесины."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/wood-types/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Wood Type Price API
    async def create_wood_type_price(self, price_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание цены на тип древесины."""
        response = await self.client.post(f"{self.base_url}/wood-type-prices/", json=price_data)
        response.raise_for_status()
        return response.json()
    
    async def get_wood_type_price(self, price_id: UUID) -> Dict[str, Any]:
        """Получение цены на тип древесины по ID."""
        response = await self.client.get(f"{self.base_url}/wood-type-prices/{price_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_wood_type_price(self, price_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление цены на тип древесины."""
        response = await self.client.patch(f"{self.base_url}/wood-type-prices/{price_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_wood_type_price(self, price_id: UUID) -> Dict[str, Any]:
        """Удаление цены на тип древесины."""
        response = await self.client.delete(f"{self.base_url}/wood-type-prices/{price_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_wood_type_prices(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка цен на типы древесины."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/wood-type-prices/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Wooden Board API
    async def create_wooden_board(self, board_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание деревянной доски."""
        response = await self.client.post(f"{self.base_url}/wooden-boards/", json=board_data)
        response.raise_for_status()
        return response.json()
    
    async def get_wooden_board(self, board_id: UUID) -> Dict[str, Any]:
        """Получение деревянной доски по ID."""
        response = await self.client.get(f"{self.base_url}/wooden-boards/{board_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_wooden_board(self, board_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление деревянной доски."""
        response = await self.client.patch(f"{self.base_url}/wooden-boards/{board_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_wooden_board(self, board_id: UUID) -> Dict[str, Any]:
        """Удаление деревянной доски."""
        response = await self.client.delete(f"{self.base_url}/wooden-boards/{board_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_wooden_boards(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка деревянных досок."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/wooden-boards/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Image API
    async def create_image(self, image_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание изображения."""
        response = await self.client.post(f"{self.base_url}/images/", json=image_data)
        response.raise_for_status()
        return response.json()
    
    async def get_image(self, image_id: UUID) -> Dict[str, Any]:
        """Получение изображения по ID."""
        response = await self.client.get(f"{self.base_url}/images/{image_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_image(self, image_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление изображения."""
        response = await self.client.patch(f"{self.base_url}/images/{image_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_image(self, image_id: UUID) -> Dict[str, Any]:
        """Удаление изображения."""
        response = await self.client.delete(f"{self.base_url}/images/{image_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_images(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка изображений."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/images/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Chat Thread API
    async def create_chat_thread(self, thread_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание треда чата."""
        response = await self.client.post(f"{self.base_url}/chat-threads/", json=thread_data)
        response.raise_for_status()
        return response.json()
    
    async def get_chat_thread(self, thread_id: UUID) -> Dict[str, Any]:
        """Получение треда чата по ID."""
        response = await self.client.get(f"{self.base_url}/chat-threads/{thread_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_chat_thread(self, thread_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление треда чата."""
        response = await self.client.patch(f"{self.base_url}/chat-threads/{thread_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_chat_thread(self, thread_id: UUID) -> Dict[str, Any]:
        """Удаление треда чата."""
        response = await self.client.delete(f"{self.base_url}/chat-threads/{thread_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_chat_threads(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка тредов чата."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/chat-threads/", params=params)
        response.raise_for_status()
        return response.json()
    
    # Chat Message API
    async def create_chat_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Создание сообщения чата."""
        response = await self.client.post(f"{self.base_url}/chat-messages/", json=message_data)
        response.raise_for_status()
        return response.json()
    
    async def get_chat_message(self, message_id: UUID) -> Dict[str, Any]:
        """Получение сообщения чата по ID."""
        response = await self.client.get(f"{self.base_url}/chat-messages/{message_id}")
        response.raise_for_status()
        return response.json()
    
    async def update_chat_message(self, message_id: UUID, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Обновление сообщения чата."""
        response = await self.client.patch(f"{self.base_url}/chat-messages/{message_id}", json=update_data)
        response.raise_for_status()
        return response.json()
    
    async def delete_chat_message(self, message_id: UUID) -> Dict[str, Any]:
        """Удаление сообщения чата."""
        response = await self.client.delete(f"{self.base_url}/chat-messages/{message_id}")
        response.raise_for_status()
        return response.json()
    
    async def get_chat_messages(self, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Получение списка сообщений чата."""
        params = {"limit": limit, "offset": offset}
        response = await self.client.get(f"{self.base_url}/chat-messages/", params=params)
        response.raise_for_status()
        return response.json()
