#!/usr/bin/env python3
"""Пример использования системы логирования функциональных тестов."""

import asyncio
import time
from utils.test_logger import TestLogger, LogCapture, get_test_logger


def example_manual_logging():
    """Пример ручного логирования."""
    print("🔧 Пример ручного логирования")
    
    # Инициализация логгера
    logger = TestLogger("example")
    
    # Логирование начала секции
    logger.log_section_start("MANUAL LOGGING EXAMPLES")
    
    # Пример успешного теста
    logger.log_test_start("example_successful_test")
    time.sleep(0.5)  # Имитация выполнения теста
    logger.log_test_result("example_successful_test", "PASSED", 0.5)
    
    # Пример упавшего теста
    logger.log_test_start("example_failed_test")
    time.sleep(0.3)
    logger.log_test_result(
        "example_failed_test", 
        "FAILED", 
        0.3, 
        "AssertionError: Ожидалось значение 42, получено 24"
    )
    
    # Пример пропущенного теста
    logger.log_test_result(
        "example_skipped_test", 
        "SKIPPED", 
        0.0, 
        "Тест пропущен из-за отсутствия зависимости"
    )
    
    # Завершение секции
    section_stats = {"passed": 1, "failed": 1, "skipped": 1}
    logger.log_section_end("MANUAL LOGGING EXAMPLES", section_stats)
    
    # Финализация
    logger.finalize_log()
    
    print(f"✅ Лог сохранен: {logger.log_file}")
    print(f"📊 Статистика: {logger.get_stats()}")


def example_context_manager():
    """Пример использования контекстного менеджера."""
    print("\n🎯 Пример использования LogCapture")
    
    # Инициализация глобального логгера
    logger = get_test_logger()
    logger.log_section_start("CONTEXT MANAGER EXAMPLES")
    
    # Успешный тест с контекстным менеджером
    with LogCapture("context_successful_test"):
        print("Выполнение успешного теста...")
        time.sleep(0.2)
        # Тест завершается успешно (без исключений)
    
    # Упавший тест с контекстным менеджером
    try:
        with LogCapture("context_failed_test"):
            print("Выполнение упавшего теста...")
            time.sleep(0.1)
            raise ValueError("Тестовая ошибка для демонстрации")
    except ValueError:
        pass  # Ошибка уже залогирована в LogCapture
    
    # Завершение секции
    section_stats = {"passed": 1, "failed": 1, "skipped": 0}
    logger.log_section_end("CONTEXT MANAGER EXAMPLES", section_stats)
    
    print(f"✅ Контекстное логирование завершено")


async def example_async_logging():
    """Пример асинхронного логирования."""
    print("\n⚡ Пример асинхронного логирования")
    
    logger = get_test_logger()
    logger.log_section_start("ASYNC LOGGING EXAMPLES")
    
    # Имитация асинхронных тестов
    async_tests = [
        ("async_api_test", 0.3, True),
        ("async_database_test", 0.5, True),
        ("async_integration_test", 0.8, False),
        ("async_performance_test", 1.2, True),
    ]
    
    for test_name, duration, should_pass in async_tests:
        logger.log_test_start(test_name)
        
        # Имитация асинхронной работы
        await asyncio.sleep(duration)
        
        if should_pass:
            logger.log_test_result(test_name, "PASSED", duration)
        else:
            logger.log_test_result(
                test_name, 
                "FAILED", 
                duration, 
                "TimeoutError: Превышено время ожидания ответа от сервиса"
            )
    
    # Завершение секции
    section_stats = {"passed": 3, "failed": 1, "skipped": 0}
    logger.log_section_end("ASYNC LOGGING EXAMPLES", section_stats)
    
    print(f"✅ Асинхронное логирование завершено")


def example_error_handling():
    """Пример обработки различных типов ошибок."""
    print("\n🚨 Пример обработки ошибок")
    
    logger = get_test_logger()
    logger.log_section_start("ERROR HANDLING EXAMPLES")
    
    # Различные типы ошибок
    error_examples = [
        ("assertion_error_test", AssertionError("Ожидалось True, получено False")),
        ("value_error_test", ValueError("Недопустимое значение: -1")),
        ("type_error_test", TypeError("Ожидался str, получен int")),
        ("connection_error_test", ConnectionError("Не удалось подключиться к серверу")),
        ("timeout_error_test", TimeoutError("Превышено время ожидания (30s)")),
    ]
    
    for test_name, error in error_examples:
        logger.log_test_start(test_name)
        
        try:
            # Имитация теста
            time.sleep(0.1)
            raise error
        except Exception as e:
            logger.log_test_result(test_name, "FAILED", 0.1, str(e))
    
    # Пример очень длинного сообщения об ошибке
    long_error = "Очень длинное сообщение об ошибке: " + "А" * 300
    logger.log_test_start("long_error_test")
    logger.log_test_result("long_error_test", "FAILED", 0.05, long_error)
    
    # Пример с кириллицей
    cyrillic_error = "Ошибка с русскими символами: неправильный формат данных в поле 'название'"
    logger.log_test_start("cyrillic_error_test")
    logger.log_test_result("cyrillic_error_test", "FAILED", 0.02, cyrillic_error)
    
    # Завершение секции
    section_stats = {"passed": 0, "failed": 7, "skipped": 0}
    logger.log_section_end("ERROR HANDLING EXAMPLES", section_stats)
    
    print(f"✅ Обработка ошибок завершена")


def example_performance_logging():
    """Пример логирования производительности."""
    print("\n⏱️ Пример логирования производительности")
    
    logger = get_test_logger()
    logger.log_section_start("PERFORMANCE EXAMPLES")
    
    # Тесты с разной производительностью
    performance_tests = [
        ("fast_test", 0.01),
        ("medium_test", 0.5),
        ("slow_test", 2.0),
        ("very_slow_test", 5.0),
    ]
    
    for test_name, target_duration in performance_tests:
        logger.log_test_start(test_name)
        
        start_time = time.time()
        time.sleep(target_duration)
        actual_duration = time.time() - start_time
        
        # Проверка производительности
        if actual_duration <= target_duration * 1.1:  # 10% допуск
            logger.log_test_result(test_name, "PASSED", actual_duration)
        else:
            logger.log_test_result(
                test_name, 
                "FAILED", 
                actual_duration, 
                f"Тест выполнялся слишком долго: {actual_duration:.3f}s > {target_duration}s"
            )
    
    # Завершение секции
    section_stats = {"passed": 4, "failed": 0, "skipped": 0}
    logger.log_section_end("PERFORMANCE EXAMPLES", section_stats)
    
    print(f"✅ Тестирование производительности завершено")


def main():
    """Основная функция с примерами."""
    print("🚀 Демонстрация системы логирования функциональных тестов")
    print("=" * 60)
    
    # Примеры различных способов логирования
    example_manual_logging()
    example_context_manager()
    
    # Асинхронный пример
    asyncio.run(example_async_logging())
    
    # Примеры обработки ошибок и производительности
    example_error_handling()
    example_performance_logging()
    
    # Финализация глобального логгера
    from utils.test_logger import finalize_test_logger
    finalize_test_logger()
    
    print("\n" + "=" * 60)
    print("✅ Все примеры завершены!")
    print("\n📋 Проверьте созданные файлы в директории logs/:")
    print("   - test_results_*.log - текстовые логи")
    print("   - test_results_*.json - JSON отчеты")
    print("\n🔍 Для анализа используйте:")
    print("   python utils/log_analyzer.py --latest")
    print("   make logs-stats")


if __name__ == "__main__":
    main()
