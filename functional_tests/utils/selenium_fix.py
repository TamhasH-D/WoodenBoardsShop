#!/usr/bin/env python3
"""Автоматическое исправление проблем с Selenium Grid."""

import os
import subprocess
import time
import requests
import sys
from typing import List, Dict, Any


class SeleniumFixer:
    """Класс для автоматического исправления проблем Selenium."""
    
    def __init__(self):
        self.compose_file = "docker-compose.test.yaml"
        self.project_name = "diplom-functional-tests"
        self.selenium_hub_url = "http://selenium-hub:4444"
    
    def run_command(self, command: List[str], capture_output: bool = True) -> subprocess.CompletedProcess:
        """Выполнение команды с логированием."""
        print(f"🔧 Выполняем: {' '.join(command)}")
        
        try:
            result = subprocess.run(
                command,
                capture_output=capture_output,
                text=True,
                timeout=300  # 5 минут timeout
            )
            
            if result.returncode == 0:
                print(f"✅ Команда выполнена успешно")
                if capture_output and result.stdout:
                    print(f"📤 Вывод: {result.stdout.strip()}")
            else:
                print(f"❌ Команда завершилась с ошибкой: {result.returncode}")
                if capture_output and result.stderr:
                    print(f"📤 Ошибка: {result.stderr.strip()}")
            
            return result
        except subprocess.TimeoutExpired:
            print(f"⏰ Команда превысила timeout (5 минут)")
            raise
        except Exception as e:
            print(f"💥 Ошибка выполнения команды: {e}")
            raise
    
    def stop_selenium_services(self) -> bool:
        """Остановка Selenium сервисов."""
        print("🛑 Остановка Selenium сервисов...")
        
        commands = [
            ["docker-compose", "-f", self.compose_file, "-p", self.project_name, "stop", "selenium-chrome"],
            ["docker-compose", "-f", self.compose_file, "-p", self.project_name, "stop", "selenium-hub"],
        ]
        
        for command in commands:
            try:
                result = self.run_command(command)
                if result.returncode != 0:
                    print(f"⚠️ Предупреждение: не удалось остановить сервис")
            except Exception as e:
                print(f"⚠️ Предупреждение при остановке: {e}")
        
        return True
    
    def remove_selenium_containers(self) -> bool:
        """Удаление Selenium контейнеров."""
        print("🗑️ Удаление Selenium контейнеров...")
        
        commands = [
            ["docker", "rm", "-f", "selenium-chrome"],
            ["docker", "rm", "-f", "selenium-hub"],
        ]
        
        for command in commands:
            try:
                result = self.run_command(command)
                if result.returncode != 0:
                    print(f"⚠️ Контейнер уже удален или не существует")
            except Exception as e:
                print(f"⚠️ Предупреждение при удалении: {e}")
        
        return True
    
    def pull_selenium_images(self) -> bool:
        """Обновление Selenium образов."""
        print("📥 Обновление Selenium образов...")
        
        images = [
            "selenium/hub:4.25.0",
            "selenium/node-chrome:4.25.0"
        ]
        
        for image in images:
            try:
                result = self.run_command(["docker", "pull", image], capture_output=False)
                if result.returncode != 0:
                    print(f"❌ Не удалось обновить образ {image}")
                    return False
            except Exception as e:
                print(f"❌ Ошибка при обновлении образа {image}: {e}")
                return False
        
        return True
    
    def rebuild_selenium_services(self) -> bool:
        """Пересборка Selenium сервисов."""
        print("🔄 Пересборка Selenium сервисов...")
        
        try:
            # Собираем сервисы
            result = self.run_command([
                "docker-compose", "-f", self.compose_file, "-p", self.project_name,
                "build", "--no-cache", "selenium-hub", "selenium-chrome"
            ], capture_output=False)
            
            if result.returncode != 0:
                print(f"❌ Не удалось пересобрать Selenium сервисы")
                return False
            
            return True
        except Exception as e:
            print(f"❌ Ошибка при пересборке: {e}")
            return False
    
    def start_selenium_services(self) -> bool:
        """Запуск Selenium сервисов."""
        print("🚀 Запуск Selenium сервисов...")
        
        try:
            # Запускаем Hub
            result = self.run_command([
                "docker-compose", "-f", self.compose_file, "-p", self.project_name,
                "up", "-d", "selenium-hub"
            ])
            
            if result.returncode != 0:
                print(f"❌ Не удалось запустить Selenium Hub")
                return False
            
            # Ждем готовности Hub
            print("⏳ Ожидание готовности Selenium Hub...")
            time.sleep(30)
            
            # Запускаем Chrome Node
            result = self.run_command([
                "docker-compose", "-f", self.compose_file, "-p", self.project_name,
                "up", "-d", "selenium-chrome"
            ])
            
            if result.returncode != 0:
                print(f"❌ Не удалось запустить Chrome Node")
                return False
            
            # Ждем готовности Node
            print("⏳ Ожидание готовности Chrome Node...")
            time.sleep(20)
            
            return True
        except Exception as e:
            print(f"❌ Ошибка при запуске: {e}")
            return False
    
    def verify_selenium_health(self) -> bool:
        """Проверка здоровья Selenium после исправления."""
        print("🏥 Проверка здоровья Selenium Grid...")
        
        max_attempts = 10
        for attempt in range(1, max_attempts + 1):
            print(f"🔍 Попытка {attempt}/{max_attempts}")
            
            try:
                # Проверяем Hub
                response = requests.get(f"{self.selenium_hub_url}/wd/hub/status", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if data.get("value", {}).get("ready", False):
                        print("✅ Selenium Hub готов!")
                        
                        # Дополнительная проверка Grid API
                        try:
                            grid_response = requests.get(f"{self.selenium_hub_url}/grid/api/hub", timeout=5)
                            if grid_response.status_code == 200:
                                print("✅ Selenium Grid API работает!")
                                return True
                        except Exception:
                            pass
                
                print(f"⏳ Hub еще не готов, ждем...")
                time.sleep(10)
                
            except Exception as e:
                print(f"❌ Ошибка проверки (попытка {attempt}): {e}")
                time.sleep(10)
        
        print(f"❌ Selenium Grid не готов после {max_attempts} попыток")
        return False
    
    def fix_selenium_issues(self) -> bool:
        """Полное исправление проблем Selenium."""
        print("🔧 Начинаем автоматическое исправление Selenium проблем...")
        
        steps = [
            ("Остановка сервисов", self.stop_selenium_services),
            ("Удаление контейнеров", self.remove_selenium_containers),
            ("Обновление образов", self.pull_selenium_images),
            ("Запуск сервисов", self.start_selenium_services),
            ("Проверка здоровья", self.verify_selenium_health),
        ]
        
        for step_name, step_func in steps:
            print(f"\n📋 Шаг: {step_name}")
            try:
                if not step_func():
                    print(f"❌ Шаг '{step_name}' завершился неудачно")
                    return False
                print(f"✅ Шаг '{step_name}' выполнен успешно")
            except Exception as e:
                print(f"💥 Критическая ошибка на шаге '{step_name}': {e}")
                return False
        
        print(f"\n🎉 Все проблемы Selenium успешно исправлены!")
        return True
    
    def show_selenium_logs(self) -> None:
        """Показать логи Selenium для диагностики."""
        print("\n📋 Логи Selenium Hub:")
        try:
            self.run_command([
                "docker-compose", "-f", self.compose_file, "-p", self.project_name,
                "logs", "--tail=50", "selenium-hub"
            ], capture_output=False)
        except Exception as e:
            print(f"❌ Не удалось получить логи Hub: {e}")
        
        print("\n📋 Логи Chrome Node:")
        try:
            self.run_command([
                "docker-compose", "-f", self.compose_file, "-p", self.project_name,
                "logs", "--tail=50", "selenium-chrome"
            ], capture_output=False)
        except Exception as e:
            print(f"❌ Не удалось получить логи Chrome Node: {e}")


def main():
    """Основная функция."""
    fixer = SeleniumFixer()
    
    print("🚀 Автоматическое исправление проблем Selenium Grid")
    print("=" * 60)
    
    # Показываем текущие логи для диагностики
    fixer.show_selenium_logs()
    
    print("\n" + "=" * 60)
    
    # Запускаем исправление
    if fixer.fix_selenium_issues():
        print(f"\n🎉 Selenium Grid успешно исправлен и готов к работе!")
        sys.exit(0)
    else:
        print(f"\n💥 Не удалось исправить проблемы Selenium Grid!")
        print(f"🔍 Рекомендуется ручная диагностика:")
        print(f"  - make logs-selenium")
        print(f"  - make logs-selenium-chrome")
        print(f"  - make selenium-diagnostics")
        sys.exit(1)


if __name__ == "__main__":
    main()
