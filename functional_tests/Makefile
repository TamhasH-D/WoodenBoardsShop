# Makefile для функциональных тестов

.PHONY: help build up down test test-api test-browser test-integration clean logs shell

# Переменные
COMPOSE_FILE = docker-compose.test.yaml
PROJECT_NAME = diplom-functional-tests

# Цвета для вывода
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Показать справку
	@echo "$(GREEN)Функциональные тесты - Diplom Project$(NC)"
	@echo ""
	@echo "$(YELLOW)Доступные команды:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Собрать Docker образы для тестов
	@echo "$(YELLOW)🏗️  Сборка Docker образов для тестов...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build

up: ## Запустить тестовое окружение
	@echo "$(YELLOW)🚀 Запуск тестового окружения...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up -d

down: ## Остановить тестовое окружение
	@echo "$(YELLOW)🛑 Остановка тестового окружения...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down

test: ## Запустить все тесты
	@echo "$(YELLOW)🧪 Запуск всех функциональных тестов...$(NC)"
	TEST_TYPE=all docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api: ## Запустить только API тесты
	@echo "$(YELLOW)🔌 Запуск API тестов...$(NC)"
	TEST_TYPE=api docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-browser: ## Запустить только браузерные тесты
	@echo "$(YELLOW)🌐 Запуск браузерных тестов...$(NC)"
	TEST_TYPE=browser docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-integration: ## Запустить только интеграционные тесты
	@echo "$(YELLOW)🔗 Запуск интеграционных тестов...$(NC)"
	TEST_TYPE=integration docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-local: ## Запустить тесты локально (требует установленных зависимостей)
	@echo "$(YELLOW)💻 Запуск тестов локально...$(NC)"
	pytest -v --html=reports/local_tests_report.html --self-contained-html

test-api-local: ## Запустить API тесты локально
	@echo "$(YELLOW)🔌 Запуск API тестов локально...$(NC)"
	pytest api_tests/ -v --html=reports/api_tests_local_report.html --self-contained-html

test-browser-local: ## Запустить браузерные тесты локально
	@echo "$(YELLOW)🌐 Запуск браузерных тестов локально...$(NC)"
	pytest browser_tests/ -v --html=reports/browser_tests_local_report.html --self-contained-html

test-integration-local: ## Запустить интеграционные тесты локально
	@echo "$(YELLOW)🔗 Запуск интеграционных тестов локально...$(NC)"
	pytest integration_tests/ -v --html=reports/integration_tests_local_report.html --self-contained-html

