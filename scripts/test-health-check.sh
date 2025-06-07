#!/bin/bash
# Скрипт для проверки готовности системы к тестированию

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Загрузка переменных окружения
if [ -f ".env" ]; then
    source .env
fi

# Установка значений по умолчанию
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_ADMIN_PORT=${FRONTEND_ADMIN_PORT:-8080}
FRONTEND_SELLER_PORT=${FRONTEND_SELLER_PORT:-8081}
FRONTEND_BUYER_PORT=${FRONTEND_BUYER_PORT:-8082}
PROSTO_BOARD_PORT=${PROSTO_BOARD_PORT:-8001}
DETECT_PORT=${DETECT_PORT:-8002}

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

# Функция для проверки порта
check_port() {
    local port=$1
    local service_name=$2
    
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "  ${GREEN}✅ Порт $port${NC} ($service_name) - занят"
        return 0
    else
        echo -e "  ${RED}❌ Порт $port${NC} ($service_name) - свободен"
        return 1
    fi
}

# Функция для проверки HTTP сервиса
check_http_service() {
    local url=$1
    local service_name=$2
    local timeout=${3:-5}
    
    if curl -s -f --max-time "$timeout" "$url" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅ $service_name${NC} - доступен ($url)"
        return 0
    else
        echo -e "  ${RED}❌ $service_name${NC} - недоступен ($url)"
        return 1
    fi
}

# Функция для проверки Docker
check_docker() {
    log "Проверка Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker не установлен"
        return 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log_error "Docker daemon не запущен"
        return 1
    fi
    
    log_success "Docker работает корректно"
    return 0
}

# Функция для проверки Docker Compose
check_docker_compose() {
    log "Проверка Docker Compose..."
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose не установлен"
        return 1
    fi
    
    log_success "Docker Compose установлен"
    return 0
}

# Функция для проверки файлов конфигурации
check_config_files() {
    log "Проверка файлов конфигурации..."
    
    local files=(
        "docker-compose.yaml"
        "functional_tests/docker-compose.test.yaml"
        "functional_tests/Dockerfile"
        "functional_tests/requirements.txt"
        ".env"
    )
    
    local all_exist=true
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "  ${GREEN}✅ $file${NC} - найден"
        else
            echo -e "  ${RED}❌ $file${NC} - не найден"
            all_exist=false
        fi
    done
    
    if [ "$all_exist" = true ]; then
        log_success "Все файлы конфигурации найдены"
        return 0
    else
        log_error "Некоторые файлы конфигурации отсутствуют"
        return 1
    fi
}

# Функция для проверки портов
check_ports() {
    log "Проверка портов..."
    
    local ports=(
        "$BACKEND_PORT:Backend API"
        "$FRONTEND_ADMIN_PORT:Admin Frontend"
        "$FRONTEND_SELLER_PORT:Seller Frontend"
        "$FRONTEND_BUYER_PORT:Buyer Frontend"
        "$PROSTO_BOARD_PORT:YOLO Backend"
        "$DETECT_PORT:YOLO Detect"
    )
    
    local any_running=false
    
    for port_info in "${ports[@]}"; do
        local port=$(echo "$port_info" | cut -d: -f1)
        local service=$(echo "$port_info" | cut -d: -f2)
        
        if check_port "$port" "$service"; then
            any_running=true
        fi
    done
    
    if [ "$any_running" = true ]; then
        log_success "Некоторые сервисы уже запущены"
    else
        log_warning "Сервисы не запущены"
    fi
}

# Функция для проверки HTTP сервисов
check_http_services() {
    log "Проверка HTTP сервисов..."
    
    local services=(
        "http://localhost:$BACKEND_PORT/health:Backend API Health"
        "http://localhost:$BACKEND_PORT/docs:Backend API Docs"
        "http://localhost:$FRONTEND_ADMIN_PORT:Admin Frontend"
        "http://localhost:$FRONTEND_SELLER_PORT:Seller Frontend"
        "http://localhost:$FRONTEND_BUYER_PORT:Buyer Frontend"
        "http://localhost:$PROSTO_BOARD_PORT:YOLO Backend"
        "http://localhost:$DETECT_PORT:YOLO Detect"
    )
    
    local healthy_count=0
    local total_count=${#services[@]}
    
    for service in "${services[@]}"; do
        local url=$(echo "$service" | cut -d: -f1-2)
        local name=$(echo "$service" | cut -d: -f3)
        
        if check_http_service "$url" "$name" 3; then
            ((healthy_count++))
        fi
    done
    
    echo ""
    if [ $healthy_count -eq $total_count ]; then
        log_success "Все HTTP сервисы доступны ($healthy_count/$total_count)"
        return 0
    elif [ $healthy_count -gt 0 ]; then
        log_warning "Частично доступны HTTP сервисы ($healthy_count/$total_count)"
        return 1
    else
        log_error "HTTP сервисы недоступны ($healthy_count/$total_count)"
        return 1
    fi
}

# Функция для проверки контейнеров
check_containers() {
    log "Проверка Docker контейнеров..."
    
    if ! docker ps >/dev/null 2>&1; then
        log_error "Не удалось получить список контейнеров"
        return 1
    fi
    
    local running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -v "NAMES" | wc -l)
    
    if [ $running_containers -gt 0 ]; then
        echo -e "${GREEN}Запущенные контейнеры:${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10
        log_success "Найдено $running_containers запущенных контейнеров"
    else
        log_warning "Нет запущенных контейнеров"
    fi
    
    return 0
}

