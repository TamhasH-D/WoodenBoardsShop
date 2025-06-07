# Makefile для функциональных тестов

.PHONY: help build rebuild up down test test-rebuild test-api test-api-rebuild test-browser test-integration test-uuid test-uuid-rebuild test-uuid-validation test-uuid-integration selenium-diagnostics selenium-status selenium-fix selenium-fix-docker selenium-fix-local selenium-restart clean logs shell

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

rebuild: ## Пересобрать Docker образы с очисткой кэша
	@echo "$(YELLOW)🔄 Пересборка Docker образов с очисткой кэша...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) build --no-cache

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

test-rebuild: ## Запустить все тесты с полной пересборкой
	@echo "$(YELLOW)🔄 Запуск всех тестов с полной пересборкой...$(NC)"
	@$(MAKE) rebuild
	TEST_TYPE=all docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --abort-on-container-exit
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

test-api-buyer: ## Запустить API тесты для buyer
	@echo "$(YELLOW)👤 Запуск API тестов для buyer...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/buyer/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-wood-type: ## Запустить API тесты для wood_type
	@echo "$(YELLOW)🌳 Запуск API тестов для wood_type...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/wood_type/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-crud: ## Запустить только CRUD API тесты
	@echo "$(YELLOW)📝 Запуск CRUD API тестов...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v -m crud api_tests/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-validation: ## Запустить только валидационные API тесты
	@echo "$(YELLOW)✅ Запуск валидационных API тестов...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v -m validation api_tests/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-seller: ## Запустить API тесты для seller
	@echo "$(YELLOW)🏪 Запуск API тестов для seller...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/seller/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-product: ## Запустить API тесты для product
	@echo "$(YELLOW)📦 Запуск API тестов для product...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/product/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-wooden-board: ## Запустить API тесты для wooden_board
	@echo "$(YELLOW)🪵 Запуск API тестов для wooden_board...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/wooden_board/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-image: ## Запустить API тесты для image
	@echo "$(YELLOW)🖼️  Запуск API тестов для image...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/image/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-chat: ## Запустить API тесты для chat
	@echo "$(YELLOW)💬 Запуск API тестов для chat...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/chat/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-get-by-id: ## Запустить тесты GET by ID
	@echo "$(YELLOW)🔍 Запуск тестов GET by ID...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/test_get_by_id.py" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-patch: ## Запустить тесты PATCH операций
	@echo "$(YELLOW)✏️  Запуск тестов PATCH операций...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/test_patch_operations.py" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-delete: ## Запустить тесты DELETE операций
	@echo "$(YELLOW)🗑️  Запуск тестов DELETE операций...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/test_delete_operations.py" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-wood-type-price: ## Запустить тесты wood-type-price API
	@echo "$(YELLOW)💰 Запуск тестов wood-type-price API...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/wood_type_price/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-calculate-volume: ## Запустить тесты расчета объема
	@echo "$(YELLOW)📐 Запуск тестов расчета объема...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/wooden_board/test_calculate_volume.py" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-comprehensive: ## Запустить комплексные API тесты
	@echo "$(YELLOW)🎯 Запуск комплексных API тестов...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/test_comprehensive_suite.py" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-smoke: ## Запустить smoke тесты API
	@echo "$(YELLOW)💨 Запуск smoke тестов API...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v -m smoke api_tests/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-stress: ## Запустить стресс тесты API
	@echo "$(YELLOW)⚡ Запуск стресс тестов API...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v -m stress api_tests/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-integration: ## Запустить интеграционные API тесты
	@echo "$(YELLOW)🔗 Запуск интеграционных API тестов...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v -m integration api_tests/" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-api-workflow: ## Запустить тесты полного workflow
	@echo "$(YELLOW)🔄 Запуск тестов полного workflow...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v api_tests/test_integration_workflow.py" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-browser-local: ## Запустить браузерные тесты локально
	@echo "$(YELLOW)🌐 Запуск браузерных тестов локально...$(NC)"
	pytest browser_tests/ -v --html=reports/browser_tests_local_report.html --self-contained-html

test-integration-local: ## Запустить интеграционные тесты локально
	@echo "$(YELLOW)🔗 Запуск интеграционных тестов локально...$(NC)"
	pytest integration_tests/ -v --html=reports/integration_tests_local_report.html --self-contained-html

