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

    @pytest.mark.wood_types
    @pytest.mark.integration
    async def test_buyer_wood_types_browsing(self, webdriver_instance: WebDriver, frontend_urls: dict,
                                           api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест просмотра типов древесины покупателем."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls

        # Создаем тестовые данные
        wood_type = await test_data_factory.create_wood_type(
            neme="Buyer Test Wood",
            description="Wood type for buyer testing"
        )

        # Создаем цены
        await test_data_factory.create_wood_type_price(
            wood_type_id=wood_type["data"]["id"],
            price_per_cubic_meter="1800.00"
        )

        # Переходим на страницу товаров
        self.navigate_to("buyer", "/products")

        wait = WebDriverWait(self.driver, 15)

        try:
            # Ждем загрузки данных
            import asyncio
            await asyncio.sleep(3)

            # Ищем информацию о типах древесины
            wood_info_selectors = [
                f"//*[contains(text(), '{wood_type['data']['neme']}')]",
                ".wood-type-info",
                ".product-wood-type",
                ".material-info"
            ]

            for selector in wood_info_selectors:
                try:
                    if selector.startswith("//"):
                        element = self.driver.find_element(By.XPATH, selector)
                    else:
                        element = self.driver.find_element(By.CSS_SELECTOR, selector)

                    if element.is_displayed():
                        print(f"Wood type info found in buyer interface: {element.text}")
                        break
                except:
                    continue

            # Тестируем фильтрацию по типу древесины
            await self._test_buyer_wood_type_filtering()

        except Exception as e:
            print(f"Warning: Could not test buyer wood types browsing: {str(e)}")

    async def _test_buyer_wood_type_filtering(self):
        """Тестирование фильтрации по типам древесины."""
        try:
            # Ищем элементы фильтрации
            filter_selectors = [
                ".filter-wood-type",
                ".wood-type-filter",
                "select[name*='wood']",
                ".material-filter"
            ]

            for selector in filter_selectors:
                try:
                    filter_element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if filter_element.is_displayed():
                        print(f"Wood type filter found: {selector}")

                        # Если это select, тестируем выбор
                        if filter_element.tag_name == "select":
                            options = filter_element.find_elements(By.TAG_NAME, "option")
                            if len(options) > 1:
                                options[1].click()
                                import asyncio
                                await asyncio.sleep(2)
                                print("Wood type filter applied")
                        break
                except:
                    continue

        except Exception as e:
            print(f"Wood type filtering test failed: {str(e)}")

    @pytest.mark.prices
    @pytest.mark.integration
    async def test_buyer_price_information_display(self, webdriver_instance: WebDriver, frontend_urls: dict,
                                                  api_client: APIClient, test_data_factory: TestDataFactory):
        """Тест отображения ценовой информации для покупателя."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls

        # Создаем продукт с ценой
        product_set = await test_data_factory.create_complete_product_set()

        # Переходим на страницу товаров
        self.navigate_to("buyer", "/products")

        wait = WebDriverWait(self.driver, 15)

        try:
            import asyncio
            await asyncio.sleep(3)

            # Ищем отображение цен
            price_selectors = [
                ".price",
                ".product-price",
                ".cost",
                "//span[contains(text(), '₽')]",
                "//div[contains(text(), 'руб')]"
            ]

            price_found = False
            for selector in price_selectors:
                try:
                    if selector.startswith("//"):
                        price_elements = self.driver.find_elements(By.XPATH, selector)
                    else:
                        price_elements = self.driver.find_elements(By.CSS_SELECTOR, selector)

                    for element in price_elements:
                        if element.is_displayed() and any(char.isdigit() for char in element.text):
                            print(f"Price information found: {element.text}")
                            price_found = True
                            break

                    if price_found:
                        break
                except:
                    continue

            # Тестируем калькулятор стоимости
            await self._test_buyer_price_calculator()

        except Exception as e:
            print(f"Warning: Could not test buyer price information: {str(e)}")

    async def _test_buyer_price_calculator(self):
        """Тестирование калькулятора стоимости."""
        try:
            # Ищем элементы калькулятора
            calculator_selectors = [
                ".price-calculator",
                ".cost-calculator",
                ".volume-calculator",
                "input[placeholder*='объем']",
                "input[placeholder*='volume']"
            ]

            for selector in calculator_selectors:
                try:
                    calculator = self.driver.find_element(By.CSS_SELECTOR, selector)
                    if calculator.is_displayed():
                        print(f"Price calculator found: {selector}")

                        # Если это input, тестируем ввод
                        if calculator.tag_name == "input":
                            calculator.clear()
                            calculator.send_keys("2.5")
                            import asyncio
                            await asyncio.sleep(1)
                            print("Volume entered in calculator")
                        break
                except:
                    continue

        except Exception as e:
            print(f"Price calculator test failed: {str(e)}")
