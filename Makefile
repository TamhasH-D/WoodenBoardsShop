# Diplom Project Makefile
# Simple commands for development with .env support

# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Set default values if not defined in .env
BACKEND_PORT ?= 8000
FRONTEND_ADMIN_PORT ?= 8080
FRONTEND_SELLER_PORT ?= 8081
FRONTEND_BUYER_PORT ?= 8082
BACKEND_HOST ?= localhost

# Docker compose commands with environment variables
COMPOSE := docker compose --env-file .env
BACKEND_DIR := backend/backend

.PHONY: help
help: ## Show available commands
	@printf "\033[0;32m🚀 Diplom Project - Available Commands\033[0m\n"
	@printf "\033[1;33m======================================\033[0m\n"
	@printf "\n"
	@printf "\033[0;34m📦 Main Commands:\033[0m\n"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -v "^help:" | grep -v "^help-test:" | grep -v "^test-" | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@printf "\n"
	@printf "\033[0;34m🧪 Testing Commands:\033[0m\n"
	@grep -E '^test[a-zA-Z_-]*:.*?## .*$$' $(MAKEFILE_LIST) | head -12 | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@printf "  \033[0;32mhelp-test\033[0m                Показать полную справку по тестированию\n"
	@printf "\n"
	@printf "\033[0;34m🌐 Service URLs (accessible from host system):\033[0m\n"
	@printf "  Backend API:      http://localhost:$(BACKEND_PORT)\n"
	@printf "  API Docs:         http://localhost:$(BACKEND_PORT)/docs\n"
	@printf "  Admin Frontend:   http://localhost:$(FRONTEND_ADMIN_PORT)\n"
	@printf "  Seller Frontend:  http://localhost:$(FRONTEND_SELLER_PORT)\n"
	@printf "  Buyer Frontend:   http://localhost:$(FRONTEND_BUYER_PORT)\n"
	@printf "  YOLO Backend:     http://localhost:$(PROSTO_BOARD_PORT)\n"
	@printf "  YOLO Detect:      http://localhost:$(DETECT_PORT)\n"

# ============================================================================
# 🚀 MAIN COMMANDS
# ============================================================================

.PHONY: up
up: ## Start all services
	$(COMPOSE) up -d

.PHONY: down
down: ## Stop all services
	$(COMPOSE) down

.PHONY: build
build: ## Build all services
	$(COMPOSE) build --no-cache

.PHONY: rebuild
rebuild: down  build up ## Rebuild and restart all services

.PHONY: logs
logs: ## Show logs from all services
	$(COMPOSE) logs -f

.PHONY: ps
ps: ## List running containers
	$(COMPOSE) ps

# ============================================================================
# 🔧 BACKEND COMMANDS
# ============================================================================

.PHONY: backend-up
backend-up: ## Start only backend services
	cd $(BACKEND_DIR) && docker compose --env-file ../../.env up -d

.PHONY: backend-down
backend-down: ## Stop backend services
	cd $(BACKEND_DIR) && docker compose down

.PHONY: backend-logs
backend-logs: ## Show backend logs
	cd $(BACKEND_DIR) && docker compose logs -f

.PHONY: backend-migrate
backend-migrate: ## Run database migrations
	cd $(BACKEND_DIR) && docker compose exec api alembic upgrade head

# ============================================================================
# 💾 DATABASE COMMANDS
# ============================================================================

.PHONY: db-dump
db-dump: ## Create database dump (all types)
	@echo "💾 Создание дампов базы данных..."
	@./database_dumps/create_dump.sh --all

.PHONY: db-dump-full
db-dump-full: ## Create full database dump
	@echo "💾 Создание полного дампа базы данных..."
	@./database_dumps/create_dump.sh --full

.PHONY: db-dump-schema
db-dump-schema: ## Create database schema dump
	@echo "💾 Создание дампа структуры базы данных..."
	@./database_dumps/create_dump.sh --schema

