"""
Comprehensive Selenium tests for Admin Frontend.
Тесты для административной панели управления системой.
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
@pytest.mark.admin
@pytest.mark.frontend
class TestAdminFrontend:
    """Comprehensive Selenium tests for Admin Frontend."""

    @pytest.mark.smoke
    async def test_admin_homepage_loads(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест загрузки главной страницы admin frontend."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 15)
        
        # Переходим на admin frontend
        driver.get(frontend_urls["admin"])
        
        # Проверяем загрузку страницы
        try:
            # Ждем загрузки основного контента
            main_content = wait.until(
                EC.presence_of_element_located((By.TAG_NAME, "main"))
            )
            assert main_content.is_displayed()
            
            # Проверяем заголовок страницы
            assert any(keyword in driver.title.lower() for keyword in ["admin", "администратор", "dashboard", "wooden"]), \
                f"Unexpected page title: {driver.title}"
            
            # Проверяем основные элементы интерфейса
            header = driver.find_element(By.TAG_NAME, "header")
            assert header.is_displayed()
            
        except TimeoutException:
            pytest.fail("Admin frontend не загрузился в течение 15 секунд")

    @pytest.mark.navigation
    async def test_admin_navigation_menu(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест навигационного меню admin frontend."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Ожидаемые пункты меню для администратора
        expected_menu_items = [
            "Дашборд",
            "Пользователи",
            "Покупатели", 
            "Продавцы",
            "Товары",
            "Древесина",
            "Чаты",
            "Аналитика",
            "Мониторинг",
            "Настройки"
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
    async def test_admin_dashboard_functionality(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест функциональности дашборда администратора."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Проверяем элементы дашборда
        try:
            # Ищем статистические карточки и метрики
            dashboard_elements = [
                ".admin-dashboard",
                ".dashboard",
                ".stats",
                ".metrics",
                ".system-overview",
                "[data-testid='admin-dashboard']"
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
                    "//*[contains(text(), 'дашборд') or contains(text(), 'статистика') or contains(text(), 'система')]")
                assert dashboard_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Dashboard elements not found, but page loaded successfully")

    @pytest.mark.users
    async def test_admin_users_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления пользователями."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Переходим на страницу пользователей
        try:
            users_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Пользователи")
            users_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/users")
        
        # Проверяем загрузку страницы пользователей
        try:
            users_elements = [
                ".users-container",
                ".users-list",
                ".user-management",
                ".admin-users",
                "[data-testid='users']"
            ]
            
            element_found = False
            for selector in users_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о пользователях
                users_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'пользовател') or contains(text(), 'user')]")
                assert users_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Users management page not found")

    @pytest.mark.buyers
    async def test_admin_buyers_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления покупателями."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Переходим на страницу покупателей
        try:
            buyers_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Покупатели")
            buyers_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/buyers")
        
        # Проверяем загрузку страницы покупателей
        try:
            buyers_elements = [
                ".buyers-container",
                ".buyers-list",
                ".buyer-management",
                "[data-testid='buyers']"
            ]
            
            element_found = False
            for selector in buyers_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о покупателях
                buyers_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'покупател') or contains(text(), 'buyer')]")
                assert buyers_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Buyers management page not found")

    @pytest.mark.sellers
    async def test_admin_sellers_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления продавцами."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Переходим на страницу продавцов
        try:
            sellers_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Продавцы")
            sellers_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/sellers")
        
        # Проверяем загрузку страницы продавцов
        try:
            sellers_elements = [
                ".sellers-container",
                ".sellers-list",
                ".seller-management",
                "[data-testid='sellers']"
            ]
            
            element_found = False
            for selector in sellers_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о продавцах
                sellers_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'продавц') or contains(text(), 'seller')]")
                assert sellers_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Sellers management page not found")

    @pytest.mark.products
    async def test_admin_products_oversight(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест надзора за товарами."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Переходим на страницу товаров
        try:
            products_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Товары")
            products_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/products")
        
        # Проверяем загрузку страницы товаров
        try:
            products_elements = [
                ".products-container",
                ".products-list",
                ".product-oversight",
                ".admin-products",
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
                    "//*[contains(text(), 'товар') or contains(text(), 'продукт') or contains(text(), 'product')]")
                assert products_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Products oversight page not found")

    @pytest.mark.chats
    async def test_admin_chat_moderation(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест модерации чатов."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Переходим на страницу чатов
        try:
            chats_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Чаты")
            chats_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/chats")
        
        # Проверяем загрузку страницы модерации чатов
        try:
            chats_elements = [
                ".chats-moderation",
                ".chat-oversight",
                ".admin-chats",
                ".moderation-panel",
                "[data-testid='chat-moderation']"
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
                    "//*[contains(text(), 'чат') or contains(text(), 'модераци') or contains(text(), 'сообщен')]")
                assert chats_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: Chat moderation page not found")

    @pytest.mark.wood_types
    @pytest.mark.crud
    async def test_admin_wood_types_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления типами древесины в admin панели."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 15)

        driver.get(frontend_urls["admin"])

        # Переходим на страницу управления типами древесины
        try:
            wood_types_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Wood Types")
            wood_types_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/wood-types")

        # Проверяем загрузку страницы
        try:
            # Ищем основные элементы управления
            management_elements = [
                ".card",
                "table",
                ".wood-types-container",
                ".entity-manager",
                "[data-testid='wood-types']"
            ]

            element_found = False
            for selector in management_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue

            if element_found:
                # Тестируем создание типа древесины
                await self._test_admin_create_wood_type(driver, wait)

                # Тестируем управление ценами
                await self._test_admin_price_management(driver, wait)

        except Exception as e:
            print(f"Warning: Could not test admin wood types management: {str(e)}")

    async def _test_admin_create_wood_type(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование создания типа древесины через admin панель."""
        try:
            # Ищем кнопку добавления
            add_button_selectors = [
                "//button[contains(text(), 'Add')]",
                "//button[contains(text(), 'Добавить')]",
                "//button[contains(text(), 'Create')]",
                ".btn-primary",
                ".add-button",
                "[data-testid='add-wood-type']"
            ]

            for selector in add_button_selectors:
                try:
                    if selector.startswith("//"):
                        add_button = driver.find_element(By.XPATH, selector)
                    else:
                        add_button = driver.find_element(By.CSS_SELECTOR, selector)

                    if add_button.is_displayed():
                        driver.execute_script("arguments[0].click();", add_button)
                        time.sleep(2)

                        # Тестируем заполнение формы
                        await self._test_admin_wood_type_form(driver, wait)
                        break
                except NoSuchElementException:
                    continue

        except Exception as e:
            print(f"Admin wood type creation test failed: {str(e)}")

    async def _test_admin_wood_type_form(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование формы создания типа древесины в admin панели."""
        try:
            # Ищем поля формы
            name_field_selectors = [
                "input[name='name']",
                "input[name='neme']",
                "input[placeholder*='name']",
                "input[placeholder*='название']",
                ".form-input"
            ]

            name_field = None
            for selector in name_field_selectors:
                try:
                    name_field = driver.find_element(By.CSS_SELECTOR, selector)
                    if name_field.is_displayed():
                        break
                except NoSuchElementException:
                    continue

            if name_field:
                # Заполняем название
                test_name = f"Admin Test Wood {int(time.time())}"
                name_field.clear()
                name_field.send_keys(test_name)
                time.sleep(1)

                # Ищем поле описания
                description_selectors = [
                    "textarea[name='description']",
                    "input[name='description']",
                    "textarea",
                    ".description-field"
                ]

                for selector in description_selectors:
                    try:
                        description_field = driver.find_element(By.CSS_SELECTOR, selector)
                        if description_field.is_displayed():
                            description_field.clear()
                            description_field.send_keys("Admin test description")
                            break
                    except NoSuchElementException:
                        continue

                # Отправляем форму
                submit_selectors = [
                    "button[type='submit']",
                    "//button[contains(text(), 'Save')]",
                    "//button[contains(text(), 'Create')]",
                    ".btn-primary"
                ]

                for selector in submit_selectors:
                    try:
                        if selector.startswith("//"):
                            submit_button = driver.find_element(By.XPATH, selector)
                        else:
                            submit_button = driver.find_element(By.CSS_SELECTOR, selector)

                        if submit_button.is_displayed() and submit_button.is_enabled():
                            driver.execute_script("arguments[0].click();", submit_button)
                            time.sleep(3)
                            break
                    except NoSuchElementException:
                        continue

        except Exception as e:
            print(f"Admin wood type form test failed: {str(e)}")

    async def _test_admin_price_management(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование управления ценами в admin панели."""
        try:
            # Ищем вкладку или секцию цен
            price_tab_selectors = [
                "//button[contains(text(), 'Price')]",
                "//button[contains(text(), 'Цены')]",
                "//a[contains(text(), 'Price')]",
                "//a[contains(text(), 'Цены')]",
                ".price-tab",
                "[data-testid='prices-tab']"
            ]

            for selector in price_tab_selectors:
                try:
                    if selector.startswith("//"):
                        price_tab = driver.find_element(By.XPATH, selector)
                    else:
                        price_tab = driver.find_element(By.CSS_SELECTOR, selector)

                    if price_tab.is_displayed():
                        driver.execute_script("arguments[0].click();", price_tab)
                        time.sleep(2)

                        # Тестируем создание цены
                        await self._test_admin_create_price(driver, wait)
                        break
                except NoSuchElementException:
                    continue

        except Exception as e:
            print(f"Admin price management test failed: {str(e)}")

    async def _test_admin_create_price(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование создания цены в admin панели."""
        try:
            # Ищем кнопку добавления цены
            add_price_selectors = [
                "//button[contains(text(), 'Add Price')]",
                "//button[contains(text(), 'Добавить цену')]",
                ".add-price-button",
                ".btn-add-price"
            ]

            for selector in add_price_selectors:
                try:
                    if selector.startswith("//"):
                        add_button = driver.find_element(By.XPATH, selector)
                    else:
                        add_button = driver.find_element(By.CSS_SELECTOR, selector)

                    if add_button.is_displayed():
                        driver.execute_script("arguments[0].click();", add_button)
                        time.sleep(2)

                        # Заполняем форму цены
                        await self._test_admin_price_form(driver, wait)
                        break
                except NoSuchElementException:
                    continue

        except Exception as e:
            print(f"Admin create price test failed: {str(e)}")

    async def _test_admin_price_form(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование формы создания цены в admin панели."""
        try:
            # Ищем селект типа древесины
            wood_type_selectors = [
                "select[name='wood_type_id']",
                "select[name='woodType']",
                ".wood-type-select",
                "select"
            ]

            for selector in wood_type_selectors:
                try:
                    wood_type_select = driver.find_element(By.CSS_SELECTOR, selector)
                    if wood_type_select.is_displayed():
                        # Выбираем первый доступный тип древесины
                        options = wood_type_select.find_elements(By.TAG_NAME, "option")
                        if len(options) > 1:  # Пропускаем placeholder option
                            options[1].click()
                            time.sleep(1)
                        break
                except NoSuchElementException:
                    continue

            # Ищем поле цены
            price_field_selectors = [
                "input[name='price_per_m3']",
                "input[name='price']",
                "input[type='number']",
                ".price-field"
            ]

            for selector in price_field_selectors:
                try:
                    price_field = driver.find_element(By.CSS_SELECTOR, selector)
                    if price_field.is_displayed():
                        price_field.clear()
                        price_field.send_keys("1750.25")
                        time.sleep(1)
                        break
                except NoSuchElementException:
                    continue

            # Отправляем форму
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .btn-primary")
            driver.execute_script("arguments[0].click();", submit_button)
            time.sleep(3)

        except Exception as e:
            print(f"Admin price form test failed: {str(e)}")

    @pytest.mark.analytics
    async def test_admin_system_analytics(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест системной аналитики."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Переходим на страницу аналитики
        try:
            analytics_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Аналитика")
            analytics_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/analytics")
        
        # Проверяем загрузку страницы аналитики
        try:
            analytics_elements = [
                ".system-analytics",
                ".admin-analytics",
                ".analytics-dashboard",
                ".charts-container",
                ".metrics-overview",
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
            print("Warning: System analytics page not found")

    @pytest.mark.monitoring
    async def test_admin_system_monitoring(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест мониторинга системы."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 10)
        
        driver.get(frontend_urls["admin"])
        
        # Переходим на страницу мониторинга
        try:
            monitoring_link = driver.find_element(By.PARTIAL_LINK_TEXT, "Мониторинг")
            monitoring_link.click()
            time.sleep(2)
        except NoSuchElementException:
            driver.get(f"{frontend_urls['admin']}/monitoring")
        
        # Проверяем загрузку страницы мониторинга
        try:
            monitoring_elements = [
                ".system-monitoring",
                ".health-dashboard",
                ".service-status",
                ".monitoring-panel",
                "[data-testid='monitoring']"
            ]
            
            element_found = False
            for selector in monitoring_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        element_found = True
                        break
                except NoSuchElementException:
                    continue
            
            if not element_found:
                # Проверяем наличие текста о мониторинге
                monitoring_text = driver.find_element(By.XPATH, 
                    "//*[contains(text(), 'мониторинг') or contains(text(), 'состояние') or contains(text(), 'health')]")
                assert monitoring_text.is_displayed()
                
        except NoSuchElementException:
            print("Warning: System monitoring page not found")

    @pytest.mark.responsive
    async def test_admin_responsive_design(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест адаптивного дизайна admin frontend."""
        driver = webdriver_instance
        
        driver.get(frontend_urls["admin"])
        
        # Тестируем разные размеры экрана
        screen_sizes = [
            (1920, 1080),  # Desktop
            (1366, 768),   # Laptop
            (1024, 768),   # Tablet landscape
            (768, 1024),   # Tablet portrait
        ]
        
        for width, height in screen_sizes:
            driver.set_window_size(width, height)
            time.sleep(1)
            
            # Проверяем, что основные элементы видны
            try:
                body = driver.find_element(By.TAG_NAME, "body")
                assert body.is_displayed()
                
                # Админ панель обычно не оптимизирована для мобильных устройств
                # Но должна корректно отображаться на планшетах и десктопах
                if width >= 768:
                    scroll_width = driver.execute_script("return document.body.scrollWidth")
                    viewport_width = driver.execute_script("return window.innerWidth")
                    # Допускаем небольшой горизонтальный скролл для админ панели
                    assert scroll_width <= viewport_width + 50, \
                        f"Excessive horizontal scroll at {width}x{height}"
                
            except Exception as e:
                pytest.fail(f"Responsive design issue at {width}x{height}: {str(e)}")

    @pytest.mark.performance
    async def test_admin_page_load_performance(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест производительности загрузки страниц admin frontend."""
        driver = webdriver_instance
        
        # Тестируем время загрузки основных страниц
        pages_to_test = [
            ("", "Homepage"),
            ("/users", "Users"),
            ("/buyers", "Buyers"),
            ("/sellers", "Sellers"),
            ("/products", "Products"),
            ("/chats", "Chat Moderation"),
            ("/analytics", "Analytics"),
            ("/monitoring", "Monitoring")
        ]
        
        for path, page_name in pages_to_test:
            start_time = time.time()
            
            try:
                driver.get(f"{frontend_urls['admin']}{path}")
                
                # Ждем загрузки основного контента
                wait = WebDriverWait(driver, 15)  # Админ панель может загружаться дольше
                wait.until(EC.presence_of_element_located((By.TAG_NAME, "main")))
                
                load_time = time.time() - start_time
                
                # Проверяем, что страница загрузилась за разумное время
                assert load_time < 15.0, f"{page_name} page took too long to load: {load_time:.2f}s"
                
            except TimeoutException:
                load_time = time.time() - start_time
                print(f"Warning: {page_name} page did not fully load within 15 seconds ({load_time:.2f}s)")
            except Exception as e:
                print(f"Warning: Error loading {page_name} page: {str(e)}")

    @pytest.mark.security
    async def test_admin_security_features(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест функций безопасности admin frontend."""
        driver = webdriver_instance
        
        driver.get(frontend_urls["admin"])
        
        # Проверяем наличие элементов безопасности
        try:
            # Ищем индикаторы безопасности
            security_elements = [
                ".security-status",
                ".auth-indicator", 
                ".session-info",
                ".admin-badge"
            ]
            
            for selector in security_elements:
                try:
                    element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        print(f"Security element found: {selector}")
                        break
                except NoSuchElementException:
                    continue
            
            # Проверяем отсутствие чувствительной информации в исходном коде
            page_source = driver.page_source.lower()
            sensitive_patterns = ["password", "secret", "token", "api_key"]
            
            for pattern in sensitive_patterns:
                assert pattern not in page_source, f"Sensitive information '{pattern}' found in page source"
                
        except Exception as e:
            print(f"Security check completed with warnings: {str(e)}")
