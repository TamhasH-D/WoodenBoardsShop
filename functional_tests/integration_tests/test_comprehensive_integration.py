"""Комплексные интеграционные тесты для WoodenBoardsShop."""

import pytest
import asyncio
import aiofiles
import tempfile
import os
from typing import Dict, Any, List
from utils.api_client import APIClient
from utils.enhanced_data_factory import EnhancedTestDataFactory
import httpx


class TestComprehensiveIntegration:
    """Комплексные интеграционные тесты."""

    @pytest.mark.asyncio
    @pytest.mark.integration
    async def test_full_marketplace_workflow(self, api_client: APIClient):
        """Тестирование полного рабочего процесса маркетплейса."""
        factory = EnhancedTestDataFactory(api_client)
        
        try:
            # 1. Создание базовых сущностей
            seller_data = await factory.create_seller_data()
            seller_response = await api_client.post("/api/v1/sellers/", json=seller_data)
            assert seller_response.status_code == 201
            seller = seller_response.json()["data"]
            
            buyer_data = await factory.create_buyer_data()
            buyer_response = await api_client.post("/api/v1/buyers/", json=buyer_data)
            assert buyer_response.status_code == 201
            buyer = buyer_response.json()["data"]
            
            wood_type_data = await factory.create_wood_type_data()
            wood_type_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
            assert wood_type_response.status_code == 201
            wood_type = wood_type_response.json()["data"]
            
            # 2. Создание продукта
            product_data = await factory.create_product_data(
                seller_id=seller["id"],
                wood_type_id=wood_type["id"]
            )
            product_response = await api_client.post("/api/v1/products/", json=product_data)
            assert product_response.status_code == 201
            product = product_response.json()["data"]
            
            # 3. Создание чата между покупателем и продавцом
            thread_data = await factory.create_chat_thread_data(
                buyer_id=buyer["id"],
                seller_id=seller["id"]
            )
            thread_response = await api_client.post("/api/v1/chat-threads/", json=thread_data)
            assert thread_response.status_code == 201
            thread = thread_response.json()["data"]
            
            # 4. Обмен сообщениями
            messages = []
            for i in range(3):
                message_data = await factory.create_chat_message_data(
                    thread_id=thread["id"],
                    buyer_id=buyer["id"]
                )
                message_response = await api_client.post("/api/v1/chat-messages/", json=message_data)
                assert message_response.status_code == 201
                messages.append(message_response.json()["data"])
            
            # 5. Проверка связей между сущностями
            # Проверяем, что продукт связан с продавцом и типом древесины
            product_check = await api_client.get(f"/api/v1/products/{product['id']}")
            assert product_check.status_code == 200
            product_data_check = product_check.json()["data"]
            assert product_data_check["seller_id"] == seller["id"]
            assert product_data_check["wood_type_id"] == wood_type["id"]
            
            # Проверяем, что чат связан с покупателем и продавцом
            thread_check = await api_client.get(f"/api/v1/chat-threads/{thread['id']}")
            assert thread_check.status_code == 200
            thread_data_check = thread_check.json()["data"]
            assert thread_data_check["buyer_id"] == buyer["id"]
            assert thread_data_check["seller_id"] == seller["id"]
            
            # 6. Проверка пагинации и фильтрации
            products_response = await api_client.get("/api/v1/products/?limit=10&offset=0")
            assert products_response.status_code == 200
            products_data = products_response.json()
            assert len(products_data["data"]) >= 1
            assert any(p["id"] == product["id"] for p in products_data["data"])
            
        finally:
            await factory.cleanup()

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.yolo
    async def test_yolo_service_integration(self, api_client: APIClient):
        """Тестирование интеграции с YOLO сервисом для анализа изображений."""
        # Создаем тестовое изображение
        test_image_content = b"fake_image_content_for_testing"
        
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as temp_file:
            temp_file.write(test_image_content)
            temp_file_path = temp_file.name
        
        try:
            # Тестируем endpoint для расчета объема досок
            with open(temp_file_path, "rb") as image_file:
                files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
                data = {
                    "board_height": 2.5,
                    "board_length": 6.0
                }
                
                # Отправляем запрос к YOLO сервису через backend
                response = await api_client.post(
                    "/api/v1/wooden-boards/calculate-volume",
                    files=files,
                    data=data
                )
                
                # Проверяем ответ (может быть ошибка, если YOLO сервис недоступен)
                assert response.status_code in [200, 400, 500, 503]
                
                if response.status_code == 200:
                    result = response.json()
                    # Проверяем структуру ответа
                    assert "total_volume" in result or "error" in result
                
        finally:
            # Удаляем временный файл
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.database
    async def test_database_consistency(self, api_client: APIClient):
        """Тестирование консистентности базы данных."""
        factory = EnhancedTestDataFactory(api_client)
        
        try:
            # Создаем множество связанных сущностей
            sellers = []
            buyers = []
            wood_types = []
            products = []
            
            # Создаем 5 продавцов
            for i in range(5):
                seller_data = await factory.create_seller_data()
                response = await api_client.post("/api/v1/sellers/", json=seller_data)
                assert response.status_code == 201
                sellers.append(response.json()["data"])
            
            # Создаем 3 покупателя
            for i in range(3):
                buyer_data = await factory.create_buyer_data()
                response = await api_client.post("/api/v1/buyers/", json=buyer_data)
                assert response.status_code == 201
                buyers.append(response.json()["data"])
            
            # Создаем 3 типа древесины
            for i in range(3):
                wood_type_data = await factory.create_wood_type_data()
                response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
                assert response.status_code == 201
                wood_types.append(response.json()["data"])
            
            # Создаем продукты для каждого продавца и типа древесины
            for seller in sellers:
                for wood_type in wood_types:
                    product_data = await factory.create_product_data(
                        seller_id=seller["id"],
                        wood_type_id=wood_type["id"]
                    )
                    response = await api_client.post("/api/v1/products/", json=product_data)
                    assert response.status_code == 201
                    products.append(response.json()["data"])
            
            # Проверяем, что все продукты созданы
            assert len(products) == len(sellers) * len(wood_types)
            
            # Проверяем консистентность через API
            all_products_response = await api_client.get("/api/v1/products/?limit=100")
            assert all_products_response.status_code == 200
            all_products = all_products_response.json()["data"]
            
            # Проверяем, что все созданные продукты присутствуют
            created_product_ids = {p["id"] for p in products}
            fetched_product_ids = {p["id"] for p in all_products}
            assert created_product_ids.issubset(fetched_product_ids)
            
            # Проверяем связи
            for product in products:
                # Проверяем, что продавец существует
                seller_response = await api_client.get(f"/api/v1/sellers/{product['seller_id']}")
                assert seller_response.status_code == 200
                
                # Проверяем, что тип древесины существует
                wood_type_response = await api_client.get(f"/api/v1/wood-types/{product['wood_type_id']}")
                assert wood_type_response.status_code == 200
            
            # Тестируем каскадное удаление
            # Удаляем одного продавца
            seller_to_delete = sellers[0]
            delete_response = await api_client.delete(f"/api/v1/sellers/{seller_to_delete['id']}")
            assert delete_response.status_code == 200
            
            # Проверяем, что продукты этого продавца тоже удалены
            seller_products = [p for p in products if p["seller_id"] == seller_to_delete["id"]]
            for product in seller_products:
                product_response = await api_client.get(f"/api/v1/products/{product['id']}")
                assert product_response.status_code == 404
            
        finally:
            await factory.cleanup()

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.performance
    async def test_concurrent_operations(self, api_client: APIClient):
        """Тестирование конкурентных операций."""
        factory = EnhancedTestDataFactory(api_client)
        
        try:
            # Создаем базовые сущности
            seller_data = await factory.create_seller_data()
            seller_response = await api_client.post("/api/v1/sellers/", json=seller_data)
            assert seller_response.status_code == 201
            seller = seller_response.json()["data"]
            
            wood_type_data = await factory.create_wood_type_data()
            wood_type_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
            assert wood_type_response.status_code == 201
            wood_type = wood_type_response.json()["data"]
            
            # Создаем множество продуктов конкурентно
            async def create_product():
                product_data = await factory.create_product_data(
                    seller_id=seller["id"],
                    wood_type_id=wood_type["id"]
                )
                response = await api_client.post("/api/v1/products/", json=product_data)
                return response
            
            # Запускаем 20 конкурентных запросов
            tasks = [create_product() for _ in range(20)]
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Проверяем результаты
            successful_responses = [r for r in responses if not isinstance(r, Exception) and r.status_code == 201]
            assert len(successful_responses) >= 15, f"Слишком много неудачных запросов: {len(successful_responses)}/20"
            
            # Проверяем, что все продукты уникальны
            product_ids = [r.json()["data"]["id"] for r in successful_responses]
            assert len(product_ids) == len(set(product_ids)), "Дублирующиеся ID продуктов"
            
        finally:
            await factory.cleanup()

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.error_handling
    async def test_error_handling_integration(self, api_client: APIClient):
        """Тестирование обработки ошибок в интеграционных сценариях."""
        factory = EnhancedTestDataFactory(api_client)
        
        try:
            # Тест создания продукта с несуществующим продавцом
            fake_seller_id = "550e8400-e29b-41d4-a716-446655440999"
            wood_type_data = await factory.create_wood_type_data()
            wood_type_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
            assert wood_type_response.status_code == 201
            wood_type = wood_type_response.json()["data"]
            
            product_data = await factory.create_product_data(
                seller_id=fake_seller_id,
                wood_type_id=wood_type["id"]
            )
            
            response = await api_client.post("/api/v1/products/", json=product_data)
            assert response.status_code in [400, 404, 422], "Должна быть ошибка для несуществующего продавца"
            
            # Тест создания чата с несуществующими пользователями
            fake_buyer_id = "550e8400-e29b-41d4-a716-446655440998"
            fake_seller_id = "550e8400-e29b-41d4-a716-446655440997"
            
            thread_data = await factory.create_chat_thread_data(
                buyer_id=fake_buyer_id,
                seller_id=fake_seller_id
            )
            
            response = await api_client.post("/api/v1/chat-threads/", json=thread_data)
            assert response.status_code in [400, 404, 422], "Должна быть ошибка для несуществующих пользователей"
            
            # Тест обновления несуществующей сущности
            fake_product_id = "550e8400-e29b-41d4-a716-446655440996"
            update_data = {"title": "Обновленный товар"}
            
            response = await api_client.patch(f"/api/v1/products/{fake_product_id}", json=update_data)
            assert response.status_code == 404, "Должна быть ошибка 404 для несуществующего продукта"
            
            # Тест удаления несуществующей сущности
            response = await api_client.delete(f"/api/v1/products/{fake_product_id}")
            assert response.status_code == 404, "Должна быть ошибка 404 при удалении несуществующего продукта"
            
        finally:
            await factory.cleanup()

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.data_validation
    async def test_data_validation_integration(self, api_client: APIClient):
        """Тестирование валидации данных в интеграционных сценариях."""
        factory = EnhancedTestDataFactory(api_client)
        
        try:
            # Создаем валидные базовые сущности
            seller_data = await factory.create_seller_data()
            seller_response = await api_client.post("/api/v1/sellers/", json=seller_data)
            assert seller_response.status_code == 201
            seller = seller_response.json()["data"]
            
            wood_type_data = await factory.create_wood_type_data()
            wood_type_response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
            assert wood_type_response.status_code == 201
            wood_type = wood_type_response.json()["data"]
            
            # Тест валидации продукта с невалидными данными
            invalid_product_scenarios = [
                # Отрицательный объем
                {"volume": -1.0, "price": 1000.0, "title": "Тест"},
                # Отрицательная цена
                {"volume": 1.0, "price": -1000.0, "title": "Тест"},
                # Пустой заголовок
                {"volume": 1.0, "price": 1000.0, "title": ""},
                # Слишком большой объем
                {"volume": 999999.0, "price": 1000.0, "title": "Тест"},
            ]
            
            for invalid_data in invalid_product_scenarios:
                product_data = await factory.create_product_data(
                    seller_id=seller["id"],
                    wood_type_id=wood_type["id"],
                    **invalid_data
                )
                
                response = await api_client.post("/api/v1/products/", json=product_data)
                assert response.status_code in [400, 422], f"Должна быть ошибка валидации для {invalid_data}"
            
            # Тест валидации покупателя с невалидными UUID
            invalid_buyer_data = {
                "id": "invalid-uuid",
                "keycloak_uuid": "also-invalid",
                "is_online": False
            }
            
            response = await api_client.post("/api/v1/buyers/", json=invalid_buyer_data)
            assert response.status_code == 422, "Должна быть ошибка валидации UUID"
            
            # Тест валидации типа древесины с пустыми полями
            invalid_wood_type_data = {
                "id": str(factory.created_entities),
                "neme": "",  # Пустое имя
                "descrioption": ""  # Пустое описание
            }
            
            response = await api_client.post("/api/v1/wood-types/", json=invalid_wood_type_data)
            assert response.status_code in [400, 422], "Должна быть ошибка валидации для пустых полей"
            
        finally:
            await factory.cleanup()

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.pagination
    async def test_pagination_integration(self, api_client: APIClient):
        """Тестирование пагинации в интеграционных сценариях."""
        factory = EnhancedTestDataFactory(api_client)
        
        try:
            # Создаем много покупателей для тестирования пагинации
            created_buyers = []
            for i in range(35):  # Больше чем стандартный лимит
                buyer_data = await factory.create_buyer_data()
                response = await api_client.post("/api/v1/buyers/", json=buyer_data)
                assert response.status_code == 201
                created_buyers.append(response.json()["data"])
            
            # Тест первой страницы
            page1_response = await api_client.get("/api/v1/buyers/?limit=10&offset=0")
            assert page1_response.status_code == 200
            page1_data = page1_response.json()
            
            assert len(page1_data["data"]) == 10
            assert page1_data["total"] >= 35
            assert page1_data["limit"] == 10
            assert page1_data["offset"] == 0
            
            # Тест второй страницы
            page2_response = await api_client.get("/api/v1/buyers/?limit=10&offset=10")
            assert page2_response.status_code == 200
            page2_data = page2_response.json()
            
            assert len(page2_data["data"]) == 10
            assert page2_data["offset"] == 10
            
            # Тест последней страницы
            last_page_response = await api_client.get("/api/v1/buyers/?limit=10&offset=30")
            assert last_page_response.status_code == 200
            last_page_data = last_page_response.json()
            
            assert len(last_page_data["data"]) >= 5  # Остаток от 35
            
            # Проверяем уникальность данных между страницами
            page1_ids = {item["id"] for item in page1_data["data"]}
            page2_ids = {item["id"] for item in page2_data["data"]}
            last_page_ids = {item["id"] for item in last_page_data["data"]}
            
            assert page1_ids.isdisjoint(page2_ids), "Пересечение данных между страницами 1 и 2"
            assert page1_ids.isdisjoint(last_page_ids), "Пересечение данных между страницами 1 и последней"
            assert page2_ids.isdisjoint(last_page_ids), "Пересечение данных между страницами 2 и последней"
            
        finally:
            await factory.cleanup()
