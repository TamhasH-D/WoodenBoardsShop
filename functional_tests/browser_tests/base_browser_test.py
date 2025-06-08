"""
Base Browser Test Classes.
Базовые классы для браузерных тестов с общей функциональностью.
"""

import time
import os
from typing import Dict, List, Optional, Tuple
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import (
    TimeoutException, 
    NoSuchElementException, 
    ElementNotInteractableException,
    StaleElementReferenceException
)


class BaseBrowserTest:
    """Базовый класс для всех браузерных тестов."""
    
    def __init__(self):
        self.driver: Optional[WebDriver] = None
        self.wait: Optional[WebDriverWait] = None
        self.frontend_urls: Dict[str, str] = {}
        self.screenshot_dir = os.getenv("SCREENSHOT_DIR", "/app/screenshots")
        
    def setup_driver(self, driver: WebDriver, frontend_urls: Dict[str, str]):
        """Инициализация драйвера и URL."""
        self.driver = driver
        self.wait = WebDriverWait(driver, 10)
        self.frontend_urls = frontend_urls
        
    def navigate_to(self, frontend: str, path: str = "") -> None:
        """Навигация к указанному frontend."""
        if frontend not in self.frontend_urls:
            raise ValueError(f"Unknown frontend: {frontend}")
            
        url = f"{self.frontend_urls[frontend]}{path}"
        self.driver.get(url)
        self.wait_for_page_load()
        
    def wait_for_page_load(self, timeout: int = 30) -> None:
        """Ожидание полной загрузки страницы."""
        try:
            # Ждем готовности DOM
            self.wait.until(
                lambda driver: driver.execute_script("return document.readyState") == "complete"
            )
            
            # Дополнительное ожидание для React приложений
            try:
                WebDriverWait(self.driver, 5).until(
                    lambda driver: driver.execute_script("return window.React !== undefined")
                )
            except TimeoutException:
                pass  # React может не быть доступен
                
        except TimeoutException:
            print(f"Page load timeout after {timeout} seconds")
            
    def find_element_safe(self, by: By, value: str, timeout: int = 10) -> Optional:
        """Безопасный поиск элемента с обработкой исключений."""
        try:
            wait = WebDriverWait(self.driver, timeout)
            return wait.until(EC.presence_of_element_located((by, value)))
        except TimeoutException:
            return None
            
    def find_elements_safe(self, by: By, value: str) -> List:
        """Безопасный поиск множественных элементов."""
        try:
            return self.driver.find_elements(by, value)
        except NoSuchElementException:
            return []
            
    def click_element_safe(self, by: By, value: str, timeout: int = 10) -> bool:
        """Безопасный клик по элементу."""
        try:
            wait = WebDriverWait(self.driver, timeout)
            element = wait.until(EC.element_to_be_clickable((by, value)))
            element.click()
            return True
        except (TimeoutException, ElementNotInteractableException):
            return False
            
    def send_keys_safe(self, by: By, value: str, text: str, timeout: int = 10) -> bool:
        """Безопасный ввод текста."""
        try:
            wait = WebDriverWait(self.driver, timeout)
            element = wait.until(EC.presence_of_element_located((by, value)))
            element.clear()
            element.send_keys(text)
            return True
        except (TimeoutException, ElementNotInteractableException):
            return False
            
    def wait_for_element_visible(self, by: By, value: str, timeout: int = 10) -> bool:
        """Ожидание видимости элемента."""
        try:
            wait = WebDriverWait(self.driver, timeout)
            wait.until(EC.visibility_of_element_located((by, value)))
            return True
        except TimeoutException:
            return False
            
    def wait_for_element_invisible(self, by: By, value: str, timeout: int = 10) -> bool:
        """Ожидание исчезновения элемента."""
        try:
            wait = WebDriverWait(self.driver, timeout)
            wait.until(EC.invisibility_of_element_located((by, value)))
            return True
        except TimeoutException:
            return False
            
    def scroll_to_element(self, element) -> None:
        """Прокрутка к элементу."""
        self.driver.execute_script("arguments[0].scrollIntoView(true);", element)
        time.sleep(0.5)
        
    def hover_over_element(self, element) -> None:
        """Наведение курсора на элемент."""
        actions = ActionChains(self.driver)
        actions.move_to_element(element).perform()
        
    def take_screenshot(self, name: str = None) -> str:
        """Создание скриншота."""
        if not name:
            name = f"screenshot_{int(time.time())}"
            
        screenshot_path = os.path.join(self.screenshot_dir, f"{name}.png")
        os.makedirs(self.screenshot_dir, exist_ok=True)
        
        try:
            self.driver.save_screenshot(screenshot_path)
            return screenshot_path
        except Exception as e:
            print(f"Failed to take screenshot: {str(e)}")
            return ""
            
    def get_page_title(self) -> str:
        """Получение заголовка страницы."""
        return self.driver.title
        
    def get_current_url(self) -> str:
        """Получение текущего URL."""
        return self.driver.current_url
        
    def get_page_source(self) -> str:
        """Получение исходного кода страницы."""
        return self.driver.page_source
        
    def execute_script(self, script: str, *args):
        """Выполнение JavaScript."""
        return self.driver.execute_script(script, *args)
        
    def get_console_logs(self) -> List[Dict]:
        """Получение логов консоли браузера."""
        try:
            return self.driver.get_log('browser')
        except Exception:
            return []
            
    def check_for_javascript_errors(self) -> List[str]:
        """Проверка на JavaScript ошибки."""
        logs = self.get_console_logs()
        errors = []
        
        for log in logs:
            if log['level'] == 'SEVERE':
                errors.append(log['message'])
                
        return errors
        
    def wait_for_ajax_complete(self, timeout: int = 10) -> bool:
        """Ожидание завершения AJAX запросов."""
        try:
            wait = WebDriverWait(self.driver, timeout)
            wait.until(lambda driver: driver.execute_script("return jQuery.active == 0"))
            return True
        except (TimeoutException, Exception):
            return False
            
    def set_window_size(self, width: int, height: int) -> None:
        """Установка размера окна браузера."""
        self.driver.set_window_size(width, height)
        
    def maximize_window(self) -> None:
        """Максимизация окна браузера."""
        self.driver.maximize_window()
        
    def refresh_page(self) -> None:
        """Обновление страницы."""
        self.driver.refresh()
        self.wait_for_page_load()