clean: ## Очистить Docker ресурсы и отчеты
	@echo "$(YELLOW)🧹 Очистка Docker ресурсов...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --remove-orphans
	docker system prune -f
	@echo "$(YELLOW)🗑️  Очистка отчетов и скриншотов...$(NC)"
	rm -rf reports/* screenshots/*
	@echo "$(GREEN)✅ Очистка завершена$(NC)"

logs: ## Показать логи тестов
	@echo "$(YELLOW)📋 Логи функциональных тестов:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs functional-tests

logs-backend: ## Показать логи тестового backend
	@echo "$(YELLOW)📋 Логи тестового backend:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs test-backend

logs-selenium: ## Показать логи Selenium Hub
	@echo "$(YELLOW)📋 Логи Selenium Hub:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs selenium-hub

logs-all: ## Показать все логи
	@echo "$(YELLOW)📋 Все логи тестового окружения:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs

shell: ## Подключиться к контейнеру тестов
	@echo "$(YELLOW)🐚 Подключение к контейнеру тестов...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec functional-tests bash

shell-backend: ## Подключиться к тестовому backend
	@echo "$(YELLOW)🐚 Подключение к тестовому backend...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec test-backend bash

db-shell: ## Подключиться к тестовой базе данных
	@echo "$(YELLOW)🗄️  Подключение к тестовой БД...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec test-postgres psql -U test_user -d test_diplom

status: ## Показать статус сервисов
	@echo "$(YELLOW)📊 Статус тестовых сервисов:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) ps

health: ## Проверить здоровье сервисов
	@echo "$(YELLOW)🏥 Проверка здоровья сервисов...$(NC)"
	@python utils/wait_for_services.py || echo "$(RED)❌ Некоторые сервисы недоступны$(NC)"

install: ## Установить зависимости для локального запуска
	@echo "$(YELLOW)📦 Установка зависимостей...$(NC)"
	pip install -r requirements.txt
	@echo "$(GREEN)✅ Зависимости установлены$(NC)"

reports: ## Открыть отчеты в браузере
	@echo "$(YELLOW)📊 Открытие отчетов...$(NC)"
	@if [ -f "reports/all_tests_report.html" ]; then \
		echo "$(GREEN)Открытие общего отчета...$(NC)"; \
		python -c "import webbrowser; webbrowser.open('reports/all_tests_report.html')"; \
	elif [ -f "reports/api_tests_report.html" ]; then \
		echo "$(GREEN)Открытие отчета API тестов...$(NC)"; \
		python -c "import webbrowser; webbrowser.open('reports/api_tests_report.html')"; \
	else \
		echo "$(RED)❌ Отчеты не найдены. Запустите тесты сначала.$(NC)"; \
	fi

coverage: ## Открыть отчет о покрытии
	@echo "$(YELLOW)📈 Открытие отчета о покрытии...$(NC)"
	@if [ -f "reports/coverage/index.html" ]; then \
		python -c "import webbrowser; webbrowser.open('reports/coverage/index.html')"; \
	else \
		echo "$(RED)❌ Отчет о покрытии не найден. Запустите тесты с покрытием.$(NC)"; \
	fi

watch: ## Мониторинг логов в реальном времени
	@echo "$(YELLOW)👀 Мониторинг логов тестов...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs -f functional-tests

# Специальные команды для CI/CD
ci-test: ## Запуск тестов в CI окружении
	@echo "$(YELLOW)🤖 Запуск тестов в CI...$(NC)"
	TEST_TYPE=all docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit --exit-code-from functional-tests

ci-cleanup: ## Очистка после CI тестов
	@echo "$(YELLOW)🧹 Очистка CI окружения...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --remove-orphans || true
	docker system prune -f || true

# Команды для разработки
dev-setup: ## Настройка окружения для разработки
	@echo "$(YELLOW)⚙️  Настройка окружения для разработки...$(NC)"
	@$(MAKE) install
	mkdir -p reports screenshots
	@echo "$(GREEN)✅ Окружение готово для разработки$(NC)"

dev-test: ## Быстрый тест для разработки (только API)
	@echo "$(YELLOW)⚡ Быстрый тест для разработки...$(NC)"
	pytest api_tests/test_health_api.py -v

# Команды для отладки
debug-selenium: ## Запуск Selenium в режиме отладки
	@echo "$(YELLOW)🐛 Запуск Selenium в режиме отладки...$(NC)"
	docker run --rm -p 4444:4444 -p 7900:7900 --shm-size=2g selenium/standalone-chrome:4.15.0

debug-backend: ## Запуск только тестового backend
	@echo "$(YELLOW)🐛 Запуск только тестового backend...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up test-backend test-postgres test-redis

# Информационные команды
info: ## Показать информацию о тестах
	@echo "$(GREEN)📋 Информация о функциональных тестах$(NC)"
	@echo ""
	@echo "$(YELLOW)Структура тестов:$(NC)"
	@find . -name "test_*.py" -type f | head -10
	@echo ""
	@echo "$(YELLOW)Последние отчеты:$(NC)"
	@ls -la reports/ 2>/dev/null | head -5 || echo "Отчеты не найдены"
	@echo ""
	@echo "$(YELLOW)Размер Docker образов:$(NC)"
	@docker images | grep -E "(functional-tests|selenium|postgres)" | head -5

version: ## Показать версии компонентов
	@echo "$(GREEN)🔖 Версии компонентов$(NC)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker-compose --version)"
	@echo "Python: $$(python --version 2>&1)"
	@echo "Pytest: $$(pytest --version 2>&1 | head -1)"