test-uuid: ## Запустить только UUID тесты
	@echo "$(YELLOW)🆔 Запуск UUID тестов...$(NC)"
	TEST_TYPE=api PYTEST_ARGS="-v -k uuid" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --build --abort-on-container-exit
	@$(MAKE) down

test-uuid-local: ## Запустить UUID тесты локально
	@echo "$(YELLOW)🆔 Запуск UUID тестов локально...$(NC)"
	pytest -v -k uuid --html=reports/uuid_tests_local_report.html --self-contained-html

test-uuid-validation: ## Запустить тесты валидации UUID
	@echo "$(YELLOW)✅ Запуск тестов валидации UUID...$(NC)"
	pytest api_tests/test_uuid_validation.py -v --html=reports/uuid_validation_report.html --self-contained-html

test-uuid-integration: ## Запустить интеграционные UUID тесты
	@echo "$(YELLOW)🔗 Запуск интеграционных UUID тестов...$(NC)"
	pytest integration_tests/test_uuid_integration.py -v --html=reports/uuid_integration_report.html --self-contained-html

test-uuid-rebuild: ## Запустить UUID тесты с полной пересборкой
	@echo "$(YELLOW)🔄 Запуск UUID тестов с полной пересборкой...$(NC)"
	@$(MAKE) rebuild
	TEST_TYPE=api PYTEST_ARGS="-v -k uuid" docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --abort-on-container-exit
	@$(MAKE) down

test-api-rebuild: ## Запустить API тесты с полной пересборкой
	@echo "$(YELLOW)🔄 Запуск API тестов с полной пересборкой...$(NC)"
	@$(MAKE) rebuild
	TEST_TYPE=api docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) up --abort-on-container-exit
	@$(MAKE) down

