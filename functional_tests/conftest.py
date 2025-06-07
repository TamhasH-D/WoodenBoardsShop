import os
import pytest
import asyncio
from typing import AsyncGenerator, Generator
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import httpx
from utils.api_client import APIClient
from utils.data_factory import TestDataFactory


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
def frontend_urls() -> dict:
    """URLs всех frontend приложений."""
    return {
        "admin": os.getenv("FRONTEND_ADMIN_URL", "http://localhost:8080"),
        "seller": os.getenv("FRONTEND_SELLER_URL", "http://localhost:8081"),
        "buyer": os.getenv("FRONTEND_BUYER_URL", "http://localhost:8082"),
    }


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
    # Создание директорий для отчетов
    os.makedirs("reports", exist_ok=True)
    os.makedirs("screenshots", exist_ok=True)


def pytest_runtest_makereport(item, call):
    """Создание скриншотов при падении браузерных тестов."""
    if call.when == "call" and call.excinfo is not None:
        # Проверяем, есть ли webdriver в фикстурах теста
        if hasattr(item, "funcargs") and "webdriver_instance" in item.funcargs:
            driver = item.funcargs["webdriver_instance"]
            screenshot_path = f"screenshots/{item.name}_{call.when}.png"
            driver.save_screenshot(screenshot_path)
            print(f"Скриншот сохранен: {screenshot_path}")


@pytest.fixture(scope="session")
def pytest_html_report_title():
    """Заголовок для HTML отчета."""
    return "Функциональные тесты - Diplom Project"