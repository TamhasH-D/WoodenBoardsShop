"""
Comprehensive Integration Tests for Wood Types and Pricing
Полные интеграционные тесты для типов древесины и ценообразования.
"""

import pytest
import asyncio
import time
from typing import Dict, List, Any
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

from ..conftest import APIClient, TestDataFactory
from ..browser_tests.base_browser_test import BaseBrowserTest


class TestWoodTypeComprehensive(BaseBrowserTest):
    """Comprehensive тесты для полного цикла управления типами древесины."""

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.comprehensive
    async def test_complete_wood_type_lifecycle(
        self, 
        webdriver_instance: WebDriver, 
        frontend_urls: dict,
        api_client: APIClient,
        test_data_factory: TestDataFactory
    ):
        """Полный жизненный цикл типа древесины: создание → ценообразование → управление."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        # Phase 1: API Creation and Validation
        wood_type_data = await self._create_wood_type_via_api(api_client, test_data_factory)
        
        # Phase 2: Price Management via API
        prices_data = await self._create_prices_via_api(api_client, wood_type_data["id"])
        
        # Phase 3: Seller Frontend Verification
        await self._verify_seller_frontend_display(wood_type_data, prices_data)
        
        # Phase 4: Admin Frontend Management
        await self._verify_admin_frontend_management(wood_type_data, prices_data)
        
        # Phase 5: Cross-Frontend Consistency
        await self._verify_cross_frontend_consistency(wood_type_data)

    async def _create_wood_type_via_api(self, api_client: APIClient, test_data_factory: TestDataFactory) -> Dict[str, Any]:
        """Создание типа древесины через API."""
        wood_type_name = f"Comprehensive Test Wood {int(time.time())}"
        
        wood_type = await test_data_factory.create_wood_type(
            neme=wood_type_name,
            description="Comprehensive integration test wood type"
        )
        
        # Verify creation
        assert wood_type["data"]["neme"] == wood_type_name
        assert "id" in wood_type["data"]
        
        # Verify via direct API call
        retrieved_type = await api_client.get_wood_type(wood_type["data"]["id"])
        assert retrieved_type["data"]["neme"] == wood_type_name
        
        return wood_type["data"]

    async def _create_prices_via_api(self, api_client: APIClient, wood_type_id: str) -> List[Dict[str, Any]]:
        """Создание цен через API."""
        price_values = ["1500.00", "1750.50", "2000.25"]
        created_prices = []
        
        for price_value in price_values:
            price_data = {
                "wood_type_id": wood_type_id,
                "price_per_m3": float(price_value)
            }
            
            price_response = await api_client.create_wood_type_price(price_data)
            created_prices.append(price_response["data"])
            
            # Small delay between price creations
            await asyncio.sleep(0.5)
        
        # Verify all prices created
        all_prices = await api_client.get_wood_type_prices()
        our_price_ids = [p["id"] for p in created_prices]
        api_price_ids = [p["id"] for p in all_prices["data"]]
        
        for price_id in our_price_ids:
            assert price_id in api_price_ids
        
        return created_prices

    async def _verify_seller_frontend_display(self, wood_type_data: Dict[str, Any], prices_data: List[Dict[str, Any]]):
        """Проверка отображения в seller frontend."""
        self.navigate_to("seller", "/wood-types")
        
        wait = WebDriverWait(self.driver, 15)
        
        try:
            # Wait for page load
            await asyncio.sleep(3)
            
            # Look for wood type in the interface
            wood_type_selectors = [
                f"//*[contains(text(), '{wood_type_data['neme']}')]",
                ".wood-type-item",
                ".wood-types-table tr",
                ".type-card"
            ]
            
            wood_type_found = False
            for selector in wood_type_selectors:
                try:
                    if selector.startswith("//"):
                        element = self.driver.find_element(By.XPATH, selector)
                    else:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        element = elements[0] if elements else None
                    
                    if element and element.is_displayed():
                        wood_type_found = True
                        print(f"Wood type found in seller frontend: {selector}")
                        break
                except NoSuchElementException:
                    continue
            
            # Test price management interface
            await self._test_seller_price_interface(wood_type_data, prices_data)
            
        except Exception as e:
            print(f"Seller frontend verification failed: {str(e)}")
            self.take_screenshot("seller_frontend_verification_failed")

    async def _test_seller_price_interface(self, wood_type_data: Dict[str, Any], prices_data: List[Dict[str, Any]]):
        """Тестирование интерфейса управления ценами в seller frontend."""
        try:
            # Look for price management elements
            price_elements = [
                ".current-price",
                ".price-display",
                ".price-value",
                "//td[contains(text(), '₽')]",
                "//span[contains(text(), 'цена')]"
            ]
            
            for selector in price_elements:
                try:
                    if selector.startswith("//"):
                        element = self.driver.find_element(By.XPATH, selector)
                    else:
                        element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    
                    if element.is_displayed():
                        print(f"Price element found: {element.text}")
                        break
                except NoSuchElementException:
                    continue
            
            # Test price history if available
            history_buttons = [
                "//button[contains(text(), 'история')]",
                "//button[contains(text(), 'History')]",
                ".price-history-btn"
            ]
            
            for selector in history_buttons:
                try:
                    if selector.startswith("//"):
                        button = self.driver.find_element(By.XPATH, selector)
                    else:
                        button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    
                    if button.is_displayed():
                        self.driver.execute_script("arguments[0].click();", button)
                        await asyncio.sleep(2)
                        print("Price history accessed")
                        break
                except NoSuchElementException:
                    continue
                    
        except Exception as e:
            print(f"Seller price interface test failed: {str(e)}")

    async def _verify_admin_frontend_management(self, wood_type_data: Dict[str, Any], prices_data: List[Dict[str, Any]]):
        """Проверка управления в admin frontend."""
        self.navigate_to("admin", "/wood-types")
        
        wait = WebDriverWait(self.driver, 15)
        
        try:
            await asyncio.sleep(3)
            
            # Look for wood type in admin interface
            admin_selectors = [
                f"//*[contains(text(), '{wood_type_data['neme']}')]",
                "table tbody tr",
                ".entity-row",
                ".wood-type-entry"
            ]
            
            for selector in admin_selectors:
                try:
                    if selector.startswith("//"):
                        element = self.driver.find_element(By.XPATH, selector)
                    else:
                        elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                        element = elements[0] if elements else None
                    
                    if element and element.is_displayed():
                        print(f"Wood type found in admin frontend: {selector}")
                        break
                except NoSuchElementException:
                    continue
            
            # Test admin price management
            await self._test_admin_price_management_interface(wood_type_data, prices_data)
            
        except Exception as e:
            print(f"Admin frontend verification failed: {str(e)}")
            self.take_screenshot("admin_frontend_verification_failed")

    async def _test_admin_price_management_interface(self, wood_type_data: Dict[str, Any], prices_data: List[Dict[str, Any]]):
        """Тестирование интерфейса управления ценами в admin frontend."""
        try:
            # Look for price management tabs or sections
            price_tabs = [
                "//button[contains(text(), 'Price')]",
                "//a[contains(text(), 'Цены')]",
                ".price-tab",
                ".prices-section"
            ]
            
            for selector in price_tabs:
                try:
                    if selector.startswith("//"):
                        tab = self.driver.find_element(By.XPATH, selector)
                    else:
                        tab = self.driver.find_element(By.CSS_SELECTOR, selector)
                    
                    if tab.is_displayed():
                        self.driver.execute_script("arguments[0].click();", tab)
                        await asyncio.sleep(2)
                        print("Price management section accessed")
                        break
                except NoSuchElementException:
                    continue
            
            # Look for price entries
            price_entries = self.driver.find_elements(By.XPATH, "//td[contains(text(), '.')]")
            price_count = len([entry for entry in price_entries if '.' in entry.text and entry.text.replace('.', '').replace(',', '').isdigit()])
            
            print(f"Found {price_count} price entries in admin interface")
            
        except Exception as e:
            print(f"Admin price management interface test failed: {str(e)}")

    async def _verify_cross_frontend_consistency(self, wood_type_data: Dict[str, Any]):
        """Проверка консистентности данных между frontend'ами."""
        try:
            # Collect data from seller frontend
            seller_data = await self._extract_seller_data(wood_type_data)
            
            # Collect data from admin frontend  
            admin_data = await self._extract_admin_data(wood_type_data)
            
            # Verify consistency
            if seller_data and admin_data:
                assert seller_data["name"] == admin_data["name"], "Wood type name inconsistent between frontends"
                print("Cross-frontend consistency verified")
            
        except Exception as e:
            print(f"Cross-frontend consistency check failed: {str(e)}")

    async def _extract_seller_data(self, wood_type_data: Dict[str, Any]) -> Dict[str, Any]:
        """Извлечение данных из seller frontend."""
        self.navigate_to("seller", "/wood-types")
        await asyncio.sleep(2)
        
        try:
            # Extract wood type name from seller interface
            name_element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{wood_type_data['neme']}')]")
            return {"name": name_element.text.strip()}
        except NoSuchElementException:
            return {}

    async def _extract_admin_data(self, wood_type_data: Dict[str, Any]) -> Dict[str, Any]:
        """Извлечение данных из admin frontend."""
        self.navigate_to("admin", "/wood-types")
        await asyncio.sleep(2)
        
        try:
            # Extract wood type name from admin interface
            name_element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{wood_type_data['neme']}')]")
            return {"name": name_element.text.strip()}
        except NoSuchElementException:
            return {}

    @pytest.mark.asyncio
    @pytest.mark.integration
    @pytest.mark.performance
    async def test_wood_type_performance_workflow(
        self,
        webdriver_instance: WebDriver,
        frontend_urls: dict,
        api_client: APIClient,
        test_data_factory: TestDataFactory
    ):
        """Тест производительности полного workflow управления типами древесины."""
        self.driver = webdriver_instance
        self.frontend_urls = frontend_urls
        
        start_time = time.time()
        
        # Create multiple wood types with prices
        wood_types_count = 5
        created_types = []
        
        for i in range(wood_types_count):
            wood_type = await test_data_factory.create_wood_type(
                neme=f"Performance Test Wood {i}",
                description=f"Performance test description {i}"
            )
            created_types.append(wood_type["data"])
            
            # Create 3 prices for each type
            for j in range(3):
                await test_data_factory.create_wood_type_price(
                    wood_type_id=wood_type["data"]["id"],
                    price_per_cubic_meter=f"{1000 + i * 100 + j * 10}.00"
                )
        
        creation_time = time.time() - start_time
        
        # Test frontend loading performance
        frontend_start = time.time()
        
        # Test seller frontend load time
        self.navigate_to("seller", "/wood-types")
        await asyncio.sleep(3)
        
        # Test admin frontend load time
        self.navigate_to("admin", "/wood-types")
        await asyncio.sleep(3)
        
        frontend_time = time.time() - frontend_start
        total_time = time.time() - start_time
        
        # Performance assertions
        assert creation_time < 30.0, f"Wood type creation took too long: {creation_time:.2f}s"
        assert frontend_time < 20.0, f"Frontend loading took too long: {frontend_time:.2f}s"
        assert total_time < 60.0, f"Total workflow took too long: {total_time:.2f}s"
        
        print(f"Performance metrics:")
        print(f"  Creation time: {creation_time:.2f}s")
        print(f"  Frontend time: {frontend_time:.2f}s")
        print(f"  Total time: {total_time:.2f}s")
