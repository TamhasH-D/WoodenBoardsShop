#!/bin/bash

# Скрипт для локального тестирования функциональных тестов
# Имитирует поведение GitLab CI/CD pipeline

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Функция для очистки
cleanup() {
    log "🧹 Очистка ресурсов..."
    cd functional_tests
    docker-compose -f docker-compose.test.yaml down -v --remove-orphans 2>/dev/null || true
    cd ..
    
    # Восстановление оригинального .env если он был сохранен
    if [ -f ".env.backup" ]; then
        mv .env.backup .env
        log "Восстановлен оригинальный .env файл"
    fi
}

# Обработка сигналов для корректной очистки
trap cleanup EXIT INT TERM

# Проверка зависимостей
check_dependencies() {
    log "🔍 Проверка зависимостей..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен"
        exit 1
    fi
    
    success "Все зависимости установлены"
}

# Валидация структуры проекта
validate_project_structure() {
    log "🔍 Валидация структуры проекта..."
    
    required_files=(
        "docker-compose.yaml"
        "Makefile"
        "README.md"
        "functional_tests/docker-compose.test.yaml"
        "functional_tests/Dockerfile"
        "functional_tests/requirements.txt"
        "functional_tests/conftest.py"
        "functional_tests/utils/api_client.py"
        "functional_tests/utils/data_factory.py"
    )
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Отсутствует обязательный файл: $file"
            exit 1
        fi
    done
    
    required_dirs=(
        "functional_tests/api_tests"
        "functional_tests/browser_tests"
        "functional_tests/integration_tests"
        "functional_tests/utils"
        "functional_tests/base"
    )
    
    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            error "Отсутствует обязательная директория: $dir"
            exit 1
        fi
    done
    
    success "Структура проекта валидна"
}

# Сборка образов
build_images() {
    log "🏗️ Сборка Docker образов..."
    
    # Сборка основных сервисов
    log "Сборка основных сервисов..."
    docker-compose build --parallel
    
    # Сборка образа функциональных тестов
    log "Сборка образа функциональных тестов..."
    cd functional_tests
    docker build -t functional-tests:local .
    cd ..
    
    success "Сборка образов завершена"
}

# Запуск API тестов
run_api_tests() {
    log "🔌 Запуск API тестов..."
    
    cd functional_tests
    
    # Запуск API тестов
    TEST_TYPE=api docker-compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from functional-tests
    
    # Проверка результатов
    if [ $? -eq 0 ]; then
        success "API тесты прошли успешно"
    else
        error "API тесты завершились с ошибкой"
        return 1
    fi
    
    cd ..
}

# Запуск браузерных тестов
run_browser_tests() {
    log "🌐 Запуск браузерных тестов..."
    
    cd functional_tests
    
    # Запуск браузерных тестов
    TEST_TYPE=browser docker-compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from functional-tests
    
    # Проверка результатов
    if [ $? -eq 0 ]; then
        success "Браузерные тесты прошли успешно"
    else
        warning "Браузерные тесты завершились с ошибкой (это может быть нормально для локального окружения)"
    fi
    
    cd ..
}

# Запуск интеграционных тестов
run_integration_tests() {
    log "🔗 Запуск интеграционных тестов..."
    
    cd functional_tests
    
    # Запуск интеграционных тестов
    TEST_TYPE=integration docker-compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from functional-tests
    
    # Проверка результатов
    if [ $? -eq 0 ]; then
        success "Интеграционные тесты прошли успешно"
    else
        warning "Интеграционные тесты завершились с ошибкой"
    fi
    
    cd ..
}

# Запуск полного набора тестов
run_full_test_suite() {
    log "🚀 Запуск полного набора функциональных тестов..."
    
    cd functional_tests
    
    # Запуск всех тестов
    TEST_TYPE=all docker-compose -f docker-compose.test.yaml up --build --abort-on-container-exit --exit-code-from functional-tests
    
    # Проверка результатов
    if [ $? -eq 0 ]; then
        success "Полный набор тестов прошел успешно"
    else
        error "Полный набор тестов завершился с ошибкой"
        return 1
    fi
    
    cd ..
}

# Сбор отчетов
collect_reports() {
    log "📊 Сбор отчетов..."
    
    if [ -d "functional_tests/reports" ]; then
        log "Найдены отчеты:"
        ls -la functional_tests/reports/
        
        # Открытие отчета в браузере (если возможно)
        if command -v xdg-open &> /dev/null && [ -f "functional_tests/reports/all_tests_report.html" ]; then
            log "Открытие отчета в браузере..."
            xdg-open functional_tests/reports/all_tests_report.html &
        fi
    else
        warning "Отчеты не найдены"
    fi
    
    if [ -d "functional_tests/screenshots" ]; then
        screenshot_count=$(find functional_tests/screenshots -name "*.png" | wc -l)
        if [ $screenshot_count -gt 0 ]; then
            log "Найдено скриншотов: $screenshot_count"
        fi
    fi
}

# Основная функция
main() {
    log "🚀 Запуск локального тестирования функциональных тестов"
    log "Имитация GitLab CI/CD pipeline"
    
    # Парсинг аргументов
    TEST_TYPE_ARG="all"
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --api)
                TEST_TYPE_ARG="api"
                shift
                ;;
            --browser)
                TEST_TYPE_ARG="browser"
                shift
                ;;
            --integration)
                TEST_TYPE_ARG="integration"
                shift
                ;;
            --all)
                TEST_TYPE_ARG="all"
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --help)
                echo "Использование: $0 [--api|--browser|--integration|--all] [--skip-build]"
                echo "  --api          Запустить только API тесты"
                echo "  --browser      Запустить только браузерные тесты"
                echo "  --integration  Запустить только интеграционные тесты"
                echo "  --all          Запустить все тесты (по умолчанию)"
                echo "  --skip-build   Пропустить сборку образов"
                echo "  --help         Показать эту справку"
                exit 0
                ;;
            *)
                warning "Неизвестный аргумент: $1"
                shift
                ;;
        esac
    done
    
    # Выполнение этапов
    check_dependencies
    validate_project_structure
    
    if [ "$SKIP_BUILD" = false ]; then
        build_images
    else
        log "⏭️ Пропуск сборки образов"
    fi
    
    # Запуск тестов в зависимости от типа
    case $TEST_TYPE_ARG in
        api)
            run_api_tests
            ;;
        browser)
            run_browser_tests
            ;;
        integration)
            run_integration_tests
            ;;
        all)
            run_full_test_suite
            ;;
    esac
    
    collect_reports
    
    success "🎉 Локальное тестирование завершено!"
    log "Отчеты доступны в директории: functional_tests/reports/"
    log "Скриншоты доступны в директории: functional_tests/screenshots/"
}

# Запуск основной функции
main "$@"
