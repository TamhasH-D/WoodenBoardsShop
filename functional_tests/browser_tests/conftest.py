"""
Selenium Browser Tests Configuration.
Конфигурация для браузерных тестов с поддержкой множественных браузеров.
"""

import os
import pytest
import time
from typing import Dict, Generator
from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By


# Конфигурация браузеров
SELENIUM_HUB_URL = os.getenv("SELENIUM_HUB_URL", "http://selenium-hub:4444/wd/hub")
SCREENSHOT_DIR = os.getenv("SCREENSHOT_DIR", "/app/screenshots")
IMPLICIT_WAIT = 10
PAGE_LOAD_TIMEOUT = 30
SCRIPT_TIMEOUT = 30


@pytest.fixture(scope="session")
def frontend_urls() -> Dict[str, str]:
    """Fixture с URL всех frontend приложений."""
    return {
        "admin": os.getenv("FRONTEND_ADMIN_URL", "http://admin-frontend:80"),
        "seller": os.getenv("FRONTEND_SELLER_URL", "http://seller-frontend:80"),
        "buyer": os.getenv("FRONTEND_BUYER_URL", "http://buyer-frontend:80"),
    }


@pytest.fixture(scope="session")
def backend_url() -> str:
    """Fixture с URL backend API."""
    return os.getenv("BACKEND_API_URL", "http://test-backend:8000")


def pytest_addoption(parser):
    """Добавление опций командной строки для pytest."""
    parser.addoption(
        "--browser",
        action="store",
        default="chrome",
        help="Browser to run tests on: chrome, firefox, edge, all"
    )
    parser.addoption(
        "--headless",
        action="store_true",
        default=True,
        help="Run browsers in headless mode"
    )
    parser.addoption(
        "--window-size",
        action="store",
        default="1920,1080",
        help="Browser window size (width,height)"
    )
    parser.addoption(
        "--selenium-hub",
        action="store",
        default=SELENIUM_HUB_URL,
        help="Selenium Hub URL"
    )


def get_chrome_options(headless: bool = True, window_size: str = "1920,1080") -> ChromeOptions:
    """Получение опций для Chrome браузера."""
    options = ChromeOptions()
    
    if headless:
        options.add_argument("--headless")
    
    options.add_argument(f"--window-size={window_size}")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-plugins")
    options.add_argument("--disable-images")
    options.add_argument("--disable-javascript")  # Отключаем для ускорения
    options.add_argument("--disable-web-security")
    options.add_argument("--allow-running-insecure-content")
    options.add_argument("--ignore-certificate-errors")
    options.add_argument("--ignore-ssl-errors")
    options.add_argument("--ignore-certificate-errors-spki-list")
    
    # Настройки производительности
    options.add_argument("--memory-pressure-off")
    options.add_argument("--max_old_space_size=4096")
    
    return options


def get_firefox_options(headless: bool = True, window_size: str = "1920,1080") -> FirefoxOptions:
    """Получение опций для Firefox браузера."""
    options = FirefoxOptions()
    
    if headless:
        options.add_argument("--headless")
    
    width, height = window_size.split(",")
    options.add_argument(f"--width={width}")
    options.add_argument(f"--height={height}")
    
    # Отключение изображений для ускорения
    options.set_preference("permissions.default.image", 2)
    options.set_preference("dom.ipc.plugins.enabled.libflashplayer.so", False)
    
    return options


def get_edge_options(headless: bool = True, window_size: str = "1920,1080") -> EdgeOptions:
    """Получение опций для Edge браузера."""
    options = EdgeOptions()
    
    if headless:
        options.add_argument("--headless")
    
    options.add_argument(f"--window-size={window_size}")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    
    return options


@pytest.fixture(params=["chrome"])  # По умолчанию только Chrome
def browser_name(request):
    """Fixture для выбора браузера."""
    browser_option = request.config.getoption("--browser")
    
    if browser_option == "all":
        return request.param if hasattr(request, 'param') else "chrome"
    else:
        return browser_option


