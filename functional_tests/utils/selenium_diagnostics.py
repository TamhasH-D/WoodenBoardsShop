#!/usr/bin/env python3
"""Диагностика проблем с Selenium Hub и Chrome Node."""

import os
import requests
import json
import sys
from typing import Dict, Any, Optional


class SeleniumDiagnostics:
    """Класс для диагностики Selenium Grid."""
    
    def __init__(self):
        self.selenium_hub_url = os.getenv("SELENIUM_HUB_URL", "http://selenium-hub:4444")
        self.chrome_node_url = "http://selenium-chrome:5555"
    
    def check_hub_status(self) -> Dict[str, Any]:
        """Проверка статуса Selenium Hub."""
        print("🔍 Диагностика Selenium Hub...")
        
        results = {
            "hub_accessible": False,
            "hub_ready": False,
            "grid_api_accessible": False,
            "sessions_info": None,
            "error_details": []
        }
        
        # Проверяем основной status endpoint
        try:
            response = requests.get(f"{self.selenium_hub_url}/wd/hub/status", timeout=10)
            results["hub_accessible"] = True
            
            if response.status_code == 200:
                data = response.json()
                results["hub_ready"] = data.get("value", {}).get("ready", False)
                print(f"✅ Hub доступен. Готовность: {results['hub_ready']}")
                print(f"📊 Hub статус: {json.dumps(data, indent=2)}")
            else:
                results["error_details"].append(f"Hub status code: {response.status_code}")
                print(f"❌ Hub вернул статус: {response.status_code}")
                
        except Exception as e:
            results["error_details"].append(f"Hub connection error: {str(e)}")
            print(f"❌ Ошибка подключения к Hub: {e}")
        
        # Проверяем Grid API
        try:
            response = requests.get(f"{self.selenium_hub_url}/grid/api/hub", timeout=10)
            if response.status_code == 200:
                results["grid_api_accessible"] = True
                print("✅ Grid API доступен")
            else:
                results["error_details"].append(f"Grid API status code: {response.status_code}")
                print(f"❌ Grid API недоступен: {response.status_code}")
        except Exception as e:
            results["error_details"].append(f"Grid API error: {str(e)}")
            print(f"❌ Ошибка Grid API: {e}")
        
        # Проверяем информацию о сессиях
        try:
            response = requests.get(f"{self.selenium_hub_url}/grid/api/hub/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                results["sessions_info"] = data
                print(f"📊 Информация о сессиях: {json.dumps(data, indent=2)}")
        except Exception as e:
            results["error_details"].append(f"Sessions info error: {str(e)}")
            print(f"⚠️ Не удалось получить информацию о сессиях: {e}")
        
        return results
    
    def check_chrome_node_status(self) -> Dict[str, Any]:
        """Проверка статуса Chrome Node."""
        print("\n🔍 Диагностика Chrome Node...")
        
        results = {
            "node_accessible": False,
            "node_ready": False,
            "node_info": None,
            "error_details": []
        }
        
        try:
            response = requests.get(f"{self.chrome_node_url}/status", timeout=10)
            results["node_accessible"] = True
            
            if response.status_code == 200:
                data = response.json()
                results["node_ready"] = data.get("value", {}).get("ready", False)
                results["node_info"] = data
                print(f"✅ Chrome Node доступен. Готовность: {results['node_ready']}")
                print(f"📊 Node статус: {json.dumps(data, indent=2)}")
            else:
                results["error_details"].append(f"Node status code: {response.status_code}")
                print(f"❌ Chrome Node вернул статус: {response.status_code}")
                
        except Exception as e:
            results["error_details"].append(f"Node connection error: {str(e)}")
            print(f"❌ Ошибка подключения к Chrome Node: {e}")
        
        return results
    
    def check_network_connectivity(self) -> Dict[str, Any]:
        """Проверка сетевой связности."""
        print("\n🔍 Проверка сетевой связности...")
        
        results = {
            "hub_ping": False,
            "node_ping": False,
            "dns_resolution": False,
            "error_details": []
        }
        
        # Проверяем DNS разрешение
        try:
            import socket
            socket.gethostbyname("selenium-hub")
            results["dns_resolution"] = True
            print("✅ DNS разрешение работает")
        except Exception as e:
            results["error_details"].append(f"DNS resolution error: {str(e)}")
            print(f"❌ Проблема с DNS разрешением: {e}")
        
        # Проверяем доступность портов
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex(("selenium-hub", 4444))
            sock.close()
            
            if result == 0:
                results["hub_ping"] = True
                print("✅ Порт 4444 Hub доступен")
            else:
                results["error_details"].append(f"Hub port 4444 not accessible: {result}")
                print(f"❌ Порт 4444 Hub недоступен: {result}")
        except Exception as e:
            results["error_details"].append(f"Hub port check error: {str(e)}")
            print(f"❌ Ошибка проверки порта Hub: {e}")
        
        return results
    
    def run_full_diagnostics(self) -> Dict[str, Any]:
        """Запуск полной диагностики."""
        print("🚀 Запуск полной диагностики Selenium Grid...")
        
        results = {
            "hub_status": self.check_hub_status(),
            "chrome_node_status": self.check_chrome_node_status(),
            "network_connectivity": self.check_network_connectivity(),
            "overall_health": False
        }
        
        # Определяем общее состояние
        hub_ok = results["hub_status"]["hub_ready"]
        node_ok = results["chrome_node_status"]["node_ready"]
        network_ok = results["network_connectivity"]["dns_resolution"]
        
        results["overall_health"] = hub_ok and node_ok and network_ok
        
        print(f"\n📊 ИТОГОВАЯ ДИАГНОСТИКА:")
        print(f"  Hub готов: {'✅' if hub_ok else '❌'}")
        print(f"  Chrome Node готов: {'✅' if node_ok else '❌'}")
        print(f"  Сеть работает: {'✅' if network_ok else '❌'}")
        print(f"  Общее состояние: {'✅ ЗДОРОВ' if results['overall_health'] else '❌ ПРОБЛЕМЫ'}")
        
        if not results["overall_health"]:
            print(f"\n🔧 РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ:")
            
            if not hub_ok:
                print("  - Проверьте логи Selenium Hub: make logs-selenium")
                print("  - Убедитесь, что Hub контейнер запущен: docker ps")
                print("  - Проверьте health check Hub в docker-compose")
            
            if not node_ok:
                print("  - Проверьте логи Chrome Node: docker logs selenium-chrome")
                print("  - Убедитесь, что Node может подключиться к Hub")
                print("  - Проверьте переменные окружения Node")
            
            if not network_ok:
                print("  - Проверьте Docker сети: docker network ls")
                print("  - Убедитесь, что контейнеры в одной сети")
                print("  - Перезапустите контейнеры: make down && make up")
        
        return results
    
    def suggest_fixes(self, diagnostics: Dict[str, Any]) -> None:
        """Предложения по исправлению проблем."""
        print(f"\n🛠️ ПРЕДЛОЖЕНИЯ ПО ИСПРАВЛЕНИЮ:")
        
        hub_errors = diagnostics["hub_status"]["error_details"]
        node_errors = diagnostics["chrome_node_status"]["error_details"]
        network_errors = diagnostics["network_connectivity"]["error_details"]
        
        if hub_errors:
            print(f"🔧 Проблемы с Hub:")
            for error in hub_errors:
                print(f"  - {error}")
            print(f"  Решения:")
            print(f"    • Увеличить timeout в health check")
            print(f"    • Обновить версию Selenium образа")
            print(f"    • Проверить переменные окружения")
        
        if node_errors:
            print(f"🔧 Проблемы с Chrome Node:")
            for error in node_errors:
                print(f"  - {error}")
            print(f"  Решения:")
            print(f"    • Увеличить shm_size для Chrome")
            print(f"    • Проверить подключение к Hub")
            print(f"    • Уменьшить количество сессий")
        
        if network_errors:
            print(f"🔧 Проблемы с сетью:")
            for error in network_errors:
                print(f"  - {error}")
            print(f"  Решения:")
            print(f"    • Пересоздать Docker сети")
            print(f"    • Проверить docker-compose конфигурацию")
            print(f"    • Перезапустить Docker daemon")


def main():
    """Основная функция."""
    diagnostics = SeleniumDiagnostics()
    results = diagnostics.run_full_diagnostics()
    
    # Сохраняем результаты в файл
    try:
        with open("/app/logs/selenium_diagnostics.json", "w") as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Результаты диагностики сохранены в /app/logs/selenium_diagnostics.json")
    except Exception as e:
        print(f"⚠️ Не удалось сохранить результаты: {e}")
    
    # Предложения по исправлению
    diagnostics.suggest_fixes(results)
    
    # Возвращаем код выхода
    if results["overall_health"]:
        print(f"\n🎉 Selenium Grid работает корректно!")
        sys.exit(0)
    else:
        print(f"\n💥 Обнаружены проблемы с Selenium Grid!")
        sys.exit(1)


if __name__ == "__main__":
    main()
