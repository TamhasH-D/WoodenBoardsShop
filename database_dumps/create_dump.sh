#!/bin/bash

# Скрипт для создания дампов базы данных PostgreSQL
# Автор: Дипломный проект "Магазин деревянных досок"
# Дата: 09.06.2025

set -e  # Остановить выполнение при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Конфигурация
CONTAINER_NAME="backend-pg"
DB_USER="backend"
DB_NAME="backend"
DUMP_DIR="database_dumps"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Проверка существования контейнера
check_container() {
    log_info "Проверка контейнера PostgreSQL..."
    if ! docker ps | grep -q "$CONTAINER_NAME"; then
        log_error "Контейнер $CONTAINER_NAME не запущен!"
        log_info "Запустите базу данных командой: make backend-up"
        exit 1
    fi
    log_success "Контейнер $CONTAINER_NAME найден и запущен"
}

# Создание директории для дампов
create_dump_directory() {
    log_info "Создание директории для дампов..."
    mkdir -p "$DUMP_DIR"
    log_success "Директория $DUMP_DIR готова"
}

# Создание полного дампа
create_full_dump() {
    local filename="$DUMP_DIR/diplom_database_full_$TIMESTAMP.sql"
    log_info "Создание полного дампа базы данных..."
    
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --create \
        --verbose > "$filename" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$filename" | cut -f1)
        log_success "Полный дамп создан: $filename ($size)"
    else
        log_error "Ошибка при создании полного дампа"
        return 1
    fi
}

# Создание дампа структуры
create_schema_dump() {
    local filename="$DUMP_DIR/diplom_database_schema_$TIMESTAMP.sql"
    log_info "Создание дампа структуры базы данных..."
    
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --schema-only \
        --clean \
        --if-exists \
        --create \
        --verbose > "$filename" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$filename" | cut -f1)
        log_success "Дамп структуры создан: $filename ($size)"
    else
        log_error "Ошибка при создании дампа структуры"
        return 1
    fi
}

# Создание дампа данных
create_data_dump() {
    local filename="$DUMP_DIR/diplom_database_data_$TIMESTAMP.sql"
    log_info "Создание дампа данных..."
    
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --data-only \
        --verbose > "$filename" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$filename" | cut -f1)
        log_success "Дамп данных создан: $filename ($size)"
    else
        log_error "Ошибка при создании дампа данных"
        return 1
    fi
}

# Создание сжатого дампа
create_compressed_dump() {
    local filename="$DUMP_DIR/diplom_database_full_$TIMESTAMP.sql.gz"
    log_info "Создание сжатого дампа базы данных..."
    
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --clean \
        --if-exists \
        --create \
        --verbose | gzip > "$filename" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$filename" | cut -f1)
        log_success "Сжатый дамп создан: $filename ($size)"
    else
        log_error "Ошибка при создании сжатого дампа"
        return 1
    fi
}

# Получение информации о базе данных
get_database_info() {
    log_info "Получение информации о базе данных..."
    
    echo "=== ИНФОРМАЦИЯ О БАЗЕ ДАННЫХ ===" > "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    echo "Дата создания дампа: $(date)" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    echo "Контейнер: $CONTAINER_NAME" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    echo "База данных: $DB_NAME" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    echo "Пользователь: $DB_USER" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    echo "" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    
    echo "=== СПИСОК ТАБЛИЦ ===" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "\dt" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt" 2>/dev/null
    echo "" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    
    echo "=== СТАТИСТИКА ТАБЛИЦ ===" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt"
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" -c "
    SELECT 
        schemaname,
        relname as table_name,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows
    FROM pg_stat_user_tables 
    ORDER BY relname;" >> "$DUMP_DIR/database_info_$TIMESTAMP.txt" 2>/dev/null
    
    log_success "Информация о базе данных сохранена: database_info_$TIMESTAMP.txt"
}

# Очистка старых дампов (оставляем последние 5)
cleanup_old_dumps() {
    log_info "Очистка старых дампов..."
    
    # Подсчитываем количество дампов
    local full_dumps=$(ls -1 "$DUMP_DIR"/diplom_database_full_*.sql 2>/dev/null | wc -l)
    
    if [ "$full_dumps" -gt 5 ]; then
        log_warning "Найдено $full_dumps дампов, удаляем старые..."
        ls -1t "$DUMP_DIR"/diplom_database_full_*.sql | tail -n +6 | xargs rm -f
        ls -1t "$DUMP_DIR"/diplom_database_schema_*.sql | tail -n +6 | xargs rm -f 2>/dev/null || true
        ls -1t "$DUMP_DIR"/diplom_database_data_*.sql | tail -n +6 | xargs rm -f 2>/dev/null || true
        ls -1t "$DUMP_DIR"/database_info_*.txt | tail -n +6 | xargs rm -f 2>/dev/null || true
        log_success "Старые дампы удалены"
    else
        log_info "Очистка не требуется ($full_dumps дампов)"
    fi
}

# Показать справку
show_help() {
    echo "Использование: $0 [опции]"
    echo ""
    echo "Опции:"
    echo "  -f, --full      Создать только полный дамп"
    echo "  -s, --schema    Создать только дамп структуры"
    echo "  -d, --data      Создать только дамп данных"
    echo "  -c, --compress  Создать сжатый дамп"
    echo "  -a, --all       Создать все типы дампов (по умолчанию)"
    echo "  -i, --info      Получить только информацию о БД"
    echo "  --no-cleanup    Не удалять старые дампы"
    echo "  -h, --help      Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0                    # Создать все дампы"
    echo "  $0 --full             # Создать только полный дамп"
    echo "  $0 --schema --data    # Создать дампы структуры и данных"
    echo "  $0 --compress         # Создать сжатый дамп"
}

# Основная функция
main() {
    local create_full=false
    local create_schema=false
    local create_data=false
    local create_compressed=false
    local get_info=false
    local do_cleanup=true
    local create_all=true
    
    # Парсинг аргументов
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--full)
                create_full=true
                create_all=false
                shift
                ;;
            -s|--schema)
                create_schema=true
                create_all=false
                shift
                ;;
            -d|--data)
                create_data=true
                create_all=false
                shift
                ;;
            -c|--compress)
                create_compressed=true
                create_all=false
                shift
                ;;
            -a|--all)
                create_all=true
                shift
                ;;
            -i|--info)
                get_info=true
                create_all=false
                shift
                ;;
            --no-cleanup)
                do_cleanup=false
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Неизвестная опция: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Выполнение
    log_info "Начало создания дампов базы данных..."
    log_info "Временная метка: $TIMESTAMP"
    
    check_container
    create_dump_directory
    
    if [ "$create_all" = true ]; then
        create_full_dump
        create_schema_dump
        create_data_dump
        get_database_info
    else
        [ "$create_full" = true ] && create_full_dump
        [ "$create_schema" = true ] && create_schema_dump
        [ "$create_data" = true ] && create_data_dump
        [ "$create_compressed" = true ] && create_compressed_dump
        [ "$get_info" = true ] && get_database_info
    fi
    
    [ "$do_cleanup" = true ] && cleanup_old_dumps
    
    log_success "Создание дампов завершено!"
    log_info "Файлы сохранены в директории: $DUMP_DIR"
    
    # Показать созданные файлы
    echo ""
    log_info "Созданные файлы:"
    ls -lh "$DUMP_DIR"/*"$TIMESTAMP"* 2>/dev/null || true
}

# Запуск основной функции
main "$@"
