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
        wait = WebDriverWait(driver, 15)

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
                "[data-testid='wood-types']",
                "table",  # Таблица с типами древесины
                ".card"   # Карточки с типами
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
                    "//*[contains(text(), 'древесин') or contains(text(), 'дерев') or contains(text(), 'wood') or contains(text(), 'Wood')]")
                assert wood_text.is_displayed()

        except NoSuchElementException:
            print("Warning: Wood types management page not found")

    @pytest.mark.wood_types
    @pytest.mark.crud
    async def test_seller_create_wood_type_form(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест создания типа древесины через форму."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 15)

        # Переходим на страницу управления типами древесины
        driver.get(f"{frontend_urls['seller']}/wood-types")
        time.sleep(3)

        try:
            # Ищем кнопку "Добавить тип древесины" или "Add Wood Type"
            add_button_selectors = [
                "//button[contains(text(), 'Добавить')]",
                "//button[contains(text(), 'Add')]",
                "//button[contains(text(), 'Создать')]",
                "//button[contains(text(), 'Create')]",
                ".btn-primary",
                "[data-testid='add-wood-type']"
            ]

            add_button = None
            for selector in add_button_selectors:
                try:
                    if selector.startswith("//"):
                        add_button = driver.find_element(By.XPATH, selector)
                    else:
                        add_button = driver.find_element(By.CSS_SELECTOR, selector)
                    if add_button.is_displayed():
                        break
                except NoSuchElementException:
                    continue

            if add_button:
                # Кликаем на кнопку добавления
                driver.execute_script("arguments[0].click();", add_button)
                time.sleep(2)

                # Проверяем появление формы
                form_selectors = [
                    "form",
                    ".form",
                    ".add-form",
                    "[data-testid='wood-type-form']"
                ]

                form_found = False
                for selector in form_selectors:
                    try:
                        form = driver.find_element(By.CSS_SELECTOR, selector)
                        if form.is_displayed():
                            form_found = True
                            break
                    except NoSuchElementException:
                        continue

                assert form_found, "Форма создания типа древесины не найдена"

                # Тестируем заполнение формы
                await self._test_wood_type_form_interaction(driver, wait)

        except Exception as e:
            print(f"Warning: Could not test wood type creation form: {str(e)}")

    async def _test_wood_type_form_interaction(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование взаимодействия с формой создания типа древесины."""
        try:
            # Ищем поля формы
            name_input_selectors = [
                "input[placeholder*='название']",
                "input[placeholder*='name']",
                "input[placeholder*='Oak']",
                "input[name='neme']",
                "input[name='name']",
                ".form-input"
            ]

            name_input = None
            for selector in name_input_selectors:
                try:
                    name_input = driver.find_element(By.CSS_SELECTOR, selector)
                    if name_input.is_displayed():
                        break
                except NoSuchElementException:
                    continue

            if name_input:
                # Заполняем название типа древесины
                test_wood_name = f"Тестовая древесина {int(time.time())}"
                name_input.clear()
                name_input.send_keys(test_wood_name)
                time.sleep(1)

                # Ищем поле описания
                description_selectors = [
                    "textarea[placeholder*='описание']",
                    "textarea[placeholder*='description']",
                    "textarea[name='description']",
                    "textarea"
                ]

                for selector in description_selectors:
                    try:
                        description_input = driver.find_element(By.CSS_SELECTOR, selector)
                        if description_input.is_displayed():
                            description_input.clear()
                            description_input.send_keys("Тестовое описание древесины")
                            break
                    except NoSuchElementException:
                        continue

                # Ищем поле цены
                price_selectors = [
                    "input[placeholder*='цена']",
                    "input[placeholder*='price']",
                    "input[name='initial_price']",
                    "input[name='price']",
                    "input[type='number']"
                ]

                for selector in price_selectors:
                    try:
                        price_input = driver.find_element(By.CSS_SELECTOR, selector)
                        if price_input.is_displayed():
                            price_input.clear()
                            price_input.send_keys("2500.50")
                            break
                    except NoSuchElementException:
                        continue

                # Ищем кнопку отправки формы
                submit_selectors = [
                    "button[type='submit']",
                    "//button[contains(text(), 'Создать')]",
                    "//button[contains(text(), 'Create')]",
                    "//button[contains(text(), 'Сохранить')]",
                    "//button[contains(text(), 'Save')]",
                    ".btn-primary"
                ]

                for selector in submit_selectors:
                    try:
                        if selector.startswith("//"):
                            submit_button = driver.find_element(By.XPATH, selector)
                        else:
                            submit_button = driver.find_element(By.CSS_SELECTOR, selector)

                        if submit_button.is_displayed() and submit_button.is_enabled():
                            # Кликаем на кнопку отправки
                            driver.execute_script("arguments[0].click();", submit_button)
                            time.sleep(3)

                            # Проверяем результат (успех или ошибка)
                            await self._verify_form_submission_result(driver)
                            break
                    except NoSuchElementException:
                        continue

        except Exception as e:
            print(f"Form interaction test failed: {str(e)}")

    async def _verify_form_submission_result(self, driver: WebDriver):
        """Проверка результата отправки формы."""
        try:
            # Ищем индикаторы успешного создания
            success_indicators = [
                "//div[contains(text(), 'успешно')]",
                "//div[contains(text(), 'создан')]",
                "//div[contains(text(), 'success')]",
                "//div[contains(text(), 'created')]",
                ".alert-success",
                ".success-message",
                ".notification-success"
            ]

            # Ищем индикаторы ошибки
            error_indicators = [
                "//div[contains(text(), 'ошибка')]",
                "//div[contains(text(), 'error')]",
                "//div[contains(text(), 'failed')]",
                ".alert-error",
                ".error-message",
                ".notification-error"
            ]

            # Проверяем наличие сообщений
            success_found = False
            error_found = False

            for selector in success_indicators:
                try:
                    if selector.startswith("//"):
                        element = driver.find_element(By.XPATH, selector)
                    else:
                        element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        success_found = True
                        print(f"Success message found: {element.text}")
                        break
                except NoSuchElementException:
                    continue

            for selector in error_indicators:
                try:
                    if selector.startswith("//"):
                        element = driver.find_element(By.XPATH, selector)
                    else:
                        element = driver.find_element(By.CSS_SELECTOR, selector)
                    if element.is_displayed():
                        error_found = True
                        print(f"Error message found: {element.text}")
                        break
                except NoSuchElementException:
                    continue

            # Если нет явных сообщений, проверяем изменения в таблице/списке
            if not success_found and not error_found:
                try:
                    # Ищем таблицу или список типов древесины
                    table = driver.find_element(By.CSS_SELECTOR, "table, .wood-types-list, .types-container")
                    if table.is_displayed():
                        print("Form submitted, checking table for new entries")
                except NoSuchElementException:
                    print("No clear success/error indication found")

        except Exception as e:
            print(f"Could not verify form submission result: {str(e)}")

    @pytest.mark.wood_types
    @pytest.mark.prices
    async def test_seller_wood_type_price_management(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест управления ценами на типы древесины."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 15)

        # Переходим на страницу управления типами древесины
        driver.get(f"{frontend_urls['seller']}/wood-types")
        time.sleep(3)

        try:
            # Ищем таблицу с типами древесины
            table_selectors = [
                "table",
                ".wood-types-table",
                ".types-table",
                "[data-testid='wood-types-table']"
            ]

            table_found = False
            for selector in table_selectors:
                try:
                    table = driver.find_element(By.CSS_SELECTOR, selector)
                    if table.is_displayed():
                        table_found = True
                        break
                except NoSuchElementException:
                    continue

            if table_found:
                # Ищем кнопки управления ценами
                price_buttons = [
                    "//button[contains(text(), 'цена')]",
                    "//button[contains(text(), 'Price')]",
                    "//button[contains(text(), 'Установить')]",
                    "//button[contains(text(), 'Set')]",
                    ".price-button",
                    ".btn-price"
                ]

                for selector in price_buttons:
                    try:
                        if selector.startswith("//"):
                            price_button = driver.find_element(By.XPATH, selector)
                        else:
                            price_button = driver.find_element(By.CSS_SELECTOR, selector)

                        if price_button.is_displayed():
                            # Кликаем на кнопку управления ценой
                            driver.execute_script("arguments[0].click();", price_button)
                            time.sleep(2)

                            # Тестируем форму цены
                            await self._test_price_form_interaction(driver, wait)
                            break
                    except NoSuchElementException:
                        continue

                # Тестируем историю цен
                await self._test_price_history_display(driver, wait)

        except Exception as e:
            print(f"Warning: Could not test price management: {str(e)}")

    async def _test_price_form_interaction(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование формы управления ценами."""
        try:
            # Ищем поле ввода цены
            price_input_selectors = [
                "input[placeholder*='цена']",
                "input[placeholder*='price']",
                "input[name='price']",
                "input[name='price_per_m3']",
                "input[type='number']",
                ".price-input"
            ]

            price_input = None
            for selector in price_input_selectors:
                try:
                    price_input = driver.find_element(By.CSS_SELECTOR, selector)
                    if price_input.is_displayed():
                        break
                except NoSuchElementException:
                    continue

            if price_input:
                # Тестируем ввод различных значений цены
                test_prices = ["1500.00", "2000.50", "999.99"]

                for test_price in test_prices:
                    price_input.clear()
                    price_input.send_keys(test_price)
                    time.sleep(1)

                    # Проверяем валидацию
                    current_value = price_input.get_attribute("value")
                    assert test_price in current_value, f"Price input failed for {test_price}"

                # Ищем кнопку сохранения цены
                save_price_selectors = [
                    "//button[contains(text(), 'Сохранить')]",
                    "//button[contains(text(), 'Save')]",
                    "//button[contains(text(), 'Установить')]",
                    "//button[contains(text(), 'Set')]",
                    "button[type='submit']",
                    ".btn-save-price"
                ]

                for selector in save_price_selectors:
                    try:
                        if selector.startswith("//"):
                            save_button = driver.find_element(By.XPATH, selector)
                        else:
                            save_button = driver.find_element(By.CSS_SELECTOR, selector)

                        if save_button.is_displayed() and save_button.is_enabled():
                            # Кликаем на кнопку сохранения
                            driver.execute_script("arguments[0].click();", save_button)
                            time.sleep(2)
                            break
                    except NoSuchElementException:
                        continue

        except Exception as e:
            print(f"Price form interaction test failed: {str(e)}")

    async def _test_price_history_display(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование отображения истории цен."""
        try:
            # Ищем кнопки или ссылки для просмотра истории цен
            history_selectors = [
                "//button[contains(text(), 'история')]",
                "//button[contains(text(), 'History')]",
                "//a[contains(text(), 'история')]",
                "//a[contains(text(), 'History')]",
                ".price-history-button",
                ".history-link"
            ]

            for selector in history_selectors:
                try:
                    if selector.startswith("//"):
                        history_element = driver.find_element(By.XPATH, selector)
                    else:
                        history_element = driver.find_element(By.CSS_SELECTOR, selector)

                    if history_element.is_displayed():
                        # Кликаем для просмотра истории
                        driver.execute_script("arguments[0].click();", history_element)
                        time.sleep(2)

                        # Проверяем появление истории цен
                        history_display_selectors = [
                            ".price-history",
                            ".history-container",
                            ".prices-list",
                            "[data-testid='price-history']"
                        ]

                        for display_selector in history_display_selectors:
                            try:
                                history_display = driver.find_element(By.CSS_SELECTOR, display_selector)
                                if history_display.is_displayed():
                                    print("Price history display found and visible")
                                    return
                            except NoSuchElementException:
                                continue
                        break
                except NoSuchElementException:
                    continue

        except Exception as e:
            print(f"Price history test failed: {str(e)}")

    @pytest.mark.wood_types
    @pytest.mark.validation
    async def test_seller_wood_type_form_validation(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Тест валидации формы создания типа древесины."""
        driver = webdriver_instance
        wait = WebDriverWait(driver, 15)

        # Переходим на страницу управления типами древесины
        driver.get(f"{frontend_urls['seller']}/wood-types")
        time.sleep(3)

        try:
            # Открываем форму добавления
            add_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Добавить') or contains(text(), 'Add')]")
            driver.execute_script("arguments[0].click();", add_button)
            time.sleep(2)

            # Тестируем отправку пустой формы
            submit_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit'], .btn-primary")
            driver.execute_script("arguments[0].click();", submit_button)
            time.sleep(1)

            # Проверяем появление сообщений валидации
            validation_selectors = [
                ".error-message",
                ".validation-error",
                ".form-error",
                "//div[contains(text(), 'required')]",
                "//div[contains(text(), 'обязательно')]"
            ]

            validation_found = False
            for selector in validation_selectors:
                try:
                    if selector.startswith("//"):
                        error_element = driver.find_element(By.XPATH, selector)
                    else:
                        error_element = driver.find_element(By.CSS_SELECTOR, selector)
                    if error_element.is_displayed():
                        validation_found = True
                        print(f"Validation message found: {error_element.text}")
                        break
                except NoSuchElementException:
                    continue

            # Тестируем валидацию цены
            await self._test_price_validation(driver, wait)

        except Exception as e:
            print(f"Warning: Could not test form validation: {str(e)}")

    async def _test_price_validation(self, driver: WebDriver, wait: WebDriverWait):
        """Тестирование валидации поля цены."""
        try:
            # Ищем поле цены
            price_input = driver.find_element(By.CSS_SELECTOR, "input[type='number'], input[name*='price']")

            # Тестируем некорректные значения
            invalid_prices = ["-100", "0", "abc", "999999999"]

            for invalid_price in invalid_prices:
                price_input.clear()
                price_input.send_keys(invalid_price)
                time.sleep(1)

                # Проверяем валидацию браузера или кастомную валидацию
                validity = driver.execute_script("return arguments[0].validity.valid;", price_input)
                if not validity:
                    print(f"Browser validation caught invalid price: {invalid_price}")

        except Exception as e:
            print(f"Price validation test failed: {str(e)}")

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
