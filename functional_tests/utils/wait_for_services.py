#!/usr/bin/env python3
"""Утилита для ожидания готовности сервисов перед запуском тестов."""

import os
import time
import requests
import sys
from typing import List, Dict
from tenacity import retry, stop_after_attempt, wait_fixed, retry_if_exception_type


class ServiceWaiter:
    """Класс для ожидания готовности сервисов."""
    
    def __init__(self):
        # Убираем слеш в конце URL для консистентности
        self.backend_url = os.getenv("BACKEND_URL", "http://localhost:8001").rstrip('/')
        self.selenium_hub_url = os.getenv("SELENIUM_HUB_URL", "http://localhost:4444").rstrip('/')
        self.frontend_urls = {
            "admin": os.getenv("FRONTEND_ADMIN_URL", "http://localhost:8080").rstrip('/'),
            "seller": os.getenv("FRONTEND_SELLER_URL", "http://localhost:8081").rstrip('/'),
            "buyer": os.getenv("FRONTEND_BUYER_URL", "http://localhost:8082").rstrip('/'),
        }
    
    @retry(
        stop=stop_after_attempt(30),
        wait=wait_fixed(5),
        retry=retry_if_exception_type((requests.exceptions.RequestException, ConnectionError))
    )
    def wait_for_backend(self) -> bool:
        """Ожидание готовности backend сервиса."""
        health_url = f"{self.backend_url}/api/v1/health/"
        print(f"🔍 Проверка готовности backend: {health_url}")

        try:
            response = requests.get(health_url, timeout=10, allow_redirects=True)
            print(f"📊 Backend ответ: статус {response.status_code}, URL: {response.url}")

            if response.status_code == 200:
                print("✅ Backend сервис готов!")
                return True
            elif response.status_code == 307:
                print(f"⚠️ Backend перенаправил запрос (307). Финальный URL: {response.url}")
                # Если получили 307, но финальный запрос успешен, считаем это успехом
                if response.history and response.history[0].status_code == 307:
                    print("✅ Backend сервис готов (после перенаправления)!")
                    return True
                else:
                    raise requests.exceptions.RequestException(f"Backend redirect failed: {response.status_code}")
            else:
                print(f"❌ Backend вернул статус: {response.status_code}")
                # Попробуем альтернативные endpoints
                try:
                    alt_url = f"{self.backend_url}/api/v1/health"  # без слеша
                    alt_response = requests.get(alt_url, timeout=5, allow_redirects=True)
                    print(f"🔍 Альтернативный endpoint (без слеша): {alt_response.status_code}")
                    if alt_response.status_code == 200:
                        print("✅ Backend готов через альтернативный endpoint!")
                        return True
                except Exception as alt_e:
                    print(f"🔍 Альтернативный endpoint недоступен: {alt_e}")

                raise requests.exceptions.RequestException(f"Backend not ready: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка подключения к backend: {e}")
            raise
    
    @retry(
        stop=stop_after_attempt(30),
        wait=wait_fixed(5),
        retry=retry_if_exception_type((requests.exceptions.RequestException, ConnectionError))
    )
    def wait_for_selenium_hub(self) -> bool:
        """Ожидание готовности Selenium Hub."""
        print(f"🔍 Проверка готовности Selenium Hub: {self.selenium_hub_url}")

        try:
            # Используем правильный endpoint для Selenium 4.x
            response = requests.get(f"{self.selenium_hub_url}/status", timeout=15)
            if response.status_code == 200:
                data = response.json()
                print(f"📊 Selenium Hub ответ: {data}")

                # Проверяем готовность Hub
                if data.get("value", {}).get("ready", False):
                    print("✅ Selenium Hub готов!")

                    # Проверяем наличие узлов
                    nodes = data.get("value", {}).get("nodes", [])
                    if nodes:
                        active_nodes = [node for node in nodes if node.get("availability") == "UP"]
                        print(f"📊 Активных узлов: {len(active_nodes)}/{len(nodes)}")

                        if active_nodes:
                            total_slots = sum(len(node.get("slots", [])) for node in active_nodes)
                            print(f"🎯 Доступно слотов для тестирования: {total_slots}")
                        else:
                            print("⚠️ Нет активных узлов, но Hub готов")
                    else:
                        print("⚠️ Нет подключенных узлов, но Hub готов")

                    # Дополнительно проверяем доступность Grid API
                    try:
                        grid_response = requests.get(f"{self.selenium_hub_url}/grid/api/hub", timeout=10)
                        if grid_response.status_code == 200:
                            print("✅ Selenium Grid API доступен!")
                        else:
                            print(f"⚠️ Selenium Grid API недоступен: {grid_response.status_code}")
                    except Exception as e:
                        print(f"⚠️ Не удалось проверить Grid API: {e}")

                    return True
                else:
                    print(f"❌ Selenium Hub не готов. Статус: {data}")
                    raise requests.exceptions.RequestException("Selenium Hub not ready")
            else:
                print(f"❌ Selenium Hub вернул статус: {response.status_code}")
                raise requests.exceptions.RequestException(f"Selenium Hub not ready: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка подключения к Selenium Hub: {e}")
            # Дополнительная диагностика
            try:
                # Пробуем старый endpoint для совместимости
                alt_response = requests.get(f"{self.selenium_hub_url}/wd/hub/status", timeout=5)
                print(f"🔍 Старый endpoint /wd/hub/status: {alt_response.status_code}")
            except Exception as alt_e:
                print(f"🔍 Старый endpoint недоступен: {alt_e}")
            raise
    
    @retry(
        stop=stop_after_attempt(15),
        wait=wait_fixed(3),
        retry=retry_if_exception_type((requests.exceptions.RequestException, ConnectionError))
    )
    def wait_for_frontend(self, name: str, url: str) -> bool:
        """Ожидание готовности frontend сервиса."""
        print(f"🔍 Проверка готовности {name} frontend: {url}")
        
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print(f"✅ {name} frontend готов!")
                return True
            else:
                print(f"❌ {name} frontend вернул статус: {response.status_code}")
                raise requests.exceptions.RequestException(f"{name} frontend not ready: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка подключения к {name} frontend: {e}")
            raise
    
    def wait_for_all_services(self, include_frontends: bool = True) -> bool:
        """Ожидание готовности всех сервисов."""
        print("🚀 Начинаем ожидание готовности всех сервисов...")
        
        try:
            # Ожидаем backend
            self.wait_for_backend()
            
            # Ожидаем Selenium Hub
            self.wait_for_selenium_hub()
            
            # Ожидаем frontend сервисы (опционально)
            if include_frontends:
                for name, url in self.frontend_urls.items():
                    try:
                        self.wait_for_frontend(name, url)
                    except Exception as e:
                        print(f"⚠️ Предупреждение: {name} frontend недоступен: {e}")
                        # Не прерываем выполнение, если frontend недоступен
            
            print("🎉 Все необходимые сервисы готовы!")
            return True
            
        except Exception as e:
            print(f"💥 Критическая ошибка при ожидании сервисов: {e}")
            return False
    
    def check_service_health(self) -> Dict[str, bool]:
        """Проверка состояния всех сервисов."""
        health_status = {}
        
        # Проверяем backend
        try:
            response = requests.get(f"{self.backend_url}/api/v1/health/", timeout=5)
            health_status["backend"] = response.status_code == 200
        except Exception:
            health_status["backend"] = False
        
        # Проверяем Selenium Hub
        try:
            response = requests.get(f"{self.selenium_hub_url}/status", timeout=5)
            if response.status_code == 200:
                data = response.json()
                health_status["selenium_hub"] = data.get("value", {}).get("ready", False)
            else:
                health_status["selenium_hub"] = False
        except Exception:
            health_status["selenium_hub"] = False
        
        # Проверяем frontend сервисы
        for name, url in self.frontend_urls.items():
            try:
                response = requests.get(url, timeout=5)
                health_status[f"frontend_{name}"] = response.status_code == 200
            except Exception:
                health_status[f"frontend_{name}"] = False
        
        return health_status


def main():
    """Основная функция для запуска из командной строки."""
    waiter = ServiceWaiter()
    
    # Определяем, нужно ли ждать frontend сервисы
    test_type = os.getenv("TEST_TYPE", "all")
    include_frontends = test_type in ["browser", "integration", "all"]
    
    print(f"🎯 Тип тестов: {test_type}")
    print(f"🌐 Включить frontend сервисы: {include_frontends}")
    
    # Ожидаем готовности сервисов
    if waiter.wait_for_all_services(include_frontends=include_frontends):
        print("✅ Все сервисы готовы для тестирования!")
        
        # Выводим статус всех сервисов
        health_status = waiter.check_service_health()
        print("\n📊 Статус сервисов:")
        for service, status in health_status.items():
            status_icon = "✅" if status else "❌"
            print(f"  {status_icon} {service}: {'готов' if status else 'недоступен'}")
        
        sys.exit(0)
    else:
        print("💥 Не удалось дождаться готовности сервисов!")
        sys.exit(1)


if __name__ == "__main__":
    main()
