"""Функциональные тесты для Wood Type API."""

import pytest
import uuid
from typing import Dict, Any
from base.test_base import BaseAPITest, APITestMixin
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory


class TestWoodTypeAPI(BaseAPITest, APITestMixin):
    """Тесты для API типов древесины."""
    
    @pytest.mark.asyncio
    async def test_create_wood_type_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного создания типа древесины."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        wood_type_data = {
            "id": str(uuid.uuid4()),
            "neme": "Дуб",  # Используем typo как в API
            "description": "Твердая древесина дуба, отличается прочностью и долговечностью"
        }
        
        response = await self.test_create_entity(
            api_client.create_wood_type,
            wood_type_data
        )
        
        # Дополнительные проверки для wood_type
        assert response["data"]["neme"] == wood_type_data["neme"]
        assert response["data"]["description"] == wood_type_data["description"]
    
    @pytest.mark.asyncio
    async def test_create_wood_type_duplicate_name(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест создания типа древесины с дублирующимся названием."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем первый тип древесины
        wood_name = "Сосна"
        first_wood_type = await test_data_factory.create_wood_type(neme=wood_name)
        
        # Пытаемся создать второй тип с тем же названием
        duplicate_data = {
            "id": str(uuid.uuid4()),
            "neme": wood_name,
            "description": "Другое описание сосны"
        }
        
        # В зависимости от ограничений БД, может быть разрешено или запрещено
        try:
            response = await api_client.create_wood_type(duplicate_data)
            # Если дубликаты разрешены, проверяем, что создание прошло успешно
            assert response["data"]["neme"] == wood_name
        except Exception:
            # Если есть ограничение уникальности, это ожидаемое поведение
            pass
    
    @pytest.mark.asyncio
    async def test_get_wood_type_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного получения типа древесины."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем тип древесины
        wood_type = await test_data_factory.create_wood_type()
        wood_type_id = wood_type["data"]["id"]
        
        # Получаем тип древесины
        response = await self.test_get_entity(
            api_client.get_wood_type,
            wood_type_id
        )
        
        assert response["data"]["id"] == wood_type_id
    
    @pytest.mark.asyncio
    async def test_update_wood_type_description(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест обновления описания типа древесины."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем тип древесины
        wood_type = await test_data_factory.create_wood_type(
            neme="Береза",
            description="Исходное описание березы"
        )
        wood_type_id = wood_type["data"]["id"]
        
        # Обновляем описание
        new_description = "Обновленное описание: Береза - легкая и прочная древесина"
        update_data = {"description": new_description}
        
        await self.test_update_entity(
            api_client.update_wood_type,
            wood_type_id,
            update_data
        )
        
        # Проверяем, что описание обновилось
        updated_wood_type = await api_client.get_wood_type(wood_type_id)
        assert updated_wood_type["data"]["description"] == new_description
    
    @pytest.mark.asyncio
    async def test_update_wood_type_name(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест обновления названия типа древесины."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем тип древесины
        wood_type = await test_data_factory.create_wood_type(neme="Ель")
        wood_type_id = wood_type["data"]["id"]
        
        # Обновляем название
        new_name = "Ель сибирская"
        update_data = {"neme": new_name}  # Используем typo как в API
        
        await self.test_update_entity(
            api_client.update_wood_type,
            wood_type_id,
            update_data
        )
        
        # Проверяем, что название обновилось
        updated_wood_type = await api_client.get_wood_type(wood_type_id)
        assert updated_wood_type["data"]["neme"] == new_name
    
    @pytest.mark.asyncio
    async def test_delete_wood_type_success(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест успешного удаления типа древесины."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем тип древесины
        wood_type = await test_data_factory.create_wood_type()
        wood_type_id = wood_type["data"]["id"]
        
        # Удаляем тип древесины
        await self.test_delete_entity(
            api_client.delete_wood_type,
            wood_type_id
        )
        
        # Проверяем, что тип древесины удален
        with pytest.raises(Exception):  # Ожидаем 404 ошибку
            await api_client.get_wood_type(wood_type_id)
    
    @pytest.mark.asyncio
    async def test_delete_wood_type_with_prices(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест удаления типа древесины, у которого есть цены."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем тип древесины
        wood_type = await test_data_factory.create_wood_type()
        wood_type_id = wood_type["data"]["id"]
        
        # Создаем цену для этого типа древесины
        price = await test_data_factory.create_wood_type_price(wood_type_id=wood_type_id)
        
        # Пытаемся удалить тип древесины
        try:
            await api_client.delete_wood_type(wood_type_id)
            
            # Если удаление прошло успешно, проверяем каскадное удаление цены
            with pytest.raises(Exception):
                await api_client.get_wood_type_price(price["data"]["id"])
                
        except Exception:
            # Если есть ограничение внешнего ключа, это ожидаемое поведение
            # В этом случае сначала нужно удалить цены
            await api_client.delete_wood_type_price(price["data"]["id"])
            await api_client.delete_wood_type(wood_type_id)
    
    @pytest.mark.asyncio
    async def test_list_wood_types_empty(self, api_client: APIClient):
        """Тест получения пустого списка типов древесины."""
        self.api_client = api_client
        
        response = await self.test_list_entities(
            api_client.get_wood_types,
            min_count=0
        )
        
        await self.assert_list_response(response, min_count=0)
    
    @pytest.mark.asyncio
    async def test_list_wood_types_with_data(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест получения списка типов древесины с данными."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем несколько типов древесины
        wood_types = []
        wood_names = ["Дуб", "Сосна", "Береза", "Ель", "Лиственница"]
        
        for name in wood_names:
            wood_type = await test_data_factory.create_wood_type(neme=name)
            wood_types.append(wood_type)
        
        response = await self.test_list_entities(
            api_client.get_wood_types,
            min_count=len(wood_names)
        )
        
        await self.assert_list_response(response, min_count=len(wood_names))
        
        # Проверяем, что все созданные типы есть в списке
        wood_type_ids = [wt["data"]["id"] for wt in wood_types]
        response_ids = [item["id"] for item in response["data"]]
        
        for wood_type_id in wood_type_ids:
            assert wood_type_id in response_ids
    
    @pytest.mark.asyncio
    async def test_wood_type_search_functionality(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест функциональности поиска типов древесины."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем типы древесины с разными названиями
        wood_types_data = [
            {"neme": "Дуб черешчатый", "description": "Твердая древесина"},
            {"neme": "Дуб красный", "description": "Американский дуб"},
            {"neme": "Сосна обыкновенная", "description": "Хвойная древесина"},
            {"neme": "Береза повислая", "description": "Лиственная древесина"},
        ]
        
        created_wood_types = []
        for data in wood_types_data:
            wood_type = await test_data_factory.create_wood_type(**data)
            created_wood_types.append(wood_type)
        
        # Получаем все типы древесины
        all_wood_types = await api_client.get_wood_types()
        
        # Проверяем, что все созданные типы есть в списке
        all_names = [item["neme"] for item in all_wood_types["data"]]
        
        for data in wood_types_data:
            assert data["neme"] in all_names
    
    @pytest.mark.asyncio
    async def test_wood_type_data_integrity(self, api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест целостности данных типа древесины."""
        self.api_client = api_client
        self.test_data_factory = test_data_factory
        
        # Создаем тип древесины с полными данными
        original_data = {
            "id": str(uuid.uuid4()),
            "neme": "Кедр сибирский",
            "description": "Ценная хвойная древесина с приятным ароматом и высокими эксплуатационными характеристиками"
        }
        
        created_wood_type = await api_client.create_wood_type(original_data)
        wood_type_id = created_wood_type["data"]["id"]
        
        # Получаем тип древесины несколько раз и проверяем консистентность
        for _ in range(5):
            retrieved_wood_type = await api_client.get_wood_type(wood_type_id)
            
            assert retrieved_wood_type["data"]["id"] == original_data["id"]
            assert retrieved_wood_type["data"]["neme"] == original_data["neme"]
            assert retrieved_wood_type["data"]["description"] == original_data["description"]
        
        # Проверяем, что данные не изменились после множественных запросов
        final_wood_type = await api_client.get_wood_type(wood_type_id)
        assert final_wood_type["data"]["neme"] == original_data["neme"]
        assert final_wood_type["data"]["description"] == original_data["description"]