.PHONY: db-dump-data
db-dump-data: ## Create database data dump
	@echo "💾 Создание дампа данных..."
	@./database_dumps/create_dump.sh --data

.PHONY: db-dump-compressed
db-dump-compressed: ## Create compressed database dump
	@echo "💾 Создание сжатого дампа базы данных..."
	@./database_dumps/create_dump.sh --compress

.PHONY: db-info
db-info: ## Get database information
	@echo "ℹ️ Получение информации о базе данных..."
	@./database_dumps/create_dump.sh --info

.PHONY: db-restore
db-restore: ## Restore database from dump (interactive)
	@echo "🔄 Восстановление базы данных из дампа..."
	@echo "Доступные дампы:"
	@ls -lt database_dumps/diplom_database_full_*.sql 2>/dev/null | head -5 || echo "Дампы не найдены"
	@echo ""
	@read -p "Введите имя файла дампа: " dump_file; \
	if [ -f "database_dumps/$$dump_file" ]; then \
		echo "Восстановление из $$dump_file..."; \
		docker exec -i backend-pg psql -U backend -d postgres < "database_dumps/$$dump_file"; \
		echo "✅ Восстановление завершено"; \
	else \
		echo "❌ Файл не найден: database_dumps/$$dump_file"; \
	fi

# ============================================================================
# 🧪 FUNCTIONAL TESTS
# ============================================================================

# Colors disabled for compatibility

# Test configuration
FUNCTIONAL_TESTS_DIR := functional_tests
TEST_COMPOSE_FILE := $(FUNCTIONAL_TESTS_DIR)/docker-compose.test.yaml
TEST_PROJECT_NAME := diplom-functional-tests