# Функция для проверки дискового пространства
check_disk_space() {
    log "Проверка дискового пространства..."
    
    local available_space=$(df . | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))
    
    if [ $available_gb -lt 1 ]; then
        log_error "Недостаточно дискового пространства: ${available_gb}GB доступно"
        return 1
    elif [ $available_gb -lt 5 ]; then
        log_warning "Мало дискового пространства: ${available_gb}GB доступно"
        return 1
    else
        log_success "Достаточно дискового пространства: ${available_gb}GB доступно"
        return 0
    fi
}

# Функция для проверки памяти
check_memory() {
    log "Проверка оперативной памяти..."
    
    if command -v free >/dev/null 2>&1; then
        local available_mem=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        
        if [ $available_mem -lt 512 ]; then
            log_error "Недостаточно оперативной памяти: ${available_mem}MB доступно"
            return 1
        elif [ $available_mem -lt 1024 ]; then
            log_warning "Мало оперативной памяти: ${available_mem}MB доступно"
            return 1
        else
            log_success "Достаточно оперативной памяти: ${available_mem}MB доступно"
            return 0
        fi
    else
        log_warning "Не удалось проверить оперативную память"
        return 1
    fi
}

# Функция для общей проверки готовности
check_readiness() {
    local checks_passed=0
    local total_checks=8
    
    echo -e "${GREEN}🔍 Проверка готовности системы к тестированию${NC}"
    echo -e "${YELLOW}===============================================${NC}"
    echo ""
    
    # Выполнение всех проверок
    check_docker && ((checks_passed++)) || true
    check_docker_compose && ((checks_passed++)) || true
    check_config_files && ((checks_passed++)) || true
    check_disk_space && ((checks_passed++)) || true
    check_memory && ((checks_passed++)) || true
    check_ports && ((checks_passed++)) || true
    check_containers && ((checks_passed++)) || true
    check_http_services && ((checks_passed++)) || true
    
    echo ""
    echo -e "${YELLOW}===============================================${NC}"
    
    if [ $checks_passed -eq $total_checks ]; then
        log_success "Система полностью готова к тестированию ($checks_passed/$total_checks)"
        echo ""
        echo -e "${GREEN}🚀 Можно запускать тесты:${NC}"
        echo "  • make test - все тесты"
        echo "  • make test-api - API тесты"
        echo "  • make test-browser - браузерные тесты"
        echo "  • make test-integration - интеграционные тесты"
        return 0
    elif [ $checks_passed -ge $((total_checks * 3 / 4)) ]; then
        log_warning "Система частично готова к тестированию ($checks_passed/$total_checks)"
        echo ""
        echo -e "${YELLOW}⚠️ Рекомендуется устранить проблемы перед тестированием${NC}"
        return 1
    else
        log_error "Система не готова к тестированию ($checks_passed/$total_checks)"
        echo ""
        echo -e "${RED}❌ Необходимо устранить критические проблемы${NC}"
        return 1
    fi
}

# Функция для показа справки
show_help() {
    echo "Использование: $0 [ОПЦИИ]"
    echo ""
    echo "Опции:"
    echo "  -h, --help     Показать эту справку"
    echo "  -q, --quiet    Тихий режим (только ошибки)"
    echo "  -v, --verbose  Подробный режим"
    echo ""
    echo "Этот скрипт проверяет готовность системы к запуску функциональных тестов."
    echo "Проверяются: Docker, конфигурация, ресурсы, сервисы."
}

# Обработка аргументов командной строки
QUIET=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Неизвестная опция: $1"
            show_help
            exit 1
            ;;
    esac
done

# Запуск проверки
if [ "$QUIET" = true ]; then
    check_readiness >/dev/null 2>&1
    exit $?
else
    check_readiness
    exit $?
fi
