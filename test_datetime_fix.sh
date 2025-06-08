#!/bin/bash

# Тест исправления времени created_at в моделях
echo "🔧 Тест исправления времени created_at в моделях"
echo "=" | tr ' ' '=' | head -c 60; echo

# Конфигурация
API_URL="http://localhost:8001"

# Функция генерации UUID
generate_uuid() {
    python3 -c "import uuid; print(uuid.uuid4())"
}

# Функция получения текущего времени
get_current_time() {
    date -u +"%Y-%m-%dT%H:%M:%S.%3NZ"
}

# Проверка доступности API
echo "🔍 Проверка доступности тестового API..."
if curl -s -f "$API_URL/health" > /dev/null; then
    echo "✅ Тестовый API доступен: $API_URL"
else
    echo "❌ Тестовый API недоступен"
    exit 1
fi

echo
echo "📝 Тест 1: Создание типа древесины"

# Создание типа древесины
WOOD_TYPE_ID=$(generate_uuid)
WOOD_TYPE_NAME="Тестовая древесина $(date +%s)"

WOOD_TYPE_DATA="{
    \"id\": \"$WOOD_TYPE_ID\",
    \"neme\": \"$WOOD_TYPE_NAME\",
    \"description\": \"Тестовое описание\"
}"

echo "Создание типа древесины..."
WOOD_TYPE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/wood-types" \
    -H "Content-Type: application/json" \
    -d "$WOOD_TYPE_DATA")

if echo "$WOOD_TYPE_RESPONSE" | grep -q "\"id\""; then
    echo "✅ Тип древесины создан: $WOOD_TYPE_ID"
else
    echo "❌ Ошибка создания типа древесины"
    echo "Ответ: $WOOD_TYPE_RESPONSE"
    exit 1
fi

echo
echo "📝 Тест 2: Создание цен на древесину (с интервалом)"

# Создание нескольких цен с интервалом
for i in {1..3}; do
    echo "Создание цены $i..."
    
    PRICE_ID=$(generate_uuid)
    PRICE_VALUE=$((1000 + i * 100))
    REQUEST_TIME=$(get_current_time)
    
    PRICE_DATA="{
        \"id\": \"$PRICE_ID\",
        \"price_per_m3\": $PRICE_VALUE.0,
        \"wood_type_id\": \"$WOOD_TYPE_ID\"
    }"
    
    PRICE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/wood-type-prices" \
        -H "Content-Type: application/json" \
        -d "$PRICE_DATA")
    
    if echo "$PRICE_RESPONSE" | grep -q "\"created_at\""; then
        CREATED_AT=$(echo "$PRICE_RESPONSE" | grep -o '"created_at":"[^"]*"' | cut -d'"' -f4)
        echo "  ✅ Цена $i: $PRICE_VALUE ₽/м³"
        echo "     Время создания: $CREATED_AT"
        echo "     Время запроса:  $REQUEST_TIME"
        
        # Сохраняем для анализа
        echo "$i,$PRICE_VALUE,$CREATED_AT,$REQUEST_TIME" >> price_times.csv
    else
        echo "  ❌ Ошибка создания цены $i"
        echo "  Ответ: $PRICE_RESPONSE"
    fi
    
    # Задержка между созданием цен
    sleep 2
done

echo
echo "📝 Тест 3: Создание продавца"

SELLER_ID=$(generate_uuid)
KEYCLOAK_UUID=$(generate_uuid)
SELLER_REQUEST_TIME=$(get_current_time)

SELLER_DATA="{
    \"id\": \"$SELLER_ID\",
    \"keycloak_uuid\": \"$KEYCLOAK_UUID\",
    \"is_online\": true
}"

SELLER_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/sellers" \
    -H "Content-Type: application/json" \
    -d "$SELLER_DATA")

if echo "$SELLER_RESPONSE" | grep -q "\"created_at\""; then
    SELLER_CREATED_AT=$(echo "$SELLER_RESPONSE" | grep -o '"created_at":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Продавец создан: $SELLER_ID"
    echo "   Время создания: $SELLER_CREATED_AT"
    echo "   Время запроса:  $SELLER_REQUEST_TIME"
else
    echo "❌ Ошибка создания продавца"
    echo "Ответ: $SELLER_RESPONSE"
fi

echo
echo "📝 Тест 4: Создание покупателя"

BUYER_ID=$(generate_uuid)
BUYER_KEYCLOAK_UUID=$(generate_uuid)
BUYER_REQUEST_TIME=$(get_current_time)

BUYER_DATA="{
    \"id\": \"$BUYER_ID\",
    \"keycloak_uuid\": \"$BUYER_KEYCLOAK_UUID\",
    \"is_online\": true
}"

BUYER_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/buyers" \
    -H "Content-Type: application/json" \
    -d "$BUYER_DATA")

if echo "$BUYER_RESPONSE" | grep -q "\"created_at\""; then
    BUYER_CREATED_AT=$(echo "$BUYER_RESPONSE" | grep -o '"created_at":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Покупатель создан: $BUYER_ID"
    echo "   Время создания: $BUYER_CREATED_AT"
    echo "   Время запроса:  $BUYER_REQUEST_TIME"
else
    echo "❌ Ошибка создания покупателя"
    echo "Ответ: $BUYER_RESPONSE"
fi

echo
echo "📊 Анализ результатов:"

if [ -f price_times.csv ]; then
    echo "Анализ времени создания цен:"
    while IFS=',' read -r num price created_at request_time; do
        echo "  Цена $num ($price ₽/м³): $created_at"
    done < price_times.csv
    
    # Проверка, что времена разные
    UNIQUE_TIMES=$(cut -d',' -f3 price_times.csv | sort -u | wc -l)
    TOTAL_PRICES=$(wc -l < price_times.csv)
    
    if [ "$UNIQUE_TIMES" -eq "$TOTAL_PRICES" ]; then
        echo "✅ Все времена создания уникальны ($UNIQUE_TIMES/$TOTAL_PRICES)"
    else
        echo "⚠️ Найдены дублирующиеся времена ($UNIQUE_TIMES/$TOTAL_PRICES)"
    fi
    
    rm -f price_times.csv
fi

echo
echo "📋 Заключение:"
echo "Если все времена создания уникальны и близки к времени запроса,"
echo "то исправление datetime.now(UTC) -> lambda: datetime.now(UTC) работает корректно!"

echo
echo "🎯 Для проверки в интерфейсе:"
echo "1. Откройте seller frontend: http://localhost:3000"
echo "2. Перейдите в раздел 'Управление типами древесины'"
echo "3. Создайте несколько цен для одного типа древесины"
echo "4. Проверьте, что время обновления отображается корректно"