clean: ## Очистить Docker ресурсы и отчеты
	@echo "$(YELLOW)🧹 Очистка Docker ресурсов...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) down -v --remove-orphans
	docker system prune -f
	@echo "$(YELLOW)🗑️  Очистка отчетов, скриншотов и логов...$(NC)"
	rm -rf reports/* screenshots/* logs/*
	@echo "$(GREEN)✅ Очистка завершена$(NC)"

clean-logs: ## Очистить только логи тестов
	@echo "$(YELLOW)🗑️  Очистка логов тестов...$(NC)"
	rm -rf logs/*
	@echo "$(GREEN)✅ Логи очищены$(NC)"

clean-old-logs: ## Очистить логи старше 30 дней
	@echo "$(YELLOW)🗑️  Очистка старых логов (>30 дней)...$(NC)"
	find logs/ -name "test_results_*.log" -mtime +30 -delete 2>/dev/null || true
	find logs/ -name "test_results_*.json" -mtime +30 -delete 2>/dev/null || true
	@echo "$(GREEN)✅ Старые логи очищены$(NC)"

logs: ## Показать логи тестов
	@echo "$(YELLOW)📋 Логи функциональных тестов:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs functional-tests

logs-test: ## Показать последний лог тестов
	@echo "$(YELLOW)📋 Последний лог тестов:$(NC)"
	@if [ -d "logs" ] && [ "$$(ls -A logs/)" ]; then \
		LATEST_LOG=$$(ls -t logs/test_results_*.log 2>/dev/null | head -1); \
		if [ -n "$$LATEST_LOG" ]; then \
			echo "$(GREEN)Файл: $$LATEST_LOG$(NC)"; \
			cat "$$LATEST_LOG"; \
		else \
			echo "$(RED)❌ Лог файлы не найдены$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ Директория logs пуста или не существует$(NC)"; \
	fi

logs-tail: ## Следить за последним логом в реальном времени
	@echo "$(YELLOW)👀 Мониторинг последнего лога...$(NC)"
	@if [ -d "logs" ] && [ "$$(ls -A logs/)" ]; then \
		LATEST_LOG=$$(ls -t logs/test_results_*.log 2>/dev/null | head -1); \
		if [ -n "$$LATEST_LOG" ]; then \
			echo "$(GREEN)Мониторинг: $$LATEST_LOG$(NC)"; \
			tail -f "$$LATEST_LOG"; \
		else \
			echo "$(RED)❌ Лог файлы не найдены$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ Директория logs пуста или не существует$(NC)"; \
	fi

logs-list: ## Показать список всех логов
	@echo "$(YELLOW)📋 Список всех логов:$(NC)"
	@if [ -d "logs" ] && [ "$$(ls -A logs/)" ]; then \
		ls -la logs/; \
		echo ""; \
		echo "$(YELLOW)Статистика:$(NC)"; \
		echo "Всего логов: $$(ls logs/test_results_*.log 2>/dev/null | wc -l)"; \
		echo "JSON отчетов: $$(ls logs/test_results_*.json 2>/dev/null | wc -l)"; \
	else \
		echo "$(RED)❌ Логи не найдены$(NC)"; \
	fi

logs-stats: ## Показать статистику из последнего лога
	@echo "$(YELLOW)📊 Статистика последнего тестирования:$(NC)"
	@if [ -d "logs" ] && [ "$$(ls -A logs/)" ]; then \
		LATEST_JSON=$$(ls -t logs/test_results_*.json 2>/dev/null | head -1); \
		if [ -n "$$LATEST_JSON" ]; then \
			echo "$(GREEN)JSON отчет: $$LATEST_JSON$(NC)"; \
			python3 -c "import json; data=json.load(open('$$LATEST_JSON')); stats=data['statistics']; print(f'Всего: {stats[\"total\"]}, Пройдено: {stats[\"passed\"]}, Упало: {stats[\"failed\"]}, Пропущено: {stats[\"skipped\"]}')"; \
		else \
			LATEST_LOG=$$(ls -t logs/test_results_*.log 2>/dev/null | head -1); \
			if [ -n "$$LATEST_LOG" ]; then \
				echo "$(GREEN)Извлечение из лога: $$LATEST_LOG$(NC)"; \
				grep "ИТОГОВАЯ СТАТИСТИКА" -A 10 "$$LATEST_LOG" | tail -8; \
			else \
				echo "$(RED)❌ Лог файлы не найдены$(NC)"; \
			fi; \
		fi; \
	else \
		echo "$(RED)❌ Директория logs пуста или не существует$(NC)"; \
	fi

logs-backend: ## Показать логи тестового backend
	@echo "$(YELLOW)📋 Логи тестового backend:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs test-backend

logs-selenium: ## Показать логи Selenium Hub
	@echo "$(YELLOW)📋 Логи Selenium Hub:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs selenium-hub

logs-selenium-chrome: ## Показать логи Chrome Node
	@echo "$(YELLOW)📋 Логи Chrome Node:$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) logs selenium-chrome

selenium-diagnostics: ## Запустить диагностику Selenium Grid
	@echo "$(YELLOW)🔍 Диагностика Selenium Grid...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) exec functional-tests python utils/selenium_diagnostics.py

selenium-status: ## Проверить статус Selenium сервисов
	@echo "$(YELLOW)📊 Статус Selenium сервисов:$(NC)"
	@echo "Hub контейнер:"
	@docker ps --filter "name=selenium-hub" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo "Chrome Node контейнер:"
	@docker ps --filter "name=selenium-chrome" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

selenium-fix: ## Автоматическое исправление проблем Selenium
	@echo "$(YELLOW)🔧 Автоматическое исправление Selenium проблем...$(NC)"
	python utils/selenium_fix.py

selenium-fix-docker: ## Автоматическое исправление Selenium внутри Docker
	@echo "$(YELLOW)🔧 Автоматическое исправление Selenium через Docker...$(NC)"
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		-v $(PWD):/workspace -w /workspace \
		--network host \
		python:3.12-slim bash -c "\
		apt-get update && apt-get install -y docker.io curl && \
		pip install requests && \
		python utils/selenium_fix.py"

selenium-restart: ## Перезапуск Selenium сервисов
	@echo "$(YELLOW)🔄 Перезапуск Selenium сервисов...$(NC)"
	docker-compose -f $(COMPOSE_FILE) -p $(PROJECT_NAME) restart selenium-hub selenium-chrome

selenium-fix-local: ## Локальное исправление Selenium (рекомендуется)
	@echo "$(YELLOW)🔧 Локальное исправление Selenium проблем...$(NC)"
	./selenium_fix_local.sh

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

dev-test-uuid: ## Быстрый тест UUID для разработки
	@echo "$(YELLOW)⚡ Быстрый тест UUID для разработки...$(NC)"
	pytest api_tests/test_buyer_api.py::TestBuyerAPI::test_create_buyer_success -v

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