@pytest.fixture
def webdriver_instance(request, browser_name) -> Generator[webdriver.Remote, None, None]:
    """Fixture для создания WebDriver instance."""
    headless = request.config.getoption("--headless")
    window_size = request.config.getoption("--window-size")
    selenium_hub = request.config.getoption("--selenium-hub")
    
    driver = None
    
    try:
        if browser_name.lower() == "chrome":
            options = get_chrome_options(headless, window_size)
            capabilities = DesiredCapabilities.CHROME.copy()
            capabilities.update(options.to_capabilities())
            
        elif browser_name.lower() == "firefox":
            options = get_firefox_options(headless, window_size)
            capabilities = DesiredCapabilities.FIREFOX.copy()
            capabilities.update(options.to_capabilities())
            
        elif browser_name.lower() == "edge":
            options = get_edge_options(headless, window_size)
            capabilities = DesiredCapabilities.EDGE.copy()
            capabilities.update(options.to_capabilities())
            
        else:
            raise ValueError(f"Unsupported browser: {browser_name}")
        
        # Создание Remote WebDriver
        driver = webdriver.Remote(
            command_executor=selenium_hub,
            desired_capabilities=capabilities
        )
        
        # Настройка таймаутов
        driver.implicitly_wait(IMPLICIT_WAIT)
        driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
        driver.set_script_timeout(SCRIPT_TIMEOUT)
        
        yield driver
        
    except Exception as e:
        pytest.fail(f"Failed to create WebDriver for {browser_name}: {str(e)}")
        
    finally:
        if driver:
            try:
                driver.quit()
            except Exception as e:
                print(f"Error closing WebDriver: {str(e)}")


@pytest.fixture
def wait_for_element(webdriver_instance):
    """Fixture для ожидания элементов."""
    def _wait_for_element(locator, timeout=10):
        wait = WebDriverWait(webdriver_instance, timeout)
        return wait.until(EC.presence_of_element_located(locator))
    
    return _wait_for_element


@pytest.fixture
def take_screenshot(webdriver_instance, request):
    """Fixture для создания скриншотов."""
    def _take_screenshot(name: str = None):
        if not name:
            name = f"{request.node.name}_{int(time.time())}"
        
        screenshot_path = os.path.join(SCREENSHOT_DIR, f"{name}.png")
        
        # Создаем директорию если не существует
        os.makedirs(SCREENSHOT_DIR, exist_ok=True)
        
        try:
            webdriver_instance.save_screenshot(screenshot_path)
            print(f"Screenshot saved: {screenshot_path}")
            return screenshot_path
        except Exception as e:
            print(f"Failed to take screenshot: {str(e)}")
            return None
    
    return _take_screenshot


@pytest.fixture(autouse=True)
def screenshot_on_failure(webdriver_instance, request, take_screenshot):
    """Автоматическое создание скриншота при падении теста."""
    yield
    
    if request.node.rep_call.failed:
        screenshot_name = f"FAILED_{request.node.name}_{int(time.time())}"
        take_screenshot(screenshot_name)


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook для получения результата теста."""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)


@pytest.fixture
def wait_for_page_load(webdriver_instance):
    """Fixture для ожидания полной загрузки страницы."""
    def _wait_for_page_load(timeout=30):
        wait = WebDriverWait(webdriver_instance, timeout)
        wait.until(lambda driver: driver.execute_script("return document.readyState") == "complete")
        
        # Дополнительное ожидание для React приложений
        try:
            wait.until(lambda driver: driver.execute_script("return window.React !== undefined"))
        except:
            pass  # React может не быть доступен
    
    return _wait_for_page_load


@pytest.fixture
def browser_console_logs(webdriver_instance):
    """Fixture для получения логов браузера."""
    def _get_console_logs():
        try:
            logs = webdriver_instance.get_log('browser')
            return [log for log in logs if log['level'] in ['SEVERE', 'WARNING']]
        except Exception as e:
            print(f"Could not retrieve console logs: {str(e)}")
            return []
    
    return _get_console_logs


# Маркеры для pytest
def pytest_configure(config):
    """Конфигурация pytest маркеров."""
    config.addinivalue_line("markers", "browser: Browser tests")
    config.addinivalue_line("markers", "admin: Admin frontend tests")
    config.addinivalue_line("markers", "seller: Seller frontend tests")
    config.addinivalue_line("markers", "buyer: Buyer frontend tests")
    config.addinivalue_line("markers", "smoke: Smoke tests")
    config.addinivalue_line("markers", "navigation: Navigation tests")
    config.addinivalue_line("markers", "dashboard: Dashboard tests")
    config.addinivalue_line("markers", "products: Products tests")
    config.addinivalue_line("markers", "users: User management tests")
    config.addinivalue_line("markers", "chats: Chat functionality tests")
    config.addinivalue_line("markers", "analytics: Analytics tests")
    config.addinivalue_line("markers", "responsive: Responsive design tests")
    config.addinivalue_line("markers", "performance: Performance tests")
    config.addinivalue_line("markers", "security: Security tests")
    config.addinivalue_line("markers", "frontend: Frontend tests")


# Настройка логирования для Selenium
import logging
logging.getLogger('selenium').setLevel(logging.WARNING)
logging.getLogger('urllib3').setLevel(logging.WARNING)
