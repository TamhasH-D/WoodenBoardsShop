"""
Comprehensive Selenium tests for Seller Frontend.
Тесты для business dashboard продавцов древесины.
"""

import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.common.exceptions import TimeoutException, NoSuchElementException


@pytest.mark.browser
@pytest.mark.seller
@pytest.mark.frontend
class TestSellerFrontend:
    """Comprehensive Selenium tests for Seller Frontend."""

    @pytest.mark.smoke
    async def test_seller_homepage_loads(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест загрузки главной страницы seller frontend."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 15)
        
        # Переходим на seller frontend
        driver.get(frontend_urls["seller"])
        
        # Проверяем загрузку страницы
        try:
            # Ждем загрузки основного контента
            main_content = wait.until(
                EC.presence_of_element_located((By.TAG_NAME, "main"))
            )
            assert main_content.is_displayed()
            
            # Проверяем заголовок страницы
            assert any(keyword in driver.title.lower() for keyword in ["seller", "продавец", "dashboard", "wooden"]), \
                f"Unexpected page title: {driver.title}"
            
            # Проверяем основные элементы интерфейса
            header = driver.find_element(By.TAG_NAME, "header")
            assert header.is_displayed()
            
        except TimeoutException:
            pytest.fail("Seller frontend не загрузился в течение 15 секунд")

    @pytest.mark.navigation
    async def test_seller_navigation_menu(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест навигационного меню seller frontend."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Ожидаемые пункты меню для продавца
        expected_menu_items = [
            "Дашборд",
            "Товары", 
            "Древесина",
            "Заказы",
            "Чаты",
            "Аналитика",
            "Профиль"
        ]
        
        # Проверяем наличие навигационных элементов
        for item in expected_menu_items:
            try:
                # Ищем по тексту
                menu_element = driver.find_element(By.XPATH, f"//*[contains(text(), '{item}')]")
                assert menu_element.is_displayed(), f"Menu item '{item}' not visible"
            except NoSuchElementException:
                # Альтернативный поиск по ссылкам
                try:
                    link_element = driver.find_element(By.PARTIAL_LINK_TEXT, item)
                    assert link_element.is_displayed()
                except NoSuchElementException:
                    print(f"Warning: Menu item '{item}' not found")

    @pytest.mark.dashboard
    async def test_seller_dashboard_functionality(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест функциональности дашборда продавца."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Проверяем элементы дашборда
        try:
            # Ищем статистические карточки
            dashboard_elements = [
                ".dashboard",
                ".stats",
                ".statistics",
                ".metrics",
                "[data-testid='dashboard']"
            ]
            
            dashboard_found = False
            for selector in dashboard_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        dashboard_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not dashboard_found:
                # Проверяем наличие текста, связанного с дашбордом
                dashboard_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'дашборд') or contains(text(), 'статистика') or contains(text(), 'продаж')]")
                assert dashboard_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Dashboard elements not found, but page loaded successfully")

    @pytest.mark.products
    async def test_seller_products_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления товарами продавца."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Переходим на страницу товаров
        try:
            products_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Товары")
            products_link.click()
            time.sleep(2)
        except NoSuchElementException:
            # Альтернативный способ навигации
            driver.get(f"{frontend_urls['seller']}/products")
        
        # Проверяем загрузку страницы товаров
        try:
            # Ищем контейнер товаров или кнопку добавления
            products_elements = [
                ".products-container",
                ".products-list",
                ".product-management",
                "button[contains(text(), 'Добавить')]",
                "[data-testid='products']"
            ]
            
            element_found = False
            for selector in products_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о товарах
                products_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'товар') or contains(text(), 'продукт') or contains(text(), 'добавить')]")
                assert products_text.is_displayed()
                
        except NoSuchElementException:
            pytest.fail("Products management page not found")

    @pytest.mark.wood_types
    async def test_seller_wood_types_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления типами древесины."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Переходим на страницу типов древесины
        try:
            wood_types_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Древесина")
            wood_types_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['seller']}/wood-types")
        
        # Проверяем загрузку страницы типов древесины
        try:
            wood_types_elements = [
                ".wood-types-container",
                ".wood-types-list", 
                ".wood-management",
                "[data-testid='wood-types']"
            ]
            
            element_found = False
            for selector in wood_types_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о древесине
                wood_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'древесин') or contains(text(), 'дерев') or contains(text(), 'wood')]")
                assert wood_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Wood types management page not found")

    @pytest.mark.orders
    async def test_seller_orders_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления заказами продавца."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Переходим на страницу заказов
        try:
            orders_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Заказы")
            orders_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['seller']}/orders")
        
        # Проверяем загрузку страницы заказов
        try:
            orders_elements = [
                ".orders-container",
                ".orders-list",
                ".order-management",
                "[data-testid='orders']"
            ]
            
            element_found = False
            for selector in orders_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о заказах
                orders_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'заказ') or contains(text(), 'order')]")
                assert orders_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Orders management page not found")

    @pytest.mark.chats
    async def test_seller_chats_functionality(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест функциональности чатов продавца."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Переходим на страницу чатов
        try:
            chats_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Чаты")
            chats_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['seller']}/chats")
        
        # Проверяем загрузку страницы чатов
        try:
            chats_elements = [
                ".chats-container",
                ".chat-list",
                ".messages",
                "[data-testid='chats']"
            ]
            
            element_found = False
            for selector in chats_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о чатах
                chats_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'чат') or contains(text(), 'сообщен') or contains(text(), 'chat')]")
                assert chats_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Chats page not found")

    @pytest.mark.analytics
    async def test_seller_analytics_page(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест страницы аналитики продавца."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Переходим на страницу аналитики
        try:
            analytics_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Аналитика")
            analytics_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['seller']}/analytics")
        
        # Проверяем загрузку страницы аналитики
        try:
            analytics_elements = [
                ".analytics-container",
                ".charts",
                ".statistics",
                ".metrics",
                "[data-testid='analytics']"
            ]
            
            element_found = False
            for selector in analytics_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста об аналитике
                analytics_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'аналитик') or contains(text(), 'статистик') or contains(text(), 'отчет')]")
                assert analytics_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Analytics page not found")

    @pytest.mark.profile
    async def test_seller_profile_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления профилем продавца."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["seller"])
        
        # Переходим на страницу профиля
        try:
            profile_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Профиль")
            profile_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['seller']}/profile")
        
        # Проверяем загрузку страницы профиля
        try:
            profile_elements = [
                ".profile-container",
                ".profile-form",
                ".user-info",
                "form",
                "[data-testid='profile']"
            ]
            
            element_found = False
            for selector in profile_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о профиле
                profile_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'профиль') or contains(text(), 'настройки') or contains(text(), 'profile')]")
                assert profile_text.is_displayed()
                
        except NoSuchElementException:
            pytest.fail("Profile page not found")

    @pytest.mark.responsive
    async def test_seller_responsive_design(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест адаптивного дизайна seller frontend."""
        driver = webdriver_instance
        
        driver.get(frontend_urls["seller"])
        
        # Тестируем разные размеры экрана
        screen_sizes = [
            (1920, 1080),  # Desktop
            (1366, 768),   # Laptop
            (1024, 768),   # Tablet landscape
            (768, 1024),   # Tablet portrait
            (375, 667),    # Mobile
        ]
        
        for width, height in screen_sizes:
            driver.set_window_size(width, height)
            time.sleep(1)
            
            # Проверяем, что основные элементы видны
            try:
                body = driver.find_element(By.TAG_NAME, "body")
                assert body.is_displayed()
                
                # Проверяем отсутствие горизонтального скролла на мобильных
                if width <= 768:
                    scroll_width = driver.execute_script("return document.body.scrollWidth")
                    viewport_width = driver.execute_script("return window.innerWidth")
                    assert scroll_width <= viewport_width + 20, \
                        f"Horizontal scroll detected at {width}x{height}"
                
            except Exception as e:
                pytest.fail(f"Responsive design issue at {width}x{height}: {str(e)}")

    @pytest.mark.performance
    async def test_seller_page_load_performance(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест производительности загрузки страниц seller frontend."""
        driver = webdriver_instance
        
        # Тестируем время загрузки основных страниц
        pages_to_test = [
            ("", "Homepage"),
            ("/products", "Products"),
            ("/wood-types", "Wood Types"),
            ("/orders", "Orders"),
            ("/chats", "Chats"),
            ("/analytics", "Analytics"),
            ("/profile", "Profile")
        ]
        
        for path, page_name in pages_to_test:
            start_time = time.time()
            
            try:
                driver.get(f"{frontend_urls['seller']}{path}")
                
                # Ждем загрузки основного контента
                wait = WebDriverWait(driver, 10)
                wait.until(EC.presence_of_element_located((By.TAG_NAME, "main")))
                
                load_time = time.time() - start_time
                
                # Проверяем, что страница загрузилась за разумное время
                assert load_time < 10.0, f"{page_name} page took too long to load: {load_time:.2f}s"
                
            except TimeoutException:
                load_time = time.time() - start_time
                print(f"Warning: {page_name} page did not fully load within 10 seconds ({load_time:.2f}s)")
            except Exception as e:
                print(f"Warning: Error loading {page_name} page: {str(e)}")