class FrontendTestMixin:
    """Mixin с методами для тестирования frontend приложений."""
    
    def assert_page_title_contains(self, expected_text: str) -> None:
        """Проверка, что заголовок страницы содержит ожидаемый текст."""
        title = self.get_page_title().lower()
        expected = expected_text.lower()
        assert expected in title, f"Page title '{title}' does not contain '{expected}'"
        
    def assert_element_present(self, by: By, value: str) -> None:
        """Проверка присутствия элемента на странице."""
        element = self.find_element_safe(by, value)
        assert element is not None, f"Element not found: {by}={value}"
        
    def assert_element_visible(self, by: By, value: str) -> None:
        """Проверка видимости элемента."""
        assert self.wait_for_element_visible(by, value), f"Element not visible: {by}={value}"
        
    def assert_element_text_contains(self, by: By, value: str, expected_text: str) -> None:
        """Проверка, что текст элемента содержит ожидаемый текст."""
        element = self.find_element_safe(by, value)
        assert element is not None, f"Element not found: {by}={value}"
        
        actual_text = element.text.lower()
        expected = expected_text.lower()
        assert expected in actual_text, f"Element text '{actual_text}' does not contain '{expected}'"
        
    def assert_url_contains(self, expected_path: str) -> None:
        """Проверка, что URL содержит ожидаемый путь."""
        current_url = self.get_current_url()
        assert expected_path in current_url, f"URL '{current_url}' does not contain '{expected_path}'"
        
    def assert_no_javascript_errors(self) -> None:
        """Проверка отсутствия JavaScript ошибок."""
        errors = self.check_for_javascript_errors()
        assert len(errors) == 0, f"JavaScript errors found: {errors}"
        
    def test_navigation_menu(self, expected_items: List[str]) -> None:
        """Тестирование навигационного меню."""
        for item in expected_items:
            # Ищем элемент меню по тексту
            found = False
            
            # Попытка найти по точному тексту
            try:
                element = self.driver.find_element(By.XPATH, f"//*[text()='{item}']")
                if element.is_displayed():
                    found = True
            except NoSuchElementException:
                pass
                
            # Попытка найти по частичному тексту
            if not found:
                try:
                    element = self.driver.find_element(By.PARTIAL_LINK_TEXT, item)
                    if element.is_displayed():
                        found = True
                except NoSuchElementException:
                    pass
                    
            # Попытка найти по содержимому текста
            if not found:
                try:
                    element = self.driver.find_element(By.XPATH, f"//*[contains(text(), '{item}')]")
                    if element.is_displayed():
                        found = True
                except NoSuchElementException:
                    pass
                    
            if not found:
                print(f"Warning: Navigation item '{item}' not found")
                
    def test_responsive_design(self, screen_sizes: List[Tuple[int, int]]) -> None:
        """Тестирование адаптивного дизайна."""
        for width, height in screen_sizes:
            self.set_window_size(width, height)
            time.sleep(1)  # Ждем перерисовки
            
            # Проверяем, что страница отображается корректно
            body = self.find_element_safe(By.TAG_NAME, "body")
            assert body is not None, f"Body not found at {width}x{height}"
            assert body.is_displayed(), f"Body not visible at {width}x{height}"
            
            # Проверяем отсутствие горизонтального скролла на мобильных
            if width <= 768:
                scroll_width = self.execute_script("return document.body.scrollWidth")
                viewport_width = self.execute_script("return window.innerWidth")
                assert scroll_width <= viewport_width + 20, \
                    f"Horizontal scroll detected at {width}x{height}"
                    
    def test_page_load_performance(self, max_load_time: float = 10.0) -> None:
        """Тестирование производительности загрузки страницы."""
        start_time = time.time()
        self.wait_for_page_load()
        load_time = time.time() - start_time
        
        assert load_time < max_load_time, \
            f"Page load time {load_time:.2f}s exceeds maximum {max_load_time}s"
