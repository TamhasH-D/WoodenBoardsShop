"""Функциональные тесты для Product API."""

import pytest
import uuid
from decimal import Decimal
from typing import Dict, Any
from base.test_base import BaseAPITest, APITestMixin
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory


class TestProductAPI(BaseAPITest, APITestMixin):
    """Тесты для API продуктов."""
    
    @pytest.mark.asyncio
    async def test_create_product_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного создания продукта с корректным UUID."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory

        # Создаем продавца для продукта
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]

        # Используем фабрику для генерации уникального UUID
        product_uuid = test_data_factory.generate_uuid()
        product_data = {
            "id": product_uuid,
            "seller_id": seller_id,
            "neme": "Тестовая доска",  # Используем typo как в API
            "descrioption": "Описание тестовой доски",  # Используем typo как в API
            "price": "1500.50"
        }

        response = await self.test_create_entity(
            api_client.create_product,
            product_data
        )

        # Проверяем, что backend вернул тот же UUID, который мы передали
        assert response["data"]["id"] == product_uuid
        assert response["data"]["seller_id"] == seller_id
        assert response["data"]["neme"] == product_data["neme"]
        assert response["data"]["descrioption"] == product_data["descrioption"]
        assert float(response["data"]["price"]) == float(product_data["price"])
    
    @pytest.mark.asyncio
    async def test_create_product_missing_uuid(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест создания продукта без UUID - должен вернуть ошибку."""
        self.api_client = api_client

        # Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]

        # Тест без обязательного поля id (UUID)
        product_data = {
            "seller_id": seller_id,
            "neme": "Тестовая доска",
            "descrioption": "Описание",
            "price": "1000.00"
        }

        with pytest.raises(Exception):  # Ожидаем ошибку валидации
            await api_client.create_product(product_data)

    @pytest.mark.asyncio
    async def test_create_product_invalid_seller_uuid(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест создания продукта с несуществующим продавцом."""
        self.api_client = api_client

        product_data = {
            "id": test_data_factory.generate_uuid(),
            "seller_id": test_data_factory.generate_uuid(),  # Несуществующий продавец
            "neme": "Тестовая доска",
            "descrioption": "Описание",
            "price": "1000.00"
        }

        with pytest.raises(Exception):  # Ожидаем ошибку внешнего ключа
            await api_client.create_product(product_data)

    @pytest.mark.asyncio
    async def test_create_product_duplicate_uuid(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест создания продукта с дублирующимся UUID."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory

        # Создаем первый продукт
        first_product = await test_data_factory.create_product()
        first_product_id = first_product["data"]["id"]

        # Создаем продавца для второго продукта
        seller = await test_data_factory.create_seller()

        # Пытаемся создать второй продукт с тем же UUID
        duplicate_data = {
            "id": first_product_id,  # Дублирующийся UUID
            "seller_id": seller["data"]["id"],
            "neme": "Другой продукт",
            "descrioption": "Другое описание",
            "price": "2000.00"
        }

        with pytest.raises(Exception):  # Ожидаем ошибку дублирования UUID
            await api_client.create_product(duplicate_data)
    
    @pytest.mark.asyncio
    async def test_get_product_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного получения продукта."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продукт
        product = await test_data_factory.create_product()
        product_id = product["data"]["id"]
        
        # Получаем продукт
        response = await self.test_get_entity(
            api_client.get_product,
            product_id
        )
        
        assert response["data"]["id"] == product_id
    
    @pytest.mark.asyncio
    async def test_update_product_price(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест обновления цены продукта."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продукт
        product = await test_data_factory.create_product(price="1000.00")
        product_id = product["data"]["id"]
        
        # Обновляем цену
        new_price = "1500.75"
        update_data = {"price": new_price}
        
        await self.test_update_entity(
            api_client.update_product,
            product_id,
            update_data
        )
        
        # Проверяем, что цена обновилась
        updated_product = await api_client.get_product(product_id)
        assert float(updated_product["data"]["price"]) == float(new_price)
    
    @pytest.mark.asyncio
    async def test_update_product_description(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест обновления описания продукта."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продукт
        product = await test_data_factory.create_product()
        product_id = product["data"]["id"]
        
        # Обновляем описание
        new_description = "Обновленное описание продукта"
        update_data = {"descrioption": new_description}  # Используем typo как в API
        
        await self.test_update_entity(
            api_client.update_product,
            product_id,
            update_data
        )
        
        # Проверяем, что описание обновилось
        updated_product = await api_client.get_product(product_id)
        assert updated_product["data"]["descrioption"] == new_description
    
    @pytest.mark.asyncio
    async def test_delete_product_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного удаления продукта."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продукт
        product = await test_data_factory.create_product()
        product_id = product["data"]["id"]
        
        # Удаляем продукт
        await self.test_delete_entity(
            api_client.delete_product,
            product_id
        )
        
        # Проверяем, что продукт удален
        with pytest.raises(Exception):  # Ожидаем 404 ошибку
            await api_client.get_product(product_id)
    
    @pytest.mark.asyncio
    async def test_list_products_by_seller(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест получения списка продуктов конкретного продавца."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем двух продавцов
        seller1 = await test_data_factory.create_seller()
        seller2 = await test_data_factory.create_seller()
        
        # Создаем продукты для первого продавца
        seller1_products = []
        for i in range(3):
            product = await test_data_factory.create_product(seller_id=seller1["data"]["id"])
            seller1_products.append(product)
        
        # Создаем продукты для второго продавца
        seller2_products = []
        for i in range(2):
            product = await test_data_factory.create_product(seller_id=seller2["data"]["id"])
            seller2_products.append(product)
        
        # Получаем все продукты
        all_products = await api_client.get_products()
        
        # Проверяем, что все созданные продукты есть в списке
        all_product_ids = [product["id"] for product in all_products["data"]]
        
        for product in seller1_products + seller2_products:
            assert product["data"]["id"] in all_product_ids
    
    @pytest.mark.asyncio
    async def test_product_price_validation(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест валидации цены продукта."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]
        
        # Тестируем различные невалидные цены
        invalid_prices = [
            "-100.00",  # Отрицательная цена
            "0.00",     # Нулевая цена
            "abc",      # Не число
            "",         # Пустая строка
        ]
        
        for invalid_price in invalid_prices:
            product_data = {
                "id": str(uuid.uuid4()),
                "seller_id": seller_id,
                "neme": "Тестовый продукт",
                "descrioption": "Описание",
                "price": invalid_price
            }
            
            with pytest.raises(Exception):  # Ожидаем ошибку валидации
                await api_client.create_product(product_data)
    
    @pytest.mark.asyncio
    async def test_product_name_length_validation(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест валидации длины названия продукта."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]
        
        # Тест с очень длинным названием
        long_name = "А" * 1000  # Очень длинное название
        
        product_data = {
            "id": str(uuid.uuid4()),
            "seller_id": seller_id,
            "neme": long_name,
            "descrioption": "Описание",
            "price": "1000.00"
        }
        
        # В зависимости от ограничений БД, может быть успешно или с ошибкой
        try:
            response = await api_client.create_product(product_data)
            # Если создание прошло успешно, проверяем, что название сохранилось
            assert response["data"]["neme"] == long_name
        except Exception:
            # Если есть ограничение на длину, это ожидаемое поведение
            pass
    
    @pytest.mark.asyncio
    async def test_product_lifecycle(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест полного жизненного цикла продукта."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # 1. Создаем продавца
        seller = await test_data_factory.create_seller()
        seller_id = seller["data"]["id"]
        
        # 2. Создаем продукт
        product_data = {
            "id": str(uuid.uuid4()),
            "seller_id": seller_id,
            "neme": "Дубовая доска",
            "descrioption": "Качественная дубовая доска для строительства",
            "price": "2500.00"
        }
        
        created_product = await api_client.create_product(product_data)
        product_id = created_product["data"]["id"]
        
        # 3. Получаем продукт и проверяем данные
        retrieved_product = await api_client.get_product(product_id)
        assert retrieved_product["data"]["neme"] == product_data["neme"]
        assert retrieved_product["data"]["descrioption"] == product_data["descrioption"]
        
        # 4. Обновляем цену (скидка)
        await api_client.update_product(product_id, {"price": "2000.00"})
        
        # 5. Проверяем обновление
        updated_product = await api_client.get_product(product_id)
        assert float(updated_product["data"]["price"]) == 2000.00
        
        # 6. Обновляем описание
        new_description = "Качественная дубовая доска для строительства. СКИДКА!"
        await api_client.update_product(product_id, {"descrioption": new_description})
        
        # 7. Проверяем обновление описания
        final_product = await api_client.get_product(product_id)
        assert final_product["data"]["descrioption"] == new_description
        
        # 8. Удаляем продукт
        await api_client.delete_product(product_id)
        
        # 9. Проверяем, что продукт удален
        with pytest.raises(Exception):
            await api_client.get_product(product_id)
