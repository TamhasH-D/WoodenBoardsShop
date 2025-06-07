import os
import pytest
import asyncio
import time
from datetime import datetime
from typing import AsyncGenerator, Generator, Dict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import httpx
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory
from utils.test_logger import TestLogger


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Создает event loop для всей сессии тестов."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def backend_url() -> str:
    """URL backend сервиса для тестов."""
    return os.getenv("BACKEND_URL", "http://localhost:8001")


@pytest.fixture(scope="session")
def selenium_hub_url() -> str:
    """URL Selenium Hub для браузерных тестов."""
    return os.getenv("SELENIUM_HUB_URL", "http://localhost:4444/wd/hub")





@pytest.fixture(scope="session")
async def api_client(backend_url: str) -> AsyncGenerator[APIClient, None]:
    """HTTP клиент для API тестов."""
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        api_client = APIClient(client)
        yield api_client


@pytest.fixture(scope="function")
def chrome_options() -> Options:
    """Настройки Chrome для Selenium."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-plugins")
    options.add_argument("--disable-images")
    return options


@pytest.fixture(scope="function")
def webdriver_instance(selenium_hub_url: str, chrome_options: Options) -> Generator[webdriver.Remote, None, None]:
    """WebDriver instance для браузерных тестов."""
    capabilities = DesiredCapabilities.CHROME.copy()
    capabilities.update(chrome_options.to_capabilities())

    driver = webdriver.Remote(
        command_executor=selenium_hub_url,
        desired_capabilities=capabilities
    )
    driver.implicitly_wait(10)
    yield driver
    driver.quit()


@pytest.fixture(scope="function")
async def test_data_factory(api_client: APIClient) -> TestDataFactory:
    """Фабрика для создания тестовых данных."""
    factory = TestDataFactory(api_client)
    yield factory
    # Cleanup после теста
    await factory.cleanup()


@pytest.fixture(autouse=True)
async def cleanup_test_data(api_client: APIClient):
    """Автоматическая очистка тестовых данных после каждого теста."""
    yield
    # Здесь можно добавить логику очистки, если необходимо


def pytest_configure(config):
    """Конфигурация pytest."""
    # Создание директорий для отчетов и логов
    os.makedirs("reports", exist_ok=True)
    os.makedirs("screenshots", exist_ok=True)
    os.makedirs("logs", exist_ok=True)

    # Регистрация плагина логирования
    from utils.pytest_logger_plugin import TestLoggerPlugin
    if not hasattr(config, '_test_logger_plugin'):
        config._test_logger_plugin = TestLoggerPlugin()
        config.pluginmanager.register(config._test_logger_plugin, "test_logger_plugin")


def pytest_runtest_makereport(item, call):
    """Создание скриншотов при падении браузерных тестов."""
    if call.when == "call" and call.excinfo is not None:
        # Проверяем, есть ли webdriver в фикстурах теста
        if hasattr(item, "funcargs") and "webdriver_instance" in item.funcargs:
            driver = item.funcargs["webdriver_instance"]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = f"screenshots/{item.name}_{timestamp}.png"
            driver.save_screenshot(screenshot_path)
            print(f"Скриншот сохранен: {screenshot_path}")

            # Логирование скриншота
            logger = TestLogger.get_test_logger() if hasattr(TestLogger, 'get_test_logger') else None
            if logger:
                logger.log_test_result(
                    f"SCREENSHOT_{item.name}",
                    "INFO",
                    0.0,
                    f"Скриншот сохранен: {screenshot_path}"
                )


@pytest.fixture(scope="session")
def frontend_urls() -> Dict[str, str]:
    """URL-адреса frontend приложений."""
    return {
        "buyer": "http://test-buyer-frontend:3000",
        "seller": "http://test-seller-frontend:3000",
        "admin": "http://test-admin-frontend:3000"
    }


@pytest.fixture(scope="function")
async def enhanced_test_data_factory(api_client: APIClient):
    """Расширенная фабрика тестовых данных с автоматической очисткой."""
    from utils.enhanced_data_factory import EnhancedTestDataFactory
    factory = EnhancedTestDataFactory(api_client)
    yield factory
    await factory.cleanup()


@pytest.fixture(scope="session")
def performance_thresholds() -> Dict[str, float]:
    """Пороговые значения для тестов производительности."""
    return {
        "api_response_time": 2.0,  # секунды
        "page_load_time": 5.0,     # секунды
        "concurrent_requests": 50,  # количество
        "max_memory_usage": 512,   # MB
    }


@pytest.fixture(scope="function")
async def clean_database(api_client: APIClient):
    """Очистка базы данных перед тестом."""
    # Очищаем все тестовые данные перед началом теста
    entities_to_clean = [
        "/api/v1/chat-messages",
        "/api/v1/chat-threads",
        "/api/v1/images",
        "/api/v1/products",
        "/api/v1/wooden-boards",
        "/api/v1/wood-type-prices",
        "/api/v1/wood-types",
        "/api/v1/sellers",
        "/api/v1/buyers"
    ]

    for endpoint in entities_to_clean:
        try:
            # Получаем все сущности
            response = await api_client.get(f"{endpoint}/?limit=1000")
            if response.status_code == 200:
                data = response.json()
                if "data" in data:
                    # Удаляем каждую сущность
                    for item in data["data"]:
                        await api_client.delete(f"{endpoint}/{item['id']}")
        except Exception:
            # Игнорируем ошибки при очистке
            pass


@pytest.fixture(scope="function")
async def sample_marketplace_data(api_client: APIClient, enhanced_test_data_factory):
    """Создает образцовые данные маркетплейса для тестов."""
    # Создаем базовый набор данных
    scenario_data = await enhanced_test_data_factory.create_complete_marketplace_scenario()
    return scenario_data


def pytest_html_report_title(report):
    """Заголовок для HTML отчета."""
    report.title = f"Функциональные тесты WoodenBoardsShop - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"


