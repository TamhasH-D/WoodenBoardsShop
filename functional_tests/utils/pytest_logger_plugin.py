"""Pytest плагин для интеграции с системой логирования тестов."""

import os
import time
from typing import Dict, Any, Optional
import pytest
from _pytest.reports import TestReport
from _pytest.nodes import Item
from utils.test_logger import get_test_logger, initialize_test_logger, finalize_test_logger


class TestLoggerPlugin:
    """Pytest плагин для логирования результатов тестов."""
    
    def __init__(self):
        self.logger = None
        self.test_start_times: Dict[str, float] = {}
        self.current_section = None
        self.section_stats: Dict[str, int] = {"passed": 0, "failed": 0, "skipped": 0}
    
    def pytest_configure(self, config):
        """Конфигурация плагина при запуске pytest."""
        test_type = os.getenv("TEST_TYPE", "all")
        self.logger = initialize_test_logger(test_type)
        
        # Логирование начала сессии
        self.logger.log_section_start("PYTEST SESSION")
    
    def pytest_collection_modifyitems(self, config, items):
        """Модификация собранных тестов."""
        if self.logger:
            self.logger.log_test_result(
                "COLLECTION", 
                "PASSED", 
                0.0, 
                f"Собрано {len(items)} тестов"
            )
    
    def pytest_runtest_logstart(self, nodeid, location):
        """Логирование начала выполнения теста."""
        if self.logger:
            # Определение секции теста
            section = self._get_test_section(nodeid)
            if section != self.current_section:
                if self.current_section:
                    self.logger.log_section_end(self.current_section, self.section_stats)
                    self.section_stats = {"passed": 0, "failed": 0, "skipped": 0}
                
                self.current_section = section
                self.logger.log_section_start(section)
            
            # Запись времени начала теста
            self.test_start_times[nodeid] = time.time()
            
            # Логирование начала теста
            test_name = self._format_test_name(nodeid)
            self.logger.log_test_start(test_name)
    
    def pytest_runtest_logreport(self, report: TestReport):
        """Логирование отчета о выполнении теста."""
        if not self.logger or report.when != "call":
            return
        
        nodeid = report.nodeid
        test_name = self._format_test_name(nodeid)
        
        # Вычисление длительности
        start_time = self.test_start_times.get(nodeid, time.time())
        duration = time.time() - start_time
        
        # Определение статуса
        if report.passed:
            status = "PASSED"
            error_message = None
            self.section_stats["passed"] += 1
        elif report.failed:
            status = "FAILED"
            error_message = self._extract_error_message(report)
            self.section_stats["failed"] += 1
        elif report.skipped:
            status = "SKIPPED"
            error_message = self._extract_skip_reason(report)
            self.section_stats["skipped"] += 1
        else:
            status = "UNKNOWN"
            error_message = "Неизвестный статус теста"
        
        # Логирование результата
        self.logger.log_test_result(test_name, status, duration, error_message)
        
        # Очистка времени начала
        if nodeid in self.test_start_times:
            del self.test_start_times[nodeid]
    
    def pytest_sessionfinish(self, session, exitstatus):
        """Финализация сессии тестирования."""
        if self.logger:
            # Завершение последней секции
            if self.current_section:
                self.logger.log_section_end(self.current_section, self.section_stats)
            
            # Логирование завершения сессии
            exit_status_map = {
                0: "SUCCESS",
                1: "TESTS_FAILED", 
                2: "INTERRUPTED",
                3: "INTERNAL_ERROR",
                4: "USAGE_ERROR",
                5: "NO_TESTS_RAN"
            }
            
            status_name = exit_status_map.get(exitstatus, f"UNKNOWN({exitstatus})")
            self.logger.log_test_result(
                "PYTEST SESSION",
                "PASSED" if exitstatus == 0 else "FAILED",
                0.0,
                f"Сессия завершена со статусом: {status_name}"
            )
            
            # Финализация логгера
            finalize_test_logger()
    
    def _get_test_section(self, nodeid: str) -> str:
        """Определение секции теста по nodeid."""
        if "api_tests" in nodeid:
            return "API TESTS"
        elif "browser_tests" in nodeid:
            return "BROWSER TESTS"
        elif "integration_tests" in nodeid:
            return "INTEGRATION TESTS"
        else:
            return "OTHER TESTS"
    
    def _format_test_name(self, nodeid: str) -> str:
        """Форматирование имени теста."""
        # Извлечение имени файла и функции
        parts = nodeid.split("::")
        if len(parts) >= 2:
            file_path = parts[0]
            test_function = parts[-1]
            
            # Извлечение имени файла без пути
            file_name = file_path.split("/")[-1].replace(".py", "")
            
            # Форматирование имени теста
            return f"{file_name}::{test_function}"
        
        return nodeid
    
    def _extract_error_message(self, report: TestReport) -> Optional[str]:
        """Извлечение сообщения об ошибке из отчета."""
        if not report.longrepr:
            return None
        
        try:
            # Попытка извлечь краткое сообщение об ошибке
            if hasattr(report.longrepr, 'reprcrash'):
                crash_info = report.longrepr.reprcrash
                if crash_info and hasattr(crash_info, 'message'):
                    return crash_info.message
            
            # Альтернативный способ извлечения ошибки
            longrepr_str = str(report.longrepr)
            
            # Поиск строки с AssertionError или другими ошибками
            lines = longrepr_str.split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith('AssertionError:'):
                    return line
                elif line.startswith('E   '):
                    return line[4:]  # Убираем префикс "E   "
                elif 'Error:' in line and not line.startswith('>'):
                    return line
            
            # Если не найдено специфичное сообщение, берем последнюю непустую строку
            for line in reversed(lines):
                line = line.strip()
                if line and not line.startswith('=') and not line.startswith('-'):
                    return line
            
            return "Ошибка без детального описания"
            
        except Exception:
            return "Не удалось извлечь сообщение об ошибке"
    
    def _extract_skip_reason(self, report: TestReport) -> Optional[str]:
        """Извлечение причины пропуска теста."""
        if not report.longrepr:
            return "Тест пропущен"
        
        try:
            longrepr_str = str(report.longrepr)
            
            # Поиск причины пропуска
            if "SKIPPED" in longrepr_str:
                lines = longrepr_str.split('\n')
                for line in lines:
                    if "SKIPPED" in line and ":" in line:
                        reason = line.split(":", 1)[-1].strip()
                        return reason if reason else "Тест пропущен"
            
            return "Тест пропущен"
            
        except Exception:
            return "Тест пропущен"


