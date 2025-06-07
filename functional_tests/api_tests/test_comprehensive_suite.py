"""
Comprehensive API Test Suite.
Полный набор тестов для проверки всех endpoints и интеграций.
"""

import pytest
import httpx
import time
from typing import Dict, List, Any

from api_tests.api_client import (
    assert_response_success,
    generate_test_data,
    validate_entity_fields,
)


class APITestSuite:
    """Класс для комплексного тестирования API."""
    
    def __init__(self, base_url: str = "http://test-backend:8000"):
        self.base_url = base_url
        self.created_entities: Dict[str, List[Dict[str, Any]]] = {
            "buyers": [],
            "sellers": [],
            "wood_types": [],
            "wood_type_prices": [],
            "products": [],
            "images": [],
            "wooden_boards": [],
            "chat_threads": [],
        }
        self.test_results: Dict[str, Dict[str, Any]] = {}
    
    async def run_comprehensive_tests(self) -> Dict[str, Any]:
        """Запуск полного набора тестов."""
        async with httpx.AsyncClient(base_url=self.base_url, timeout=60.0) as client:
            start_time = time.time()
            
            # 1. Тестируем базовые CRUD операции
            await self._test_basic_crud(client)
            
            # 2. Тестируем зависимости между сущностями
            await self._test_entity_dependencies(client)
            
            # 3. Тестируем специальные endpoints
            await self._test_special_endpoints(client)
            
            # 4. Тестируем производительность
            await self._test_performance(client)
            
            # 5. Тестируем валидацию и ошибки
            await self._test_validation_and_errors(client)
            
            end_time = time.time()
            
            return {
                "total_time": end_time - start_time,
                "created_entities": self.created_entities,
                "test_results": self.test_results,
                "summary": self._generate_summary()
            }
    
    async def _test_basic_crud(self, client: httpx.AsyncClient) -> None:
        """Тестирование базовых CRUD операций."""
        entities = [
            ("buyer", "/api/v1/buyers/"),
            ("seller", "/api/v1/sellers/"),
            ("wood_type", "/api/v1/wood-types/"),
        ]
        
        for entity_type, endpoint in entities:
            try:
                # CREATE
                data = generate_test_data(entity_type)
                response = await client.post(endpoint, json=data)
                created = assert_response_success(response, 201)
                self.created_entities[f"{entity_type}s"].append(created)
                
                # READ (list)
                response = await client.get(endpoint)
                entities_list = assert_response_success(response, 200)
                assert isinstance(entities_list, list)
                
                # READ (by ID)
                response = await client.get(f"{endpoint}{created['id']}")
                retrieved = assert_response_success(response, 200)
                validate_entity_fields(retrieved, entity_type)
                
                # UPDATE (PATCH)
                if entity_type == "wood_type":
                    update_data = {"description": f"Updated {entity_type}"}
                else:
                    update_data = {"is_online": not created["is_online"]}
                
                response = await client.patch(f"{endpoint}{created['id']}", json=update_data)
                assert_response_success(response, 200)
                
                self.test_results[f"{entity_type}_crud"] = {"status": "PASSED"}
                
            except Exception as e:
                self.test_results[f"{entity_type}_crud"] = {"status": "FAILED", "error": str(e)}
    
    async def _test_entity_dependencies(self, client: httpx.AsyncClient) -> None:
        """Тестирование зависимостей между сущностями."""
        try:
            # Создаем цепочку зависимостей: seller -> wood_type -> product -> image
            seller = self.created_entities["sellers"][0]
            wood_type = self.created_entities["wood_types"][0]
            
            # Создаем wood_type_price
            price_data = generate_test_data("wood_type_price")
            price_data["wood_type_id"] = wood_type["id"]
            response = await client.post("/api/v1/wood-type-prices/", json=price_data)
            created_price = assert_response_success(response, 201)
            self.created_entities["wood_type_prices"].append(created_price)
            
            # Создаем product
            product_data = generate_test_data("product")
            product_data["seller_id"] = seller["id"]
            product_data["wood_type_id"] = wood_type["id"]
            response = await client.post("/api/v1/products/", json=product_data)
            created_product = assert_response_success(response, 201)
            self.created_entities["products"].append(created_product)
            
            # Создаем image
            image_data = generate_test_data("image")
            image_data["product_id"] = created_product["id"]
            response = await client.post("/api/v1/images/", json=image_data)
            created_image = assert_response_success(response, 201)
            self.created_entities["images"].append(created_image)
            
            # Создаем wooden_board
            board_data = generate_test_data("wooden_board")
            board_data["image_id"] = created_image["id"]
            response = await client.post("/api/v1/wooden-boards/", json=board_data)
            created_board = assert_response_success(response, 201)
            self.created_entities["wooden_boards"].append(created_board)
            
            # Создаем chat_thread
            buyer = self.created_entities["buyers"][0]
            chat_data = generate_test_data("chat_thread")
            chat_data["buyer_id"] = buyer["id"]
            chat_data["seller_id"] = seller["id"]
            response = await client.post("/api/v1/chat-threads/", json=chat_data)
            created_chat = assert_response_success(response, 201)
            self.created_entities["chat_threads"].append(created_chat)
            
            self.test_results["entity_dependencies"] = {"status": "PASSED"}
            
        except Exception as e:
            self.test_results["entity_dependencies"] = {"status": "FAILED", "error": str(e)}
    
    async def _test_special_endpoints(self, client: httpx.AsyncClient) -> None:
        """Тестирование специальных endpoints."""
        try:
            # Тестируем calculate-volume
            volume_data = {
                "length": 2.0,
                "width": 0.15,
                "thickness": 0.025
            }
            response = await client.post("/api/v1/wooden-boards/calculate-volume", json=volume_data)
            volume_result = assert_response_success(response, 200)
            assert "volume" in volume_result
            
            # Тестируем health endpoint
            response = await client.get("/api/v1/health")
            health_result = assert_response_success(response, 200)
            
            self.test_results["special_endpoints"] = {"status": "PASSED"}
            
        except Exception as e:
            self.test_results["special_endpoints"] = {"status": "FAILED", "error": str(e)}
    
    async def _test_performance(self, client: httpx.AsyncClient) -> None:
        """Тестирование производительности."""
        try:
            start_time = time.time()
            
            # Создаем 5 покупателей параллельно
            tasks = []
            for i in range(5):
                buyer_data = generate_test_data("buyer")
                tasks.append(client.post("/api/v1/buyers/", json=buyer_data))
            
            # Выполняем запросы (в данном случае последовательно, но можно использовать asyncio.gather)
            for task in tasks:
                response = await task
                assert_response_success(response, 201)
            
            end_time = time.time()
            creation_time = end_time - start_time
            
            # Проверяем, что создание 5 покупателей заняло менее 10 секунд
            assert creation_time < 10.0, f"Creating 5 buyers took too long: {creation_time:.2f}s"
            
            self.test_results["performance"] = {
                "status": "PASSED",
                "creation_time": creation_time,
                "entities_created": 5
            }
            
        except Exception as e:
            self.test_results["performance"] = {"status": "FAILED", "error": str(e)}
    
    async def _test_validation_and_errors(self, client: httpx.AsyncClient) -> None:
        """Тестирование валидации и обработки ошибок."""
        try:
            # Тест невалидных данных
            invalid_buyer = {
                "id": "invalid-uuid",
                "keycloak_uuid": "also-invalid",
                "is_online": "not-a-boolean"
            }
            response = await client.post("/api/v1/buyers/", json=invalid_buyer)
            assert response.status_code in [400, 422]
            
            # Тест несуществующего ID
            response = await client.get("/api/v1/buyers/550e8400-e29b-41d4-a716-446655440000")
            assert response.status_code == 404
            
            # Тест отсутствующих полей
            incomplete_data = {"id": "550e8400-e29b-41d4-a716-446655440001"}
            response = await client.post("/api/v1/wood-types/", json=incomplete_data)
            assert response.status_code in [400, 422]
            
            self.test_results["validation_and_errors"] = {"status": "PASSED"}
            
        except Exception as e:
            self.test_results["validation_and_errors"] = {"status": "FAILED", "error": str(e)}
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Генерация сводки результатов тестирования."""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result["status"] == "PASSED")
        failed_tests = total_tests - passed_tests
        
        total_entities = sum(len(entities) for entities in self.created_entities.values())
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": (passed_tests / total_tests * 100) if total_tests > 0 else 0,
            "total_entities_created": total_entities,
            "entities_breakdown": {k: len(v) for k, v in self.created_entities.items()},
            "status": "PASSED" if failed_tests == 0 else "FAILED"
        }


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.comprehensive
@pytest.mark.integration
@pytest.mark.slow
async def test_comprehensive_api_suite() -> None:
    """Комплексный тест всего API."""
    suite = APITestSuite()
    results = await suite.run_comprehensive_tests()
    
    # Выводим результаты
    print("\n" + "="*80)
    print("COMPREHENSIVE API TEST RESULTS")
    print("="*80)
    
    summary = results["summary"]
    print(f"Total Tests: {summary['total_tests']}")
    print(f"Passed: {summary['passed_tests']}")
    print(f"Failed: {summary['failed_tests']}")
    print(f"Success Rate: {summary['success_rate']:.1f}%")
    print(f"Total Time: {results['total_time']:.2f} seconds")
    print(f"Entities Created: {summary['total_entities_created']}")
    
    print("\nEntities Breakdown:")
    for entity_type, count in summary["entities_breakdown"].items():
        print(f"  {entity_type}: {count}")
    
    print("\nTest Results:")
    for test_name, result in results["test_results"].items():
        status = result["status"]
        print(f"  {test_name}: {status}")
        if status == "FAILED" and "error" in result:
            print(f"    Error: {result['error']}")
    
    print("="*80)
    
    # Проверяем, что все тесты прошли
    assert summary["status"] == "PASSED", f"Comprehensive test suite failed. {summary['failed_tests']} tests failed."


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.smoke
@pytest.mark.fast
async def test_api_smoke_test() -> None:
    """Быстрый smoke test основных endpoints."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Проверяем health endpoint
        response = await client.get("/api/v1/health")
        assert_response_success(response, 200)
        
        # Проверяем основные GET endpoints
        endpoints = [
            "/api/v1/buyers/",
            "/api/v1/sellers/",
            "/api/v1/wood-types/",
            "/api/v1/products/",
            "/api/v1/images/",
            "/api/v1/wooden-boards/",
            "/api/v1/wood-type-prices/",
            "/api/v1/chat-threads/",
        ]
        
        for endpoint in endpoints:
            response = await client.get(endpoint)
            assert response.status_code == 200, f"Endpoint {endpoint} failed with {response.status_code}"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.endpoints
