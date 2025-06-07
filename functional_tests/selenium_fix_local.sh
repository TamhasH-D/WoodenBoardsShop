#!/bin/bash

# Локальный скрипт для исправления проблем Selenium
# Работает извне Docker контейнеров

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
COMPOSE_FILE="docker-compose.test.yaml"
PROJECT_NAME="diplom-functional-tests"
SELENIUM_HUB_URL="http://localhost:4444"

# Функции логирования
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

# Функция для выполнения команд
run_command() {
    local cmd="$1"
    log "🔧 Выполняем: $cmd"
    
    if eval "$cmd"; then
        success "Команда выполнена успешно"
        return 0
    else
        error "Команда завершилась с ошибкой"
        return 1
    fi
}

# Остановка Selenium сервисов
stop_selenium_services() {
    log "🛑 Остановка Selenium сервисов..."
    
    run_command "docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME stop selenium-chrome" || true
    run_command "docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME stop selenium-hub" || true
    
    success "Сервисы остановлены"
}

# Удаление контейнеров
remove_selenium_containers() {
    log "🗑️ Удаление Selenium контейнеров..."
    
    run_command "docker rm -f selenium-chrome" || true
    run_command "docker rm -f selenium-hub" || true
    
    success "Контейнеры удалены"
}

# Обновление образов
pull_selenium_images() {
    log "📥 Обновление Selenium образов..."
    
    run_command "docker pull selenium/hub:4.25.0"
    run_command "docker pull selenium/node-chrome:4.25.0"
    
    success "Образы обновлены"
}

# Запуск сервисов
start_selenium_services() {
    log "🚀 Запуск Selenium сервисов..."
    
    # Запуск Hub
    run_command "docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d selenium-hub"
    
    log "⏳ Ожидание готовности Selenium Hub..."
    sleep 30
    
    # Запуск Chrome Node
    run_command "docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d selenium-chrome"
    
    log "⏳ Ожидание готовности Chrome Node..."
    sleep 20
    
    success "Сервисы запущены"
}

# Проверка здоровья
verify_selenium_health() {
    log "🏥 Проверка здоровья Selenium Grid..."
    log "🔗 Используется URL: $SELENIUM_HUB_URL"

    local max_attempts=15

    for attempt in $(seq 1 $max_attempts); do
        log "🔍 Попытка $attempt/$max_attempts"

        # Проверяем статус контейнеров
        log "📊 Статус контейнеров:"
        docker ps --filter "name=selenium" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || true

        # Проверяем Hub status через Docker exec (более надежно)
        if docker exec selenium-hub curl -s -f "http://localhost:4444/wd/hub/status" >/dev/null 2>&1; then
            local status_response=$(docker exec selenium-hub curl -s "http://localhost:4444/wd/hub/status")
            local ready=$(echo "$status_response" | grep -o '"ready":[^,}]*' | cut -d':' -f2 | tr -d ' ')

            if [ "$ready" = "true" ]; then
                success "Selenium Hub готов!"

                # Проверяем количество узлов
                local nodes_count=$(echo "$status_response" | grep -o '"nodes":\[' | wc -l)
                if [ "$nodes_count" -gt 0 ]; then
                    success "Chrome Node подключен к Hub!"

                    # Дополнительная проверка Grid API
                    if docker exec selenium-hub curl -s -f "http://localhost:4444/grid/api/hub" >/dev/null 2>&1; then
                        success "Selenium Grid API работает!"
                    else
                        warning "Grid API недоступен, но Hub готов"
                    fi

                    return 0
                else
                    log "⏳ Chrome Node еще не подключился к Hub"
                fi
            else
                log "⏳ Hub не готов. Статус: $ready"
            fi
        else
            log "⏳ Hub недоступен или не отвечает"
        fi

        sleep 10
    done

    error "Selenium Grid не готов после $max_attempts попыток"

    # Показываем детальную диагностику при неудаче
    log "🔍 Детальная диагностика:"
    log "Логи Selenium Hub:"
    docker logs --tail=10 selenium-hub || true
    log "Логи Chrome Node:"
    docker logs --tail=10 selenium-chrome || true

    return 1
}

# Показ логов
show_selenium_logs() {
    log "📋 Логи Selenium Hub:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=20 selenium-hub || true
    
    log "📋 Логи Chrome Node:"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs --tail=20 selenium-chrome || true
}

# Основная функция
main() {
    log "🚀 Автоматическое исправление проблем Selenium Grid"
    echo "============================================================"
    
    # Проверяем зависимости
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker не установлен"
        exit 1
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose не установлен"
        exit 1
    fi
    
    if ! command -v curl >/dev/null 2>&1; then
        error "curl не установлен"
        exit 1
    fi
    
    if ! command -v nc >/dev/null 2>&1; then
        warning "netcat не установлен, проверка портов будет ограничена"
    fi
    
    # Показываем текущие логи
    show_selenium_logs
    
    echo "============================================================"
    
    # Выполняем исправление
    local steps=(
        "stop_selenium_services:Остановка сервисов"
        "remove_selenium_containers:Удаление контейнеров"
        "pull_selenium_images:Обновление образов"
        "start_selenium_services:Запуск сервисов"
        "verify_selenium_health:Проверка здоровья"
    )
    
    for step in "${steps[@]}"; do
        local func_name="${step%%:*}"
        local step_name="${step##*:}"
        
        log "📋 Шаг: $step_name"
        
        if $func_name; then
            success "Шаг '$step_name' выполнен успешно"
        else
            error "Шаг '$step_name' завершился неудачно"
            
            log "🔍 Показываем логи для диагностики:"
            show_selenium_logs
            
            exit 1
        fi
    done
    
    success "🎉 Все проблемы Selenium успешно исправлены!"
    log "🔗 Selenium Hub доступен по адресу: $SELENIUM_HUB_URL"
    log "📊 Проверить статус: make selenium-status"
}

# Запуск основной функции
main "$@"