# Check dependencies
.PHONY: check-test-deps
check-test-deps:
	@echo "🔍 Проверка зависимостей для тестирования..."
	@command -v docker >/dev/null 2>&1 || { echo "❌ Docker не установлен"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose не установлен"; exit 1; }
	@[ -f "$(TEST_COMPOSE_FILE)" ] || { echo "❌ Файл $(TEST_COMPOSE_FILE) не найден"; exit 1; }
	@echo "✅ Все зависимости установлены"

.PHONY: help-test
help-test: ## Показать справку по командам тестирования
	@echo "$(GREEN)🧪 Функциональные тесты - Справка$(NC)"
	@echo "$(YELLOW)========================================$(NC)"
	@echo ""
	@echo "$(BLUE)📋 Основные команды тестирования:$(NC)"
	@echo "  $(GREEN)make test$(NC)              - Запуск всех функциональных тестов"
	@echo "  $(GREEN)make test-api$(NC)          - Запуск только API тестов"
	@echo "  $(GREEN)make test-browser$(NC)      - Запуск только браузерных тестов"
	@echo "  $(GREEN)make test-integration$(NC)  - Запуск только интеграционных тестов"
	@echo ""
	@echo "$(BLUE)🔄 Команды с пересборкой (после изменений в коде):$(NC)"
	@echo "  $(GREEN)make test-rebuild$(NC)      - Запуск всех тестов с пересборкой"
	@echo "  $(GREEN)make test-api-rebuild$(NC)  - Запуск API тестов с пересборкой"
	@echo "  $(GREEN)make test-browser-rebuild$(NC) - Запуск браузерных тестов с пересборкой"
	@echo "  $(GREEN)make test-integration-rebuild$(NC) - Запуск интеграционных тестов с пересборкой"
	@echo ""
	@echo "$(BLUE)⚡ Команды с дополнительными опциями:$(NC)"
	@echo "  $(GREEN)make test-quick$(NC)        - Быстрый запуск критических тестов"
	@echo "  $(GREEN)make test-local$(NC)        - Запуск тестов локально (без Docker)"
	@echo "  $(GREEN)make test-debug$(NC)        - Запуск в режиме отладки"
	@echo "  $(GREEN)make test-coverage$(NC)     - Запуск с отчетом о покрытии"
	@echo ""
	@echo "$(BLUE)🔧 Управление окружением:$(NC)"
	@echo "  $(GREEN)make test-build$(NC)        - Сборка Docker образов для тестов"
	@echo "  $(GREEN)make test-up$(NC)           - Запуск тестового окружения"
	@echo "  $(GREEN)make test-down$(NC)         - Остановка тестового окружения"
	@echo "  $(GREEN)make test-clean$(NC)        - Очистка тестовых данных"
	@echo ""
	@echo "$(BLUE)📊 Работа с результатами:$(NC)"
	@echo "  $(GREEN)make test-logs$(NC)         - Просмотр логов тестов"
	@echo "  $(GREEN)make test-reports$(NC)      - Открытие HTML отчетов"
	@echo "  $(GREEN)make test-status$(NC)       - Статус тестовых сервисов"
	@echo ""
	@echo "$(BLUE)🔍 Анализ логов:$(NC)"
	@echo "  $(GREEN)make test-logs-latest$(NC)  - Последний лог тестов"
	@echo "  $(GREEN)make test-logs-tail$(NC)    - Мониторинг логов в реальном времени"
	@echo "  $(GREEN)make test-logs-stats$(NC)   - Статистика последнего запуска"

# ============================================================================
# 🧪 ОСНОВНЫЕ КОМАНДЫ ТЕСТИРОВАНИЯ
# ============================================================================

.PHONY: test
test: check-test-deps ## Запуск API тестов (основная команда)
	@echo "🚀 Запуск API тестов..."
	@cd $(FUNCTIONAL_TESTS_DIR) && $(MAKE) test-api

.PHONY: test-api
test-api: check-test-deps ## Запуск только API тестов
	@echo "$(YELLOW)🔌 Запуск API тестов...$(NC)"
	@TEST_TYPE=api $(MAKE) _run-tests
	@$(MAKE) _show-test-results

.PHONY: test-browser
test-browser: check-test-deps ## Запуск только браузерных тестов
	@echo "$(YELLOW)🌐 Запуск браузерных тестов...$(NC)"
	@TEST_TYPE=browser $(MAKE) _run-tests
	@$(MAKE) _show-test-results

.PHONY: test-integration
test-integration: check-test-deps ## Запуск только интеграционных тестов
	@echo "$(YELLOW)🔗 Запуск интеграционных тестов...$(NC)"
	@TEST_TYPE=integration $(MAKE) _run-tests
	@$(MAKE) _show-test-results

.PHONY: test-rebuild
test-rebuild: check-test-deps ## Запуск всех тестов с полной пересборкой образов
	@echo "$(YELLOW)🔄 Запуск всех тестов с полной пересборкой...$(NC)"
	@$(MAKE) test-build
	@TEST_TYPE=all $(MAKE) _run-tests-no-build
	@$(MAKE) _show-test-results

.PHONY: test-api-rebuild
test-api-rebuild: check-test-deps ## Запуск API тестов с полной пересборкой образов
	@echo "$(YELLOW)🔄 Запуск API тестов с полной пересборкой...$(NC)"
	@$(MAKE) test-build
	@TEST_TYPE=api $(MAKE) _run-tests-no-build
	@$(MAKE) _show-test-results

.PHONY: test-browser-rebuild
test-browser-rebuild: check-test-deps ## Запуск браузерных тестов с полной пересборкой образов
	@echo "$(YELLOW)🔄 Запуск браузерных тестов с полной пересборкой...$(NC)"
	@$(MAKE) test-build
	@TEST_TYPE=browser $(MAKE) _run-tests-no-build
	@$(MAKE) _show-test-results

.PHONY: test-integration-rebuild
test-integration-rebuild: check-test-deps ## Запуск интеграционных тестов с полной пересборкой образов
	@echo "$(YELLOW)🔄 Запуск интеграционных тестов с полной пересборкой...$(NC)"
	@$(MAKE) test-build
	@TEST_TYPE=integration $(MAKE) _run-tests-no-build
	@$(MAKE) _show-test-results

# ============================================================================
# ⚡ КОМАНДЫ С ДОПОЛНИТЕЛЬНЫМИ ОПЦИЯМИ
# ============================================================================

.PHONY: test-quick
test-quick: check-test-deps ## Быстрый запуск критических тестов
	@echo "$(YELLOW)⚡ Быстрый запуск критических тестов...$(NC)"
	@TEST_TYPE=api PYTEST_ARGS="-m critical" $(MAKE) _run-tests
	@$(MAKE) _show-test-results

.PHONY: test-local
test-local: check-test-deps ## Запуск тестов локально (без Docker)
	@echo "$(YELLOW)🏠 Запуск тестов локально...$(NC)"
	@if [ ! -d "$(FUNCTIONAL_TESTS_DIR)/venv" ]; then \
		echo "$(BLUE)📦 Создание виртуального окружения...$(NC)"; \
		cd $(FUNCTIONAL_TESTS_DIR) && python3 -m venv venv; \
		cd $(FUNCTIONAL_TESTS_DIR) && source venv/bin/activate && pip install -r requirements.txt; \
	fi
	@echo "$(BLUE)🧪 Запуск тестов в локальном окружении...$(NC)"
	@cd $(FUNCTIONAL_TESTS_DIR) && source venv/bin/activate && \
		BACKEND_URL=http://localhost:$(BACKEND_PORT) \
		FRONTEND_ADMIN_URL=http://localhost:$(FRONTEND_ADMIN_PORT) \
		FRONTEND_SELLER_URL=http://localhost:$(FRONTEND_SELLER_PORT) \
		FRONTEND_BUYER_URL=http://localhost:$(FRONTEND_BUYER_PORT) \
		TEST_TYPE=${TEST_TYPE:-all} \
		pytest -v --html=reports/local_tests_report.html --self-contained-html
	@$(MAKE) _show-test-results

.PHONY: test-with-script
test-with-script: check-test-deps ## Запуск тестов через расширенный скрипт
	@echo "$(YELLOW)🔧 Запуск тестов через расширенный скрипт...$(NC)"
	@./scripts/test-runner.sh ${TEST_TYPE:-all} "${PYTEST_ARGS}"

.PHONY: test-health
test-health: ## Проверка готовности системы к тестированию
	@./scripts/test-health-check.sh

.PHONY: test-debug
test-debug: check-test-deps ## Запуск тестов в режиме отладки
	@echo "$(YELLOW)🐛 Запуск тестов в режиме отладки...$(NC)"
	@TEST_TYPE=${TEST_TYPE:-all} PYTEST_ARGS="-v -s --tb=long --capture=no" $(MAKE) _run-tests
	@$(MAKE) _show-test-results

.PHONY: test-coverage
test-coverage: check-test-deps ## Запуск тестов с отчетом о покрытии
	@echo "$(YELLOW)📊 Запуск тестов с отчетом о покрытии...$(NC)"
	@TEST_TYPE=${TEST_TYPE:-all} PYTEST_ARGS="--cov=. --cov-report=html:reports/coverage --cov-report=xml:reports/coverage.xml --cov-report=term" $(MAKE) _run-tests
	@$(MAKE) _show-test-results
	@echo "$(GREEN)📈 Отчет о покрытии: $(FUNCTIONAL_TESTS_DIR)/reports/coverage/index.html$(NC)"

# ============================================================================
# 🔧 УПРАВЛЕНИЕ ОКРУЖЕНИЕМ
# ============================================================================

.PHONY: test-build
test-build: check-test-deps ## Сборка Docker образов для тестов
	@echo "$(YELLOW)🔨 Сборка Docker образов для тестов...$(NC)"
	@cd $(FUNCTIONAL_TESTS_DIR) && docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) build --no-cache
	@echo "$(GREEN)✅ Сборка завершена$(NC)"