@pytest.mark.fast
async def test_all_endpoints_availability() -> None:
    """Тест доступности всех endpoints."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Получаем список всех endpoints из OpenAPI
        response = await client.get("/openapi.json")
        openapi_data = assert_response_success(response, 200)
        
        paths = openapi_data.get("paths", {})
        
        # Проверяем каждый GET endpoint
        for path in paths:
            if not path.startswith("/api/v1/"):
                continue
                
            # Пропускаем endpoints с параметрами
            if "{" in path:
                continue
                
            try:
                response = await client.get(path)
                assert response.status_code in [200, 404, 405], (
                    f"Endpoint {path} returned unexpected status {response.status_code}"
                )
            except Exception as e:
                pytest.fail(f"Failed to test endpoint {path}: {e}")


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.stress
@pytest.mark.slow
async def test_api_stress_test() -> None:
    """Стресс-тест API с множественными запросами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=60.0) as client:
        start_time = time.time()
        
        # Создаем 20 покупателей
        for i in range(20):
            buyer_data = generate_test_data("buyer")
            response = await client.post("/api/v1/buyers/", json=buyer_data)
            assert_response_success(response, 201)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Проверяем производительность (не более 30 секунд на 20 создания)
        assert total_time < 30.0, f"Creating 20 buyers took too long: {total_time:.2f} seconds"
        
        # Проверяем, что все покупатели созданы
        response = await client.get("/api/v1/buyers/")
        buyers_list = assert_response_success(response, 200)
        assert len(buyers_list) >= 20, f"Expected at least 20 buyers, got {len(buyers_list)}"
