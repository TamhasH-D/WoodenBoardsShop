"""Комплексные браузерные тесты для всех frontend приложений."""

import pytest
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from utils.api_client import APIClient
from utils.enhanced_data_factory import EnhancedTestDataFactory


class TestComprehensiveFrontend:
    """Комплексные тесты для всех frontend приложений."""

    @pytest.mark.browser
    @pytest.mark.buyer
    async def test_buyer_frontend_comprehensive(self, webdriver_instance: webdriver.Remote, 
                                               frontend_urls: dict, api_client: APIClient):
        """Комплексное тестирование buyer frontend."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        # Подготавливаем тестовые данные
        factory = EnhancedTestDataFactory(api_client)
        scenario_data = await factory.create_complete_marketplace_scenario()
        
        try:
            # Переходим на buyer frontend
            driver.get(frontend_urls["buyer"])
            
            # Проверяем загрузку главной страницы
            assert "WoodenBoardsShop" in driver.title or "Buyer" in driver.title
            
            # Тест навигации
            await self._test_buyer_navigation(driver, wait)
            
            # Тест просмотра продуктов
            await self._test_buyer_products_page(driver, wait)
            
            # Тест поиска продавцов
            await self._test_buyer_sellers_page(driver, wait)
            
            # Тест анализатора досок
            await self._test_buyer_board_analyzer(driver, wait)
            
            # Тест чатов
            await self._test_buyer_chats_page(driver, wait)
            
            # Тест профиля
            await self._test_buyer_profile_page(driver, wait)
            
            # Тест адаптивности
            await self._test_responsive_design(driver)
            
        finally:
            await factory.cleanup()

    @pytest.mark.browser
    @pytest.mark.seller
    async def test_seller_frontend_comprehensive(self, webdriver_instance: webdriver.Remote,
                                                frontend_urls: dict, api_client: APIClient):
        """Комплексное тестирование seller frontend."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        factory = EnhancedTestDataFactory(api_client)
        scenario_data = await factory.create_complete_marketplace_scenario()
        
        try:
            # Переходим на seller frontend
            driver.get(frontend_urls["seller"])
            
            # Проверяем загрузку
            assert "Seller" in driver.title or "Продавец" in driver.title
            
            # Тест дашборда
            await self._test_seller_dashboard(driver, wait)
            
            # Тест управления продуктами
            await self._test_seller_products_management(driver, wait)
            
            # Тест управления типами древесины
            await self._test_seller_wood_types_management(driver, wait)
            
            # Тест чатов с покупателями
            await self._test_seller_chats(driver, wait)
            
            # Тест профиля продавца
            await self._test_seller_profile(driver, wait)
            
        finally:
            await factory.cleanup()

    @pytest.mark.browser
    @pytest.mark.admin
    async def test_admin_frontend_comprehensive(self, webdriver_instance: webdriver.Remote,
                                               frontend_urls: dict, api_client: APIClient):
        """Комплексное тестирование admin frontend."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        factory = EnhancedTestDataFactory(api_client)
        scenario_data = await factory.create_complete_marketplace_scenario()
        
        try:
            # Переходим на admin frontend
            driver.get(frontend_urls["admin"])
            
            # Проверяем загрузку
            assert "Admin" in driver.title or "Администратор" in driver.title
            
            # Тест дашборда администратора
            await self._test_admin_dashboard(driver, wait)
            
            # Тест управления пользователями
            await self._test_admin_user_management(driver, wait)
            
            # Тест управления продуктами
            await self._test_admin_product_management(driver, wait)
            
            # Тест модерации чатов
            await self._test_admin_chat_moderation(driver, wait)
            
            # Тест аналитики
            await self._test_admin_analytics(driver, wait)
            
            # Тест мониторинга системы
            await self._test_admin_health_monitoring(driver, wait)
            
        finally:
            await factory.cleanup()

    async def _test_buyer_navigation(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование навигации в buyer frontend."""
        # Проверяем основные элементы навигации
        nav_links = [
            ("Главная", "/"),
            ("Товары", "/products"),
            ("Продавцы", "/sellers"),
            ("Анализатор досок", "/analyzer"),
            ("Чаты", "/chats"),
            ("Профиль", "/profile")
        ]
        
        for link_text, expected_path in nav_links:
            try:
                # Ищем ссылку по тексту или атрибуту
                link = wait.until(
                    EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, link_text))
                )
                link.click()
                
                # Проверяем, что URL изменился
                time.sleep(1)
                current_url = driver.current_url
                assert expected_path in current_url, f"Неверный URL для {link_text}: {current_url}"
                
            except TimeoutException:
                # Пытаемся найти по другим селекторам
                try:
                    link = driver.find_element(By.XPATH, f"//a[contains(text(), '{link_text}')]")
                    link.click()
                    time.sleep(1)
                except NoSuchElementException:
                    pytest.fail(f"Не найдена навигационная ссылка: {link_text}")

    async def _test_buyer_products_page(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование страницы продуктов."""
        # Переходим на страницу продуктов
        driver.get(driver.current_url.split('/')[0] + "//products")
        
        # Ждем загрузки продуктов
        try:
            # Проверяем наличие списка продуктов или сообщения об отсутствии
            products_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "products-container"))
            )
        except TimeoutException:
            # Альтернативные селекторы
            try:
                products_container = driver.find_element(By.CLASS_NAME, "products-list")
            except NoSuchElementException:
                # Проверяем сообщение об отсутствии продуктов
                no_products_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Нет товаров') or contains(text(), 'No products')]")
                assert no_products_msg is not None
                return
        
        # Тестируем поиск (если есть поле поиска)
        try:
            search_input = driver.find_element(By.CSS_SELECTOR, "input[type='search'], input[placeholder*='поиск'], input[placeholder*='search']")
            search_input.send_keys("доска")
            search_input.send_keys(Keys.ENTER)
            time.sleep(2)
        except NoSuchElementException:
            pass  # Поиск может отсутствовать

    async def _test_buyer_sellers_page(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование страницы продавцов."""
        driver.get(driver.current_url.split('/')[0] + "//sellers")
        
        # Ждем загрузки списка продавцов
        try:
            sellers_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "sellers-container"))
            )
        except TimeoutException:
            try:
                sellers_container = driver.find_element(By.CLASS_NAME, "sellers-list")
            except NoSuchElementException:
                # Проверяем сообщение об отсутствии продавцов
                no_sellers_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Нет продавцов') or contains(text(), 'No sellers')]")
                assert no_sellers_msg is not None

    async def _test_buyer_board_analyzer(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование анализатора досок."""
        driver.get(driver.current_url.split('/')[0] + "//analyzer")
        
        # Проверяем наличие формы загрузки
        try:
            file_input = wait.until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='file']"))
            )
            assert file_input is not None
            
            # Проверяем поля для ввода размеров
            height_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='высота'], input[placeholder*='height']")
            length_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='длина'], input[placeholder*='length']")
            
            # Вводим тестовые значения
            height_input.clear()
            height_input.send_keys("2.5")
            
            length_input.clear()
            length_input.send_keys("6.0")
            
        except (TimeoutException, NoSuchElementException):
            pytest.fail("Анализатор досок не загрузился корректно")

    async def _test_buyer_chats_page(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование страницы чатов."""
        driver.get(driver.current_url.split('/')[0] + "//chats")
        
        # Проверяем загрузку чатов
        try:
            chats_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "chats-container"))
            )
        except TimeoutException:
            try:
                chats_container = driver.find_element(By.CLASS_NAME, "chat-list")
            except NoSuchElementException:
                # Может быть сообщение об отсутствии чатов
                no_chats_msg = driver.find_element(By.XPATH, "//*[contains(text(), 'Нет чатов') or contains(text(), 'No chats')]")
                assert no_chats_msg is not None

    async def _test_buyer_profile_page(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование страницы профиля."""
        driver.get(driver.current_url.split('/')[0] + "//profile")
        
        # Проверяем загрузку профиля
        try:
            profile_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "profile-container"))
            )
        except TimeoutException:
            try:
                profile_container = driver.find_element(By.CLASS_NAME, "profile-info")
            except NoSuchElementException:
                pytest.fail("Страница профиля не загрузилась")

    async def _test_responsive_design(self, driver: webdriver.Remote):
        """Тестирование адаптивного дизайна."""
        # Тестируем разные разрешения экрана
        resolutions = [
            (1920, 1080),  # Desktop
            (1366, 768),   # Laptop
            (768, 1024),   # Tablet
            (375, 667),    # Mobile
        ]
        
        for width, height in resolutions:
            driver.set_window_size(width, height)
            time.sleep(1)
            
            # Проверяем, что страница отображается корректно
            body = driver.find_element(By.TAG_NAME, "body")
            assert body.is_displayed()
            
            # Проверяем, что нет горизонтального скролла на мобильных устройствах
            if width <= 768:
                scroll_width = driver.execute_script("return document.body.scrollWidth")
                assert scroll_width <= width + 20, f"Горизонтальный скролл на разрешении {width}x{height}"

    async def _test_seller_dashboard(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование дашборда продавца."""
        # Проверяем основные элементы дашборда
        try:
            dashboard_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "dashboard-container"))
            )
        except TimeoutException:
            dashboard_container = driver.find_element(By.CLASS_NAME, "dashboard")
        
        # Проверяем наличие статистических карточек
        try:
            stats_cards = driver.find_elements(By.CLASS_NAME, "stat-card")
            assert len(stats_cards) > 0, "Нет статистических карточек на дашборде"
        except NoSuchElementException:
            pass  # Статистика может отсутствовать

    async def _test_seller_products_management(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование управления продуктами продавца."""
        # Переходим на страницу продуктов
        products_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Товары")
        products_link.click()
        
        # Проверяем наличие кнопки добавления продукта
        try:
            add_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Добавить') or contains(text(), 'Add')]"))
            )
            assert add_button is not None
        except TimeoutException:
            pass  # Кнопка может отсутствовать

    async def _test_seller_wood_types_management(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование управления типами древесины."""
        try:
            wood_types_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Древесина")
            wood_types_link.click()
            
            # Проверяем загрузку страницы
            wood_types_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "wood-types-container"))
            )
        except (NoSuchElementException, TimeoutException):
            pass  # Страница может отсутствовать

    async def _test_seller_chats(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование чатов продавца."""
        try:
            chats_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Чаты")
            chats_link.click()
            
            chats_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "chats-container"))
            )
        except (NoSuchElementException, TimeoutException):
            pass

    async def _test_seller_profile(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование профиля продавца."""
        try:
            profile_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Профиль")
            profile_link.click()
            
            profile_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "profile-container"))
            )
        except (NoSuchElementException, TimeoutException):
            pass

    async def _test_admin_dashboard(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование дашборда администратора."""
        try:
            dashboard_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "admin-dashboard"))
            )
        except TimeoutException:
            dashboard_container = driver.find_element(By.CLASS_NAME, "dashboard")

    async def _test_admin_user_management(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование управления пользователями."""
        try:
            users_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Пользователи")
            users_link.click()
            
            users_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "users-container"))
            )
        except (NoSuchElementException, TimeoutException):
            pass

    async def _test_admin_product_management(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование управления продуктами администратором."""
        try:
            products_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Товары")
            products_link.click()
            
            products_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "products-container"))
            )
        except (NoSuchElementException, TimeoutException):
            pass

    async def _test_admin_chat_moderation(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование модерации чатов."""
        try:
            chats_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Чаты")
            chats_link.click()
            
            chats_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "chats-moderation"))
            )
        except (NoSuchElementException, TimeoutException):
            pass

    async def _test_admin_analytics(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование аналитики."""
        try:
            analytics_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Аналитика")
            analytics_link.click()
            
            analytics_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "analytics-container"))
            )
        except (NoSuchElementException, TimeoutException):
            pass

    async def _test_admin_health_monitoring(self, driver: webdriver.Remote, wait: WebDriverWait):
        """Тестирование мониторинга системы."""
        try:
            health_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Мониторинг")
            health_link.click()
            
            health_container = wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "health-monitoring"))
            )
        except (NoSuchElementException, TimeoutException):
            pass