.PHONY: test-up
test-up: check-test-deps ## Запуск тестового окружения без выполнения тестов
	@echo "🚀 Запуск тестового окружения..."
	@cd $(FUNCTIONAL_TESTS_DIR) && docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) up -d --remove-orphans
	@echo "⏳ Ожидание готовности сервисов..."
	@sleep 10
	@$(MAKE) test-status
	@echo "✅ Тестовое окружение готово"

.PHONY: test-down
test-down: ## Остановка тестового окружения
	@echo "🛑 Остановка тестового окружения..."
	@cd $(FUNCTIONAL_TESTS_DIR) && docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) down --remove-orphans
	@echo "✅ Тестовое окружение остановлено"

.PHONY: test-clean
test-clean: test-down ## Очистка тестовых данных и контейнеров
	@echo "$(YELLOW)🧹 Очистка тестовых данных...$(NC)"
	@cd $(FUNCTIONAL_TESTS_DIR) && docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) down -v --remove-orphans
	@docker system prune -f --filter "label=com.docker.compose.project=$(TEST_PROJECT_NAME)"
	@echo "$(BLUE)🗑️ Очистка отчетов и логов...$(NC)"
	@rm -rf $(FUNCTIONAL_TESTS_DIR)/reports/* $(FUNCTIONAL_TESTS_DIR)/screenshots/* 2>/dev/null || true
	@echo "$(GREEN)✅ Очистка завершена$(NC)"

# ============================================================================
# 📊 РАБОТА С РЕЗУЛЬТАТАМИ
# ============================================================================

.PHONY: test-logs
test-logs: ## Просмотр логов последнего запуска тестов
	@echo "$(YELLOW)📋 Логи последнего запуска тестов:$(NC)"
	@cd $(FUNCTIONAL_TESTS_DIR) && docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) logs functional-tests

.PHONY: test-logs-latest
test-logs-latest: ## Показать последний лог тестов
	@echo "$(YELLOW)📋 Последний лог тестов:$(NC)"
	@if [ -d "$(FUNCTIONAL_TESTS_DIR)/logs" ] && [ "$$(ls -A $(FUNCTIONAL_TESTS_DIR)/logs/)" ]; then \
		LATEST_LOG=$$(ls -t $(FUNCTIONAL_TESTS_DIR)/logs/test_results_*.log 2>/dev/null | head -1); \
		if [ -n "$$LATEST_LOG" ]; then \
			echo "$(GREEN)Файл: $$LATEST_LOG$(NC)"; \
			cat "$$LATEST_LOG"; \
		else \
			echo "$(RED)❌ Лог файлы не найдены$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ Директория logs пуста или не существует$(NC)"; \
	fi

.PHONY: test-logs-tail
test-logs-tail: ## Мониторинг логов в реальном времени
	@echo "$(YELLOW)👀 Мониторинг последнего лога...$(NC)"
	@if [ -d "$(FUNCTIONAL_TESTS_DIR)/logs" ] && [ "$$(ls -A $(FUNCTIONAL_TESTS_DIR)/logs/)" ]; then \
		LATEST_LOG=$$(ls -t $(FUNCTIONAL_TESTS_DIR)/logs/test_results_*.log 2>/dev/null | head -1); \
		if [ -n "$$LATEST_LOG" ]; then \
			echo "$(GREEN)Мониторинг: $$LATEST_LOG$(NC)"; \
			tail -f "$$LATEST_LOG"; \
		else \
			echo "$(RED)❌ Лог файлы не найдены$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ Директория logs пуста или не существует$(NC)"; \
	fi

.PHONY: test-logs-stats
test-logs-stats: ## Статистика последнего запуска
	@echo "$(YELLOW)📊 Статистика последнего тестирования:$(NC)"
	@if [ -d "$(FUNCTIONAL_TESTS_DIR)/logs" ] && [ "$$(ls -A $(FUNCTIONAL_TESTS_DIR)/logs/)" ]; then \
		LATEST_JSON=$$(ls -t $(FUNCTIONAL_TESTS_DIR)/logs/test_results_*.json 2>/dev/null | head -1); \
		if [ -n "$$LATEST_JSON" ]; then \
			echo "$(GREEN)JSON отчет: $$LATEST_JSON$(NC)"; \
			cd $(FUNCTIONAL_TESTS_DIR) && python3 -c "import json; data=json.load(open('$$LATEST_JSON')); stats=data['statistics']; print(f'Всего: {stats[\"total\"]}, Пройдено: {stats[\"passed\"]}, Упало: {stats[\"failed\"]}, Пропущено: {stats[\"skipped\"]}')"; \
		else \
			LATEST_LOG=$$(ls -t $(FUNCTIONAL_TESTS_DIR)/logs/test_results_*.log 2>/dev/null | head -1); \
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

.PHONY: test-reports
test-reports: ## Открытие HTML отчетов в браузере
	@echo "$(YELLOW)📊 Открытие HTML отчетов...$(NC)"
	@if [ -d "$(FUNCTIONAL_TESTS_DIR)/reports" ]; then \
		REPORTS_FOUND=0; \
		for report in $(FUNCTIONAL_TESTS_DIR)/reports/*_report.html; do \
			if [ -f "$$report" ]; then \
				echo "$(GREEN)📄 Найден отчет: $$report$(NC)"; \
				if command -v xdg-open >/dev/null 2>&1; then \
					xdg-open "$$report" 2>/dev/null & \
				elif command -v open >/dev/null 2>&1; then \
					open "$$report" 2>/dev/null & \
				else \
					echo "$(BLUE)💡 Откройте в браузере: file://$(PWD)/$$report$(NC)"; \
				fi; \
				REPORTS_FOUND=1; \
			fi; \
		done; \
		if [ $$REPORTS_FOUND -eq 0 ]; then \
			echo "$(RED)❌ HTML отчеты не найдены в $(FUNCTIONAL_TESTS_DIR)/reports/$(NC)"; \
		fi; \
	else \
		echo "$(RED)❌ Директория reports не найдена$(NC)"; \
	fi

.PHONY: test-status
test-status: ## Проверка статуса тестовых сервисов
	@echo "🔍 Статус тестовых сервисов:"
	@cd $(FUNCTIONAL_TESTS_DIR) && docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) ps
	@echo ""
	@echo "🌐 Проверка доступности сервисов:"
	@$(MAKE) _check-service-health

# ============================================================================
# 🔧 ВНУТРЕННИЕ ФУНКЦИИ
# ============================================================================

.PHONY: _run-tests
_run-tests:
	@echo "🔧 Подготовка тестового окружения..."
	@$(MAKE) test-down 2>/dev/null || true
	@$(MAKE) test-up
	@echo "🧪 Запуск тестов (TEST_TYPE=$(TEST_TYPE))..."
	@cd $(FUNCTIONAL_TESTS_DIR) && \
		TEST_TYPE=$(TEST_TYPE) \
		PYTEST_ARGS="$(PYTEST_ARGS)" \
		docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) run --rm functional-tests || \
		(echo "❌ Тесты завершились с ошибкой" && $(MAKE) _cleanup-on-error && exit 1)
	@$(MAKE) test-down

.PHONY: _run-tests-no-build
_run-tests-no-build:
	@echo "$(BLUE)🔧 Подготовка тестового окружения (без пересборки)...$(NC)"
	@$(MAKE) test-down 2>/dev/null || true
	@echo "$(BLUE)🚀 Запуск тестового окружения с готовыми образами...$(NC)"
	@cd $(FUNCTIONAL_TESTS_DIR) && docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) up -d --remove-orphans
	@echo "$(BLUE)⏳ Ожидание готовности сервисов...$(NC)"
	@sleep 10
	@echo "$(BLUE)🧪 Запуск тестов (TEST_TYPE=$(TEST_TYPE))...$(NC)"
	@cd $(FUNCTIONAL_TESTS_DIR) && \
		TEST_TYPE=$(TEST_TYPE) \
		PYTEST_ARGS="$(PYTEST_ARGS)" \
		docker-compose -f docker-compose.test.yaml -p $(TEST_PROJECT_NAME) run --rm functional-tests || \
		(echo "$(RED)❌ Тесты завершились с ошибкой$(NC)" && $(MAKE) _cleanup-on-error && exit 1)
	@$(MAKE) test-down

.PHONY: _show-test-results
_show-test-results:
	@echo ""
	@echo "$(GREEN)✅ Тестирование завершено!$(NC)"
	@echo "$(BLUE)📊 Результаты доступны в:$(NC)"
	@echo "  • HTML отчеты: $(FUNCTIONAL_TESTS_DIR)/reports/"
	@echo "  • Логи тестов: $(FUNCTIONAL_TESTS_DIR)/logs/"
	@echo "  • Скриншоты: $(FUNCTIONAL_TESTS_DIR)/screenshots/"
	@echo ""
	@echo "$(BLUE)🔍 Для анализа используйте:$(NC)"
	@echo "  • $(GREEN)make test-logs-stats$(NC) - статистика последнего запуска"
	@echo "  • $(GREEN)make test-reports$(NC) - открыть HTML отчеты"
	@echo "  • $(GREEN)cd $(FUNCTIONAL_TESTS_DIR) && python utils/log_analyzer.py --latest$(NC) - детальный анализ"

.PHONY: _check-service-health
_check-service-health:
	@for service in "Backend API:http://localhost:$(BACKEND_PORT)/health" \
					"Admin Frontend:http://localhost:$(FRONTEND_ADMIN_PORT)" \
					"Seller Frontend:http://localhost:$(FRONTEND_SELLER_PORT)" \
					"Buyer Frontend:http://localhost:$(FRONTEND_BUYER_PORT)"; do \
		name=$$(echo $$service | cut -d: -f1); \
		url=$$(echo $$service | cut -d: -f2-); \
		if curl -s -f "$$url" >/dev/null 2>&1; then \
			echo "  ✅ $$name - доступен"; \
		else \
			echo "  ❌ $$name - недоступен ($$url)"; \
		fi; \
	done

.PHONY: _cleanup-on-error
_cleanup-on-error:
	@echo "$(YELLOW)🧹 Очистка после ошибки...$(NC)"
	@$(MAKE) test-logs 2>/dev/null || true
	@$(MAKE) test-down 2>/dev/null || true

# ============================================================================
# 🧹 CLEANUP & UTILITY
# ============================================================================

.PHONY: clean
clean: ## Clean Docker resources
	docker system prune -f

.PHONY: clean-all
clean-all: down ## Clean all Docker resources including networks
	docker system prune -af
	docker network prune -f

.PHONY: test-clean-logs
test-clean-logs: ## Очистить только логи тестов
	@echo "$(YELLOW)🗑️ Очистка логов тестов...$(NC)"
	@rm -rf $(FUNCTIONAL_TESTS_DIR)/logs/*
	@echo "$(GREEN)✅ Логи очищены$(NC)"

.PHONY: test-clean-old-logs
test-clean-old-logs: ## Очистить логи старше 30 дней
	@echo "$(YELLOW)🗑️ Очистка старых логов (>30 дней)...$(NC)"
	@find $(FUNCTIONAL_TESTS_DIR)/logs/ -name "test_results_*.log" -mtime +30 -delete 2>/dev/null || true
	@find $(FUNCTIONAL_TESTS_DIR)/logs/ -name "test_results_*.json" -mtime +30 -delete 2>/dev/null || true
	@echo "$(GREEN)✅ Старые логи очищены$(NC)"

.PHONY: dev
dev: backend-up ## Quick start for development (backend only)
	@echo "🎯 Backend ready at http://localhost:$(BACKEND_PORT)/docs"