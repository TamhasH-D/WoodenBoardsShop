"""
Базовые API тесты для проверки работоспособности системы
"""
import pytest
import requests
import os


class TestBasicAPI:
    """Базовые тесты API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Настройка для каждого теста"""
        self.backend_url = os.getenv('BACKEND_URL', 'http://test-backend:8000')
        
    def test_health_check(self):
        """Тест health check endpoint"""
        response = requests.get(f'{self.backend_url}/api/v1/health')
        assert response.status_code == 200
        assert response.json() is True
        
    def test_wood_types_list(self):
        """Тест получения списка типов древесины"""
        response = requests.get(f'{self.backend_url}/api/v1/wood-types')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Найдено типов древесины: {len(data)}")
        
    def test_buyers_list(self):
        """Тест получения списка покупателей"""
        response = requests.get(f'{self.backend_url}/api/v1/buyers')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Найдено покупателей: {len(data)}")
        
    def test_sellers_list(self):
        """Тест получения списка продавцов"""
        response = requests.get(f'{self.backend_url}/api/v1/sellers')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Найдено продавцов: {len(data)}")
        
    def test_products_list(self):
        """Тест получения списка товаров"""
        response = requests.get(f'{self.backend_url}/api/v1/products')
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Найдено товаров: {len(data)}")
        
    def test_api_endpoints_availability(self):
        """Тест доступности основных API endpoints"""
        endpoints = [
            '/api/v1/health',
            '/api/v1/wood-types',
            '/api/v1/buyers',
            '/api/v1/sellers',
            '/api/v1/products'
        ]
        
        results = {}
        for endpoint in endpoints:
            try:
                response = requests.get(f'{self.backend_url}{endpoint}')
                results[endpoint] = response.status_code
            except Exception as e:
                results[endpoint] = f"ERROR: {e}"
                
        print("Результаты проверки endpoints:")
        for endpoint, status in results.items():
            print(f"  {endpoint}: {status}")
            
        # Все endpoints должны возвращать 200
        for endpoint, status in results.items():
            assert status == 200, f"Endpoint {endpoint} вернул {status}"


if __name__ == "__main__":
    # Запуск тестов напрямую
    pytest.main([__file__, "-v"])
