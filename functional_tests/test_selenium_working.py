#!/usr/bin/env python3
"""Простой тест для проверки работы Selenium Grid."""

import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC


def test_selenium_grid():
    """Тест подключения к Selenium Grid и базовой функциональности."""
    
    print("🔍 Тестирование Selenium Grid...")
    
    # Настройка Chrome опций
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Запуск без GUI
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = None
    try:
        # Подключение к Selenium Grid
        print("📡 Подключение к Selenium Hub...")
        driver = webdriver.Remote(
            command_executor="http://selenium-hub:4444/wd/hub",
            options=chrome_options
        )
        
        print("✅ Успешно подключились к Selenium Grid!")
        print(f"📋 Сессия ID: {driver.session_id}")
        print(f"🌐 Capabilities: {driver.capabilities['browserName']} {driver.capabilities['browserVersion']}")
        
        # Тест базовой функциональности
        print("🔍 Тестирование базовой функциональности...")
        
        # Переход на тестовую страницу
        driver.get("https://httpbin.org/html")
        print(f"📄 Заголовок страницы: {driver.title}")
        
        # Поиск элемента
        wait = WebDriverWait(driver, 10)
        h1_element = wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        print(f"📝 Найден элемент H1: {h1_element.text}")
        
        # Получение размера окна
        window_size = driver.get_window_size()
        print(f"🖥️ Размер окна: {window_size['width']}x{window_size['height']}")
        
        # Тест JavaScript
        result = driver.execute_script("return navigator.userAgent;")
        print(f"🔧 User Agent: {result[:50]}...")
        
        print("🎉 Все тесты прошли успешно!")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при тестировании Selenium: {e}")
        return False
        
    finally:
        if driver:
            print("🔚 Закрытие браузера...")
            driver.quit()


def test_grid_status():
    """Проверка статуса Grid через API."""
    import requests

    print("\n🔍 Проверка статуса Selenium Grid...")

    try:
        response = requests.get("http://selenium-hub:4444/status", timeout=10)
        assert response.status_code == 200, f"Grid недоступен: HTTP {response.status_code}"

        data = response.json()
        print(f"✅ Grid готов: {data['value']['ready']}")
        print(f"📊 Количество узлов: {len(data['value']['nodes'])}")

        assert data['value']['ready'] is True, "Grid не готов"
        assert len(data['value']['nodes']) > 0, "Нет доступных узлов"

        for i, node in enumerate(data['value']['nodes']):
            print(f"  📍 Узел {i+1}: {node['availability']} ({len(node['slots'])} слотов)")
            assert node['availability'] == 'UP', f"Узел {i+1} недоступен"

    except Exception as e:
        print(f"❌ Ошибка проверки статуса: {e}")
        raise


if __name__ == "__main__":
    print("🚀 Тестирование Selenium Grid")
    print("=" * 50)
    
    # Проверка статуса Grid
    grid_ok = test_grid_status()
    
    if grid_ok:
        # Тест браузера
        selenium_ok = test_selenium_grid()
        
        if selenium_ok:
            print("\n🎉 Selenium Grid полностью работает!")
            exit(0)
        else:
            print("\n💥 Проблемы с запуском браузера")
            exit(1)
    else:
        print("\n💥 Selenium Grid недоступен")
        exit(1)
