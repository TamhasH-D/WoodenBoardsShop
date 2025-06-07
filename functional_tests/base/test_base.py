"""Базовые классы для функциональных тестов."""

import pytest
import asyncio
from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from selenium.webdriver.remote.webdriver import WebDriver
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory


class BaseAPITest(ABC):
    """Базовый класс для API тестов."""
    
    def __init__(self):
        self.api_client: Optional[APIClient] = None
        self.test_data_factory: Optional[TestDataFactory] = None
    
    def setup_method(self, method):
        """Настройка перед каждым тестом."""
        pass
    
    def teardown_method(self, method):
        """Очистка после каждого теста."""
        pass
    
    async def assert_response_structure(self, response: Dict[str, Any], expected_keys: list):
        """Проверка структуры ответа API."""
        assert isinstance(response, dict), "Ответ должен быть словарем"
        
        for key in expected_keys:
            assert key in response, f"Ключ '{key}' отсутствует в ответе"
    
    async def assert_data_response(self, response: Dict[str, Any], entity_id: str):
        """Проверка стандартного ответа с данными."""
        await self.assert_response_structure(response, ["data"])
        assert response["data"]["id"] == entity_id
    
    async def assert_list_response(self, response: Dict[str, Any], min_count: int = 0):
        """Проверка ответа со списком данных."""
        await self.assert_response_structure(response, ["data", "total", "limit", "offset"])
        assert isinstance(response["data"], list)
        assert response["total"] >= min_count
        assert len(response["data"]) >= min_count
    
    async def assert_empty_response(self, response: Dict[str, Any]):
        """Проверка пустого ответа."""
        # Для DELETE операций обычно возвращается пустой ответ
        assert response is not None


class BaseBrowserTest(ABC):
    """Базовый класс для браузерных тестов."""
    
    def __init__(self):
        self.driver: Optional[WebDriver] = None
        self.frontend_urls: Optional[Dict[str, str]] = None
    
    def setup_method(self, method):
        """Настройка перед каждым тестом."""
        pass
    
    def teardown_method(self, method):
        """Очистка после каждого теста."""
        if self.driver:
            self.driver.quit()
    
    def take_screenshot(self, name: str):
        """Создание скриншота."""
        if self.driver:
            screenshot_path = f"screenshots/{name}.png"
            self.driver.save_screenshot(screenshot_path)
            return screenshot_path
        return None
    
    def wait_for_page_load(self, timeout: int = 10):
        """Ожидание загрузки страницы."""
        if self.driver:
            self.driver.implicitly_wait(timeout)
    
    def navigate_to(self, app: str, path: str = ""):
        """Навигация к определенной странице."""
        if self.driver and self.frontend_urls:
            url = f"{self.frontend_urls[app]}{path}"
            self.driver.get(url)
            self.wait_for_page_load()


class BaseIntegrationTest(BaseAPITest, BaseBrowserTest):
    """Базовый класс для интеграционных тестов."""
    
    def __init__(self):
        BaseAPITest.__init__(self)
        BaseBrowserTest.__init__(self)
    
    async def create_test_scenario(self) -> Dict[str, Any]:
        """Создание тестового сценария с данными."""
        if self.test_data_factory:
            return await self.test_data_factory.create_complete_product_set()
        return {}
    
    async def verify_api_data_in_browser(self, entity_type: str, entity_id: str, app: str):
        """Проверка, что данные из API отображаются в браузере."""
        # Получаем данные через API
        if entity_type == "product":
            api_data = await self.api_client.get_product(entity_id)
        elif entity_type == "seller":
            api_data = await self.api_client.get_seller(entity_id)
        elif entity_type == "buyer":
            api_data = await self.api_client.get_buyer(entity_id)
        else:
            raise ValueError(f"Неподдерживаемый тип сущности: {entity_type}")
        
        # Переходим в браузер и проверяем отображение
        self.navigate_to(app)
        
        # Здесь должна быть логика проверки отображения данных
        # Это будет реализовано в конкретных тестах
        
        return api_data


class APITestMixin:
    """Миксин с общими методами для API тестов."""
    
    async def test_create_entity(self, create_method, entity_data: Dict[str, Any]):
        """Общий тест создания сущности."""
        response = await create_method(entity_data)
        
        assert response is not None
        assert "data" in response
        assert response["data"]["id"] == entity_data["id"]
        
        return response
    
    async def test_get_entity(self, get_method, entity_id: str):
        """Общий тест получения сущности."""
        response = await get_method(entity_id)
        
        assert response is not None
        assert "data" in response
        assert response["data"]["id"] == entity_id
        
        return response
    
    async def test_update_entity(self, update_method, entity_id: str, update_data: Dict[str, Any]):
        """Общий тест обновления сущности."""
        response = await update_method(entity_id, update_data)
        
        # Для PATCH обычно возвращается пустой ответ
        assert response is not None
        
        return response
    
    async def test_delete_entity(self, delete_method, entity_id: str):
        """Общий тест удаления сущности."""
        response = await delete_method(entity_id)
        
        # Для DELETE обычно возвращается пустой ответ
        assert response is not None
        
        return response
    
    async def test_list_entities(self, list_method, min_count: int = 0):
        """Общий тест получения списка сущностей."""
        response = await list_method()
        
        assert response is not None
        assert "data" in response
        assert isinstance(response["data"], list)
        assert len(response["data"]) >= min_count
        
        return response


class BrowserTestMixin:
    """Миксин с общими методами для браузерных тестов."""
    
    def assert_page_title(self, expected_title: str):
        """Проверка заголовка страницы."""
        if self.driver:
            actual_title = self.driver.title
            assert expected_title in actual_title, f"Ожидался заголовок '{expected_title}', получен '{actual_title}'"
    
    def assert_element_present(self, selector: str):
        """Проверка наличия элемента на странице."""
        if self.driver:
            elements = self.driver.find_elements("css selector", selector)
            assert len(elements) > 0, f"Элемент с селектором '{selector}' не найден"
    
    def assert_element_text(self, selector: str, expected_text: str):
        """Проверка текста элемента."""
        if self.driver:
            element = self.driver.find_element("css selector", selector)
            actual_text = element.text
            assert expected_text in actual_text, f"Ожидался текст '{expected_text}', получен '{actual_text}'"
    
    def click_element(self, selector: str):
        """Клик по элементу."""
        if self.driver:
            element = self.driver.find_element("css selector", selector)
            element.click()
    
    def fill_input(self, selector: str, value: str):
        """Заполнение поля ввода."""
        if self.driver:
            element = self.driver.find_element("css selector", selector)
            element.clear()
            element.send_keys(value)
    
    def wait_for_element(self, selector: str, timeout: int = 10):
        """Ожидание появления элемента."""
        if self.driver:
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.common.by import By
            
            wait = WebDriverWait(self.driver, timeout)
            return wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
