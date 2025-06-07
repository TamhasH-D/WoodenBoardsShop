#!/bin/bash

set -e

echo "🔄 Запуск функциональных тестов..."

# Запуск виртуального дисплея для Selenium
Xvfb :99 -screen 0 1920x1080x24 &
export DISPLAY=:99

# Ожидание готовности сервисов
echo "⏳ Ожидание готовности backend сервиса..."
python utils/wait_for_services.py

# Запуск тестов с различными опциями в зависимости от переменных окружения
if [ "$TEST_TYPE" = "api" ]; then
    echo "🧪 Запуск API тестов..."
    pytest api_tests/ -v --html=reports/api_tests_report.html --self-contained-html
elif [ "$TEST_TYPE" = "browser" ]; then
    echo "🌐 Запуск браузерных тестов..."
    pytest browser_tests/ -v --html=reports/browser_tests_report.html --self-contained-html
elif [ "$TEST_TYPE" = "integration" ]; then
    echo "🔗 Запуск интеграционных тестов..."
    pytest integration_tests/ -v --html=reports/integration_tests_report.html --self-contained-html
else
    echo "🚀 Запуск всех тестов..."
    pytest -v --html=reports/all_tests_report.html --self-contained-html --cov=. --cov-report=html:reports/coverage
fi

echo "✅ Тесты завершены!"
