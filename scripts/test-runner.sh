#!/bin/bash
# Скрипт для запуска функциональных тестов с расширенными возможностями

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
FUNCTIONAL_TESTS_DIR="functional_tests"
TEST_COMPOSE_FILE="$FUNCTIONAL_TESTS_DIR/docker-compose.test.yaml"
TEST_PROJECT_NAME="diplom-functional-tests"
TIMEOUT=300  # 5 минут

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

# Функция для проверки зависимостей
check_dependencies() {
    log "Проверка зависимостей..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker не установлен"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose не установлен"
        exit 1
    fi
    
    if [ ! -f "$TEST_COMPOSE_FILE" ]; then
        log_error "Файл $TEST_COMPOSE_FILE не найден"
        exit 1
    fi
    
    log_success "Все зависимости установлены"
}

# Функция для ожидания готовности сервисов
wait_for_services() {
    log "Ожидание готовности сервисов..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        log "Попытка $attempt/$max_attempts..."
        
        # Проверка основных сервисов
        if curl -s -f "http://localhost:8000/health" >/dev/null 2>&1; then
            log_success "Backend API готов"
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "Сервисы не готовы после $max_attempts попыток"
            return 1
        fi
        
        sleep 10
        ((attempt++))
    done
    
    log_success "Сервисы готовы к тестированию"
}

# Функция для проверки состояния сервисов
check_service_health() {
    log "Проверка состояния сервисов..."
    
    local services=(
        "Backend API:http://localhost:8000/health"
        "Admin Frontend:http://localhost:8080"
        "Seller Frontend:http://localhost:8081"
        "Buyer Frontend:http://localhost:8082"
    )
    
    local all_healthy=true
    
    for service in "${services[@]}"; do
        local name=$(echo "$service" | cut -d: -f1)
        local url=$(echo "$service" | cut -d: -f2-)
        
        if curl -s -f "$url" >/dev/null 2>&1; then
            echo -e "  ${GREEN}✅ $name${NC} - доступен"
        else
            echo -e "  ${RED}❌ $name${NC} - недоступен ($url)"
            all_healthy=false
        fi
    done
    
    if [ "$all_healthy" = true ]; then
        log_success "Все сервисы работают корректно"
        return 0
    else
        log_warning "Некоторые сервисы недоступны"
        return 1
    fi
}

# Функция для запуска тестов
run_tests() {
    local test_type="${1:-all}"
    local pytest_args="${2:-}"
    
    log "Запуск тестов (тип: $test_type)..."
    
    # Остановка предыдущих контейнеров
    log "Остановка предыдущих контейнеров..."
    cd "$FUNCTIONAL_TESTS_DIR" && docker-compose -f docker-compose.test.yaml -p "$TEST_PROJECT_NAME" down --remove-orphans 2>/dev/null || true
    
    # Запуск тестового окружения
    log "Запуск тестового окружения..."
    cd "$FUNCTIONAL_TESTS_DIR" && docker-compose -f docker-compose.test.yaml -p "$TEST_PROJECT_NAME" up -d --remove-orphans
    
    # Ожидание готовности сервисов
    if ! wait_for_services; then
        log_error "Не удалось дождаться готовности сервисов"
        cleanup_on_error
        exit 1
    fi
    
    # Проверка состояния сервисов
    check_service_health || log_warning "Продолжаем тестирование несмотря на проблемы с сервисами"
    
    # Запуск тестов
    log "Выполнение тестов..."
    local test_exit_code=0
    
    cd "$FUNCTIONAL_TESTS_DIR" && \
        TEST_TYPE="$test_type" \
        PYTEST_ARGS="$pytest_args" \
        timeout "$TIMEOUT" docker-compose -f docker-compose.test.yaml -p "$TEST_PROJECT_NAME" run --rm functional-tests || test_exit_code=$?
    
    # Остановка тестового окружения
    log "Остановка тестового окружения..."
    cd "$FUNCTIONAL_TESTS_DIR" && docker-compose -f docker-compose.test.yaml -p "$TEST_PROJECT_NAME" down --remove-orphans
    
    if [ $test_exit_code -eq 0 ]; then
        log_success "Тесты выполнены успешно"
    else
        log_error "Тесты завершились с ошибкой (код: $test_exit_code)"
    fi
    
    return $test_exit_code
}

