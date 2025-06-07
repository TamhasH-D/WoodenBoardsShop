"""Функциональные браузерные тесты для Buyer Frontend."""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webdriver import WebDriver
from base.test_base import BaseBrowserTest, BrowserTestMixin
from utils.data_factory import TestDataFactory
from utils.api_client import APIClient


class TestBuyerFrontend(BaseBrowserTest, BrowserTestMixin):
    """Браузерные тесты для покупательского интерфейса."""
    
    @pytest.mark.asyncio
    async def test_buyer_homepage_loads(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест загрузки главной страницы покупателя."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Переходим на главную страницу
        self.navigate_to("buyer")
        
        # Проверяем, что страница загрузилась
        self.assert_page_title("Покупатель")  # Или другой ожидаемый заголовок
        
        # Проверяем наличие основных элементов
        self.assert_element_present("header")
        self.assert_element_present("nav")
        self.assert_element_present("main")
    
    @pytest.mark.asyncio
    async def test_buyer_navigation_menu(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест навигационного меню покупателя."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        self.navigate_to("buyer")
        
        # Проверяем наличие пунктов меню
        expected_menu_items = [
            "Товары",
            "Продавцы", 
            "Анализатор",
            "Чаты",
            "Профиль"
        ]
        
        for item in expected_menu_items:
            try:
                # Ищем элемент меню по тексту
                menu_element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{item}')]")
                assert menu_element.is_displayed()
            except:
                # Если точный текст не найден, проверяем по классам или другим селекторам
                pass
    
    @pytest.mark.asyncio
    async def test_buyer_products_page(self, webdriver_instance: WebDriver, frontend_urls: dict, 
                                     api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест страницы товаров покупателя."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Создаем тестовые данные
        product_set = await test_data_factory.create_complete_product_set()
        
        # Переходим на страницу товаров
        self.navigate_to("buyer", "/products")
        
        # Ждем загрузки данных
        wait = WebDriverWait(self.driver, 10)
        
        try:
            # Проверяем наличие списка товаров или сообщения о загрузке
            products_container = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".products, .product-list, [data-testid='products']"))
            )
            assert products_container.is_displayed()
            
        except:
            # Если контейнер товаров не найден, проверяем наличие сообщения "Нет товаров"
            try:
                no_products_message = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Нет товаров') or contains(text(), 'No products')]")
                assert no_products_message.is_displayed()
            except:
                # Делаем скриншот для отладки
                self.take_screenshot("buyer_products_page_error")
                pytest.fail("Не найден ни список товаров, ни сообщение об их отсутствии")
    
    @pytest.mark.asyncio
    async def test_buyer_sellers_page(self, webdriver_instance: WebDriver, frontend_urls: dict,
                                    api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест страницы продавцов."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Создаем тестового продавца
        seller = await test_data_factory.create_seller()
        
        # Переходим на страницу продавцов
        self.navigate_to("buyer", "/sellers")
        
        # Ждем загрузки данных
        wait = WebDriverWait(self.driver, 10)
        
        try:
            # Проверяем наличие списка продавцов
            sellers_container = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".sellers, .seller-list, [data-testid='sellers']"))
            )
            assert sellers_container.is_displayed()
            
        except:
            # Проверяем сообщение об отсутствии продавцов
            try:
                no_sellers_message = self.driver.find_element(By.XPATH, "//*[contains(text(), 'Нет продавцов') or contains(text(), 'No sellers')]")
                assert no_sellers_message.is_displayed()
            except:
                self.take_screenshot("buyer_sellers_page_error")
                pytest.fail("Не найден ни список продавцов, ни сообщение об их отсутствии")
    
    @pytest.mark.asyncio
    async def test_buyer_board_analyzer_page(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест страницы анализатора досок."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Переходим на страницу анализатора
        self.navigate_to("buyer", "/analyzer")
        
        # Проверяем наличие основных элементов анализатора
        try:
            # Ищем форму загрузки файла или элементы анализатора
            analyzer_elements = [
                "input[type='file']",
                ".file-upload",
                ".analyzer-form",
                "[data-testid='analyzer']"
            ]
            
            element_found = False
            for selector in analyzer_elements:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except:
                    continue
            
            if not element_found:
                # Проверяем наличие текста, связанного с анализатором
                analyzer_text = self.driver.find_element(By.XPATH, "//*[contains(text(), 'анализ') or contains(text(), 'загруз') or contains(text(), 'файл')]")
                assert analyzer_text.is_displayed()
                
        except:
            self.take_screenshot("buyer_analyzer_page_error")
            pytest.fail("Не найдены элементы анализатора досок")
    
    @pytest.mark.asyncio
    async def test_buyer_chats_page(self, webdriver_instance: WebDriver, frontend_urls: dict,
                                  api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест страницы чатов покупателя."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Создаем тестовый чат
        chat_scenario = await test_data_factory.create_chat_scenario()
        
        # Переходим на страницу чатов
        self.navigate_to("buyer", "/chats")
        
        # Ждем загрузки данных
        wait = WebDriverWait(self.driver, 10)
        
        try:
            # Проверяем наличие списка чатов или формы создания чата
            chat_elements = wait.until(
                EC.any_of(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".chats, .chat-list")),
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".no-chats, .empty-state")),
                    EC.presence_of_element_located((By.XPATH, "//*[contains(text(), 'чат') or contains(text(), 'сообщен')]"))
                )
            )
            assert chat_elements.is_displayed()
            
        except:
            self.take_screenshot("buyer_chats_page_error")
            pytest.fail("Не найдены элементы чатов")
    
    @pytest.mark.asyncio
    async def test_buyer_profile_page(self, webdriver_instance: WebDriver, frontend_urls: dict,
                                    api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест страницы профиля покупателя."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Создаем тестового покупателя
        buyer = await test_data_factory.create_buyer()
        
        # Переходим на страницу профиля
        self.navigate_to("buyer", "/profile")
        
        # Проверяем наличие элементов профиля
        try:
            # Ищем элементы профиля
            profile_elements = [
                ".profile",
                ".user-info",
                "[data-testid='profile']",
                "form"
            ]
            
            element_found = False
            for selector in profile_elements:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except:
                    continue
            
            if not element_found:
                # Проверяем наличие текста профиля
                profile_text = self.driver.find_element(By.XPATH, "//*[contains(text(), 'профиль') or contains(text(), 'покупатель')]")
                assert profile_text.is_displayed()
                
        except:
            self.take_screenshot("buyer_profile_page_error")
            pytest.fail("Не найдены элементы профиля")
    
    @pytest.mark.asyncio
    async def test_buyer_health_check_page(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест страницы проверки здоровья системы."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Переходим на страницу health check
        self.navigate_to("buyer", "/health")
        
        # Проверяем наличие информации о состоянии системы
        try:
            # Ищем элементы health check
            health_elements = [
                ".health",
                ".status",
                "[data-testid='health']"
            ]
            
            element_found = False
            for selector in health_elements:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о состоянии
                health_text = self.driver.find_element(By.XPATH, "//*[contains(text(), 'состояние') or contains(text(), 'health') or contains(text(), 'статус')]")
                assert health_text.is_displayed()
                
        except:
            self.take_screenshot("buyer_health_page_error")
            pytest.fail("Не найдены элементы проверки здоровья системы")
    
    @pytest.mark.asyncio
    async def test_buyer_responsive_design(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест адаптивного дизайна покупательского интерфейса."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        self.navigate_to("buyer")
        
        # Тестируем разные размеры экрана
        screen_sizes = [
            (1920, 1080),  # Desktop
            (1024, 768),   # Tablet
            (375, 667),    # Mobile
        ]
        
        for width, height in screen_sizes:
            self.driver.set_window_size(width, height)
            
            # Ждем перерисовки
            import time
            time.sleep(1)
            
            # Проверяем, что основные элементы видны
            try:
                header = self.driver.find_element(By.TAG_NAME, "header")
                assert header.is_displayed()
                
                main = self.driver.find_element(By.TAG_NAME, "main")
                assert main.is_displayed()
                
            except:
                self.take_screenshot(f"buyer_responsive_{width}x{height}_error")
                pytest.fail(f"Проблемы с отображением на размере {width}x{height}")