# Функция для регистрации плагина
def pytest_configure(config):
    """Регистрация плагина в pytest."""
    if not hasattr(config, '_test_logger_plugin'):
        config._test_logger_plugin = TestLoggerPlugin()
        config.pluginmanager.register(config._test_logger_plugin, "test_logger_plugin")


def pytest_collection_modifyitems(config, items):
    """Передача вызова в плагин."""
    if hasattr(config, '_test_logger_plugin'):
        config._test_logger_plugin.pytest_collection_modifyitems(config, items)


def pytest_runtest_logstart(nodeid, location):
    """Передача вызова в плагин."""
    # Получаем конфигурацию из pytest
    import pytest
    config = pytest.current_config if hasattr(pytest, 'current_config') else None
    if config and hasattr(config, '_test_logger_plugin'):
        config._test_logger_plugin.pytest_runtest_logstart(nodeid, location)


def pytest_runtest_logreport(report):
    """Передача вызова в плагин."""
    import pytest
    config = pytest.current_config if hasattr(pytest, 'current_config') else None
    if config and hasattr(config, '_test_logger_plugin'):
        config._test_logger_plugin.pytest_runtest_logreport(report)


def pytest_sessionfinish(session, exitstatus):
    """Передача вызова в плагин."""
    if hasattr(session.config, '_test_logger_plugin'):
        session.config._test_logger_plugin.pytest_sessionfinish(session, exitstatus)
