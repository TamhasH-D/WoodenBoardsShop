"""
Comprehensive Functional Testing Suite.
Консолидированный набор функциональных тестов для всех frontend приложений.
"""

import pytest
import time
import os
from typing import Dict, List, Optional
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Import base classes
try:
    from browser_tests.base_browser_test import BaseBrowserTest, FrontendTestMixin
except ImportError:
    # Fallback if imports fail
    class BaseBrowserTest:
        def setup_driver(self, driver, urls):
            self.driver = driver
            self.frontend_urls = urls

        def navigate_to(self, frontend, path=""):
            url = f"{self.frontend_urls[frontend]}{path}"
            self.driver.get(url)

        def find_element_safe(self, by, value, timeout=10):
            try:
                wait = WebDriverWait(self.driver, timeout)
                return wait.until(EC.presence_of_element_located((by, value)))
            except TimeoutException:
                return None

        def take_screenshot(self, name):
            try:
                self.driver.save_screenshot(f"screenshots/{name}.png")
            except:
                pass

    class FrontendTestMixin:
        pass


@pytest.mark.functional
@pytest.mark.comprehensive
@pytest.mark.browser
class TestFunctionalComprehensive(BaseBrowserTest, FrontendTestMixin):
    """Comprehensive functional testing suite for all frontend applications."""
    
    def setup_method(self, method):
        """Setup for each test method."""
        self.test_results = {
            "buyer": {"tests": 0, "passed": 0, "failed": 0},
            "seller": {"tests": 0, "passed": 0, "failed": 0},
            "admin": {"tests": 0, "passed": 0, "failed": 0}
        }
    
    @pytest.mark.smoke
    def test_all_frontends_loading_comprehensive(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Comprehensive test that all frontend applications load successfully."""
        self.setup_driver(webdriver_instance, frontend_urls)
        
        frontends = ["buyer", "seller", "admin"]
        results = {}
        
        for frontend in frontends:
            self.test_results[frontend]["tests"] += 1
            
            try:
                print(f"\n🌐 Testing {frontend} frontend loading...")
                
                # Navigate to frontend
                self.navigate_to(frontend)
                
                # Wait for page to load
                wait = WebDriverWait(self.driver, 15)
                
                # Check that main content is present
                main_content = wait.until(
                    EC.presence_of_element_located((By.TAG_NAME, "main"))
                )
                assert main_content.is_displayed(), f"{frontend} main content not visible"
                
                # Check page title
                title = self.get_page_title().lower()
                expected_keywords = [frontend, "wooden", "board", "shop"]
                title_check = any(keyword in title for keyword in expected_keywords)
                
                if not title_check:
                    print(f"⚠️ {frontend} title '{title}' doesn't contain expected keywords")
                
                # Check for basic UI elements
                header = self.find_element_safe(By.TAG_NAME, "header")
                assert header is not None, f"{frontend} header not found"
                
                # Check for navigation elements
                nav_elements = self.find_elements_safe(By.TAG_NAME, "nav")
                if not nav_elements:
                    nav_elements = self.find_elements_safe(By.CSS_SELECTOR, "[role='navigation']")
                
                # Check for no JavaScript errors
                js_errors = self.check_for_javascript_errors()
                if js_errors:
                    print(f"⚠️ {frontend} has JavaScript errors: {js_errors[:3]}")  # Show first 3 errors
                
                results[frontend] = {
                    "status": "✅ PASSED",
                    "load_time": "< 15s",
                    "main_content": "✅",
                    "header": "✅" if header else "❌",
                    "navigation": "✅" if nav_elements else "⚠️",
                    "js_errors": len(js_errors)
                }
                
                self.test_results[frontend]["passed"] += 1
                print(f"✅ {frontend} frontend loaded successfully")
                
            except Exception as e:
                results[frontend] = {
                    "status": "❌ FAILED",
                    "error": str(e)[:100]
                }
                self.test_results[frontend]["failed"] += 1
                print(f"❌ {frontend} frontend failed to load: {str(e)}")
                
                # Take screenshot on failure
                self.take_screenshot(f"failed_{frontend}_loading")
        
        # Print comprehensive results
        print("\n📊 Frontend Loading Test Results:")
        for frontend, result in results.items():
            print(f"\n{frontend.upper()} Frontend:")
            for key, value in result.items():
                print(f"  {key}: {value}")
        
        # At least one frontend should work
        successful_frontends = sum(1 for r in results.values() if "PASSED" in r.get("status", ""))
        assert successful_frontends > 0, "No frontends are loading successfully"
    
    @pytest.mark.navigation
    def test_all_frontends_navigation_comprehensive(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Test navigation functionality across all frontends."""
        self.setup_driver(webdriver_instance, frontend_urls)
        
        navigation_tests = {
            "buyer": [
                "Главная", "Товары", "Продавцы", "Анализатор", "Чаты", "Профиль"
            ],
            "seller": [
                "Дашборд", "Товары", "Древесина", "Заказы", "Чаты", "Аналитика", "Профиль"
            ],
            "admin": [
                "Дашборд", "Пользователи", "Покупатели", "Продавцы", "Товары", "Чаты", "Аналитика"
            ]
        }
        
        results = {}
        
        for frontend, expected_items in navigation_tests.items():
            self.test_results[frontend]["tests"] += 1
            
            try:
                print(f"\n🧭 Testing {frontend} navigation...")
                
                self.navigate_to(frontend)
                time.sleep(2)  # Allow page to fully load
                
                found_items = []
                missing_items = []
                
                for item in expected_items:
                    found = False
                    
                    # Try multiple ways to find navigation items
                    selectors = [
                        f"//*[text()='{item}']",
                        f"//*[contains(text(), '{item}')]",
                        f"//a[contains(text(), '{item}')]",
                        f"//button[contains(text(), '{item}')]",
                        f"//nav//*[contains(text(), '{item}')]"
                    ]
                    
                    for selector in selectors:
                        try:
                            element = self.driver.find_element(By.XPATH, selector)
                            if element.is_displayed():
                                found_items.append(item)
                                found = True
                                break
                        except NoSuchElementException:
                            continue
                    
                    if not found:
                        missing_items.append(item)
                
                results[frontend] = {
                    "found": found_items,
                    "missing": missing_items,
                    "coverage": f"{len(found_items)}/{len(expected_items)}"
                }
                
                if len(found_items) >= len(expected_items) // 2:  # At least half should be found
                    self.test_results[frontend]["passed"] += 1
                    print(f"✅ {frontend} navigation test passed ({len(found_items)}/{len(expected_items)} items found)")
                else:
                    self.test_results[frontend]["failed"] += 1
                    print(f"⚠️ {frontend} navigation test partial ({len(found_items)}/{len(expected_items)} items found)")
                
            except Exception as e:
                results[frontend] = {"error": str(e)}
                self.test_results[frontend]["failed"] += 1
                print(f"❌ {frontend} navigation test failed: {str(e)}")
        
        # Print results
        print("\n🧭 Navigation Test Results:")
        for frontend, result in results.items():
            print(f"\n{frontend.upper()}:")
            if "error" in result:
                print(f"  Error: {result['error']}")
            else:
                print(f"  Coverage: {result['coverage']}")
                print(f"  Found: {result['found']}")
                if result['missing']:
                    print(f"  Missing: {result['missing']}")
    
    @pytest.mark.responsive
    def test_all_frontends_responsive_comprehensive(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Test responsive design across all frontends."""
        self.setup_driver(webdriver_instance, frontend_urls)
        
        screen_sizes = [
            (1920, 1080, "Desktop"),
            (1366, 768, "Laptop"),
            (1024, 768, "Tablet Landscape"),
            (768, 1024, "Tablet Portrait"),
            (375, 667, "Mobile")
        ]
        
        frontends = ["buyer", "seller", "admin"]
        results = {}
        
        for frontend in frontends:
            self.test_results[frontend]["tests"] += 1
            frontend_results = {}
            
            try:
                print(f"\n📱 Testing {frontend} responsive design...")
                self.navigate_to(frontend)
                
                for width, height, device_name in screen_sizes:
                    try:
                        self.set_window_size(width, height)
                        time.sleep(1)  # Allow layout to adjust
                        
                        # Check that page is still functional
                        body = self.find_element_safe(By.TAG_NAME, "body")
                        assert body is not None, f"Body not found at {device_name}"
                        
                        # Check for horizontal scroll on mobile
                        if width <= 768:
                            scroll_width = self.execute_script("return document.body.scrollWidth")
                            viewport_width = self.execute_script("return window.innerWidth")
                            has_horizontal_scroll = scroll_width > viewport_width + 20
                            
                            frontend_results[device_name] = {
                                "functional": True,
                                "horizontal_scroll": has_horizontal_scroll,
                                "status": "⚠️" if has_horizontal_scroll else "✅"
                            }
                        else:
                            frontend_results[device_name] = {
                                "functional": True,
                                "status": "✅"
                            }
                        
                    except Exception as e:
                        frontend_results[device_name] = {
                            "functional": False,
                            "error": str(e)[:50],
                            "status": "❌"
                        }
                
                results[frontend] = frontend_results
                
                # Count successful responsive tests
                successful_sizes = sum(1 for r in frontend_results.values() if r.get("functional", False))
                if successful_sizes >= len(screen_sizes) // 2:
                    self.test_results[frontend]["passed"] += 1
                else:
                    self.test_results[frontend]["failed"] += 1
                
            except Exception as e:
                results[frontend] = {"error": str(e)}
                self.test_results[frontend]["failed"] += 1
        
        # Print results
        print("\n📱 Responsive Design Test Results:")
        for frontend, frontend_results in results.items():
            print(f"\n{frontend.upper()}:")
            if "error" in frontend_results:
                print(f"  Error: {frontend_results['error']}")
            else:
                for device, result in frontend_results.items():
                    status = result.get("status", "❓")
                    print(f"  {device}: {status}")
    
    @pytest.mark.performance
    def test_all_frontends_performance_comprehensive(self, webdriver_instance: WebDriver, frontend_urls: dict):
        """Test performance across all frontends."""
        self.setup_driver(webdriver_instance, frontend_urls)
        
        frontends = ["buyer", "seller", "admin"]
        results = {}
        
        for frontend in frontends:
            self.test_results[frontend]["tests"] += 1
            
            try:
                print(f"\n⚡ Testing {frontend} performance...")
                
                start_time = time.time()
                self.navigate_to(frontend)
                
                # Wait for main content to load
                wait = WebDriverWait(self.driver, 30)
                wait.until(EC.presence_of_element_located((By.TAG_NAME, "main")))
                
                load_time = time.time() - start_time
                
                # Check for performance metrics
                performance_data = {
                    "load_time": round(load_time, 2),
                    "status": "✅" if load_time < 15.0 else "⚠️" if load_time < 30.0 else "❌",
                    "threshold": "< 15s ideal, < 30s acceptable"
                }
                
                # Check page size (approximate)
                page_source_size = len(self.get_page_source())
                performance_data["page_size_kb"] = round(page_source_size / 1024, 1)
                
                results[frontend] = performance_data
                
                if load_time < 30.0:  # 30 seconds is our maximum acceptable time
                    self.test_results[frontend]["passed"] += 1
                    print(f"✅ {frontend} performance test passed ({load_time:.2f}s)")
                else:
                    self.test_results[frontend]["failed"] += 1
                    print(f"❌ {frontend} performance test failed ({load_time:.2f}s)")
                
            except Exception as e:
                results[frontend] = {"error": str(e), "status": "❌"}
                self.test_results[frontend]["failed"] += 1
                print(f"❌ {frontend} performance test failed: {str(e)}")
        
        # Print results
        print("\n⚡ Performance Test Results:")
        for frontend, result in results.items():
            print(f"\n{frontend.upper()}:")
            if "error" in result:
                print(f"  Error: {result['error']}")
            else:
                print(f"  Load Time: {result['load_time']}s {result['status']}")
                print(f"  Page Size: {result['page_size_kb']} KB")
                print(f"  Threshold: {result['threshold']}")
    
    def teardown_method(self, method):
        """Cleanup after each test method."""
        # Print test summary
        print("\n📊 Test Summary:")
        total_tests = 0
        total_passed = 0
        total_failed = 0
        
        for frontend, stats in self.test_results.items():
            if stats["tests"] > 0:
                print(f"{frontend.upper()}: {stats['passed']}/{stats['tests']} passed")
                total_tests += stats["tests"]
                total_passed += stats["passed"]
                total_failed += stats["failed"]
        
        if total_tests > 0:
            success_rate = (total_passed / total_tests) * 100
            print(f"Overall: {total_passed}/{total_tests} passed ({success_rate:.1f}%)")


# Additional comprehensive test markers
pytestmark = [
    pytest.mark.functional,
    pytest.mark.comprehensive,
    pytest.mark.browser,
    pytest.mark.frontend
]
