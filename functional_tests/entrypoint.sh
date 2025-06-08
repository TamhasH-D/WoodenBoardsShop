#!/bin/bash

set -e

echo "🔄 Запуск функциональных тестов..."

# Запуск виртуального дисплея для Selenium (только если нужен)
if [ "$TEST_TYPE" != "api" ]; then
    echo "🖥️ Запуск виртуального дисплея для браузерных тестов..."
    Xvfb :99 -screen 0 1920x1080x24 &
    export DISPLAY=:99
fi

# Ожидание готовности сервисов
echo "⏳ Ожидание готовности сервисов..."
if [ "$TEST_TYPE" = "api" ]; then
    echo "🔧 API тесты - ожидание только backend..."
    TEST_TYPE=api INCLUDE_FRONTENDS=false python utils/wait_for_services.py
else
    echo "🌐 Полные тесты - ожидание всех сервисов..."
    python utils/wait_for_services.py
fi

# Запуск тестов с различными опциями в зависимости от переменных окружения
if [ "$TEST_TYPE" = "api" ]; then
    echo "🧪 Запуск API тестов..."
    pytest api_tests/ -v \
        --html=reports/api_tests_report.html --self-contained-html \
        --junitxml=reports/api_tests_report.xml \
        -p utils.pytest_logger_plugin
elif [ "$TEST_TYPE" = "browser" ]; then
    echo "🌐 Запуск браузерных тестов..."
    pytest browser_tests/ -v \
        --html=reports/browser_tests_report.html --self-contained-html \
        --junitxml=reports/browser_tests_report.xml \
        -p utils.pytest_logger_plugin
elif [ "$TEST_TYPE" = "integration" ]; then
    echo "🔗 Запуск интеграционных тестов..."
    pytest integration_tests/ -v \
        --html=reports/integration_tests_report.html --self-contained-html \
        --junitxml=reports/integration_tests_report.xml \
        -p utils.pytest_logger_plugin
else
    echo "🚀 Запуск всех тестов..."
    pytest -v \
        --html=reports/all_tests_report.html --self-contained-html \
        --junitxml=reports/all_tests_report.xml \
        --cov=. --cov-report=html:reports/coverage --cov-report=xml:reports/coverage.xml \
        -p utils.pytest_logger_plugin
fi

# Вывод информации о созданных логах
echo ""
echo "📋 Информация о логах:"
if [ -d "/app/logs" ] && [ "$(ls -A /app/logs)" ]; then
    echo "Созданные лог файлы:"
    ls -la /app/logs/

    # Показать последний лог
    LATEST_LOG=$(ls -t /app/logs/test_results_*.log 2>/dev/null | head -1)
    if [ -n "$LATEST_LOG" ]; then
        echo ""
        echo "📄 Последние строки лога ($LATEST_LOG):"
        tail -20 "$LATEST_LOG"
    fi
else
    echo "Лог файлы не найдены"
fi

echo "✅ Тесты завершены!"
