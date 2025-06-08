#!/usr/bin/env python3
"""Финальный тест для проверки работы Selenium Grid."""

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def main():
    print('🚀 Финальный тест Selenium Grid')
    print('=' * 50)

    # Проверка статуса Grid
    try:
        response = requests.get('http://selenium-hub:4444/status', timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f'✅ Grid готов: {data["value"]["ready"]}')
            nodes = data['value']['nodes']
            print(f'📊 Количество узлов: {len(nodes)}')
            for i, node in enumerate(nodes):
                print(f'  📍 Узел {i+1}: {node["availability"]} ({len(node["slots"])} слотов)')
        else:
            print(f'❌ Grid недоступен: HTTP {response.status_code}')
            return False
    except Exception as e:
        print(f'❌ Ошибка проверки статуса: {e}')
        return False

    # Тест браузера
    print('\n🔍 Тестирование браузера...')
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')

    driver = None
    try:
        print('📡 Подключение к Selenium Hub...')
        driver = webdriver.Remote(
            command_executor='http://selenium-hub:4444/wd/hub',
            options=chrome_options
        )
        
        print(f'✅ Успешно подключились к Selenium Grid!')
        print(f'📋 Сессия ID: {driver.session_id}')
        print(f'🌐 Capabilities: {driver.capabilities["browserName"]} {driver.capabilities["browserVersion"]}')
        
        # Тест базовой функциональности
        print('🔍 Тестирование базовой функциональности...')
        driver.get('data:text/html,<html><head><title>Test Page</title></head><body><h1>Hello Selenium!</h1></body></html>')
        print(f'📄 Заголовок страницы: {driver.title}')
        
        # Получение размера окна
        window_size = driver.get_window_size()
        print(f'🖥️ Размер окна: {window_size["width"]}x{window_size["height"]}')
        
        # Тест JavaScript
        result = driver.execute_script("return 'JavaScript работает!';")
        print(f'🔧 JavaScript тест: {result}')
        
        print('🎉 Все тесты прошли успешно!')
        return True
        
    except Exception as e:
        print(f'❌ Ошибка при тестировании Selenium: {e}')
        return False
        
    finally:
        if driver:
            print('🔚 Закрытие браузера...')
            driver.quit()

if __name__ == "__main__":
    success = main()
    if success:
        print('\n🎉 Selenium Grid полностью работает!')
        exit(0)
    else:
        print('\n💥 Проблемы с Selenium Grid')
        exit(1)