# Функция для очистки при ошибке
cleanup_on_error() {
    log_warning "Очистка после ошибки..."
    
    # Показать логи контейнеров
    log "Логи контейнеров:"
    cd "$FUNCTIONAL_TESTS_DIR" && docker-compose -f docker-compose.test.yaml -p "$TEST_PROJECT_NAME" logs --tail=50 2>/dev/null || true
    
    # Остановить контейнеры
    cd "$FUNCTIONAL_TESTS_DIR" && docker-compose -f docker-compose.test.yaml -p "$TEST_PROJECT_NAME" down --remove-orphans 2>/dev/null || true
}

# Функция для показа результатов
show_results() {
    log "Результаты тестирования:"
    echo ""
    echo -e "${BLUE}📊 Результаты доступны в:${NC}"
    echo "  • HTML отчеты: $FUNCTIONAL_TESTS_DIR/reports/"
    echo "  • Логи тестов: $FUNCTIONAL_TESTS_DIR/logs/"
    echo "  • Скриншоты: $FUNCTIONAL_TESTS_DIR/screenshots/"
    echo ""
    echo -e "${BLUE}🔍 Для анализа используйте:${NC}"
    echo "  • make test-logs-stats - статистика последнего запуска"
    echo "  • make test-reports - открыть HTML отчеты"
    echo "  • cd $FUNCTIONAL_TESTS_DIR && python utils/log_analyzer.py --latest - детальный анализ"
    
    # Показать краткую статистику если доступна
    if [ -d "$FUNCTIONAL_TESTS_DIR/logs" ] && [ "$(ls -A $FUNCTIONAL_TESTS_DIR/logs/)" ]; then
        local latest_json=$(ls -t $FUNCTIONAL_TESTS_DIR/logs/test_results_*.json 2>/dev/null | head -1)
        if [ -n "$latest_json" ]; then
            echo ""
            echo -e "${YELLOW}📈 Краткая статистика:${NC}"
            cd "$FUNCTIONAL_TESTS_DIR" && python3 -c "
import json
try:
    with open('$latest_json', 'r') as f:
        data = json.load(f)
    stats = data['statistics']
    total = stats['total']
    passed = stats['passed']
    failed = stats['failed']
    skipped = stats['skipped']
    success_rate = (passed / total * 100) if total > 0 else 0
    print(f'  Всего тестов: {total}')
    print(f'  ✅ Пройдено: {passed}')
    print(f'  ❌ Упало: {failed}')
    print(f'  ⏭️ Пропущено: {skipped}')
    print(f'  📊 Успешность: {success_rate:.1f}%')
except Exception as e:
    print(f'  Ошибка при чтении статистики: {e}')
" 2>/dev/null || echo "  Не удалось получить статистику"
        fi
    fi
}

# Обработка сигналов для корректной очистки
trap cleanup_on_error INT TERM

# Основная функция
main() {
    local test_type="${1:-all}"
    local pytest_args="${2:-}"
    
    echo -e "${GREEN}🧪 Запуск функциональных тестов${NC}"
    echo -e "${YELLOW}================================${NC}"
    echo ""
    
    check_dependencies
    
    if run_tests "$test_type" "$pytest_args"; then
        log_success "Тестирование завершено успешно"
        show_results
        exit 0
    else
        log_error "Тестирование завершилось с ошибками"
        show_results
        exit 1
    fi
}

# Справка
show_help() {
    echo "Использование: $0 [TEST_TYPE] [PYTEST_ARGS]"
    echo ""
    echo "TEST_TYPE:"
    echo "  all          - Все тесты (по умолчанию)"
    echo "  api          - Только API тесты"
    echo "  browser      - Только браузерные тесты"
    echo "  integration  - Только интеграционные тесты"
    echo ""
    echo "PYTEST_ARGS:"
    echo "  Дополнительные аргументы для pytest"
    echo ""
    echo "Примеры:"
    echo "  $0                           # Все тесты"
    echo "  $0 api                       # Только API тесты"
    echo "  $0 browser '-v -s'           # Браузерные тесты с подробным выводом"
    echo "  $0 all '--tb=short'          # Все тесты с коротким traceback"
}

# Проверка аргументов
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# Запуск основной функции
main "$@"
