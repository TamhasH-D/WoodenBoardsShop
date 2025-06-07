"""Система логирования результатов функциональных тестов."""

import os
import time
import json
import threading
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pathlib import Path
import glob


class TestLogger:
    """Логгер для записи результатов функциональных тестов."""
    
    def __init__(self, test_type: str = "all"):
        self.test_type = test_type
        self.start_time = datetime.now()
        self.logs_dir = Path("logs")
        self.logs_dir.mkdir(exist_ok=True)
        
        # Создание имени файла лога
        timestamp = self.start_time.strftime("%Y-%m-%d_%H-%M-%S")
        self.log_file = self.logs_dir / f"test_results_{timestamp}.log"
        
        # Статистика тестов
        self.test_stats = {
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "total": 0
        }
        
        # Список результатов тестов
        self.test_results: List[Dict[str, Any]] = []
        
        # Блокировка для потокобезопасности
        self._lock = threading.Lock()
        
        # Инициализация лог файла
        self._init_log_file()
        
        # Очистка старых логов
        self._cleanup_old_logs()
    
    def _init_log_file(self):
        """Инициализация лог файла с заголовком."""
        with open(self.log_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write(f"ФУНКЦИОНАЛЬНЫЕ ТЕСТЫ - DIPLOM PROJECT\n")
            f.write("=" * 80 + "\n")
            f.write(f"Дата и время начала: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Тип тестов: {self.test_type.upper()}\n")
            f.write(f"Файл лога: {self.log_file.name}\n")
            f.write("=" * 80 + "\n\n")
            f.write("ФОРМАТ: [TIMESTAMP] TEST_NAME | STATUS | DURATION | ERROR_MESSAGE\n\n")
    
    def log_test_start(self, test_name: str):
        """Логирование начала теста."""
        with self._lock:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            message = f"[{timestamp}] {test_name} | STARTED | - | Тест запущен\n"
            
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(message)
    
    def log_test_result(self, test_name: str, status: str, duration: float, 
                       error_message: Optional[str] = None):
        """Логирование результата теста."""
        with self._lock:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Обрезка сообщения об ошибке до 200 символов
            if error_message:
                error_message = error_message.replace('\n', ' ').replace('\r', '')
                if len(error_message) > 200:
                    error_message = error_message[:197] + "..."
            else:
                error_message = "-"
            
            # Форматирование длительности
            duration_str = f"{duration:.3f}s"
            
            # Создание записи лога
            message = f"[{timestamp}] {test_name} | {status} | {duration_str} | {error_message}\n"
            
            # Запись в файл
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(message)
            
            # Обновление статистики
            self.test_stats["total"] += 1
            if status == "PASSED":
                self.test_stats["passed"] += 1
            elif status == "FAILED":
                self.test_stats["failed"] += 1
            elif status == "SKIPPED":
                self.test_stats["skipped"] += 1
            
            # Сохранение результата теста
            self.test_results.append({
                "name": test_name,
                "status": status,
                "duration": duration,
                "error": error_message if error_message != "-" else None,
                "timestamp": timestamp
            })
    
    def log_section_start(self, section_name: str):
        """Логирование начала секции тестов."""
        with self._lock:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            message = f"\n[{timestamp}] ===== {section_name.upper()} =====\n"
            
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(message)
    
    def log_section_end(self, section_name: str, section_stats: Dict[str, int]):
        """Логирование окончания секции тестов."""
        with self._lock:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            message = (
                f"[{timestamp}] ===== {section_name.upper()} ЗАВЕРШЕНО =====\n"
                f"Пройдено: {section_stats.get('passed', 0)}, "
                f"Упало: {section_stats.get('failed', 0)}, "
                f"Пропущено: {section_stats.get('skipped', 0)}\n\n"
            )
            
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(message)
    
    def finalize_log(self):
        """Финализация лога с общей статистикой."""
        end_time = datetime.now()
        total_duration = end_time - self.start_time
        
        with self._lock:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write("\n" + "=" * 80 + "\n")
                f.write("ИТОГОВАЯ СТАТИСТИКА\n")
                f.write("=" * 80 + "\n")
                f.write(f"Время окончания: {end_time.strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Общее время выполнения: {self._format_duration(total_duration.total_seconds())}\n")
                f.write(f"Всего тестов: {self.test_stats['total']}\n")
                f.write(f"Пройдено: {self.test_stats['passed']}\n")
                f.write(f"Упало: {self.test_stats['failed']}\n")
                f.write(f"Пропущено: {self.test_stats['skipped']}\n")
                
                # Процент успешности
                if self.test_stats['total'] > 0:
                    success_rate = (self.test_stats['passed'] / self.test_stats['total']) * 100
                    f.write(f"Процент успешности: {success_rate:.1f}%\n")
                
                f.write("=" * 80 + "\n")
                
                # Детальная информация об упавших тестах
                failed_tests = [t for t in self.test_results if t['status'] == 'FAILED']
                if failed_tests:
                    f.write("\nУПАВШИЕ ТЕСТЫ:\n")
                    f.write("-" * 40 + "\n")
                    for test in failed_tests:
                        f.write(f"• {test['name']}\n")
                        if test['error']:
                            f.write(f"  Ошибка: {test['error']}\n")
                        f.write(f"  Длительность: {test['duration']:.3f}s\n\n")
    
    def _format_duration(self, seconds: float) -> str:
        """Форматирование длительности в читаемый вид."""
        if seconds < 60:
            return f"{seconds:.1f} секунд"
        elif seconds < 3600:
            minutes = int(seconds // 60)
            secs = seconds % 60
            return f"{minutes} мин {secs:.1f} сек"
        else:
            hours = int(seconds // 3600)
            minutes = int((seconds % 3600) // 60)
            secs = seconds % 60
            return f"{hours} ч {minutes} мин {secs:.1f} сек"
    
    def _cleanup_old_logs(self):
        """Очистка логов старше 30 дней."""
        try:
            cutoff_date = datetime.now() - timedelta(days=30)
            log_pattern = str(self.logs_dir / "test_results_*.log")
            
            for log_file in glob.glob(log_pattern):
                file_path = Path(log_file)
                file_time = datetime.fromtimestamp(file_path.stat().st_mtime)
                
                if file_time < cutoff_date:
                    file_path.unlink()
                    print(f"Удален старый лог: {file_path.name}")
        except Exception as e:
            print(f"Ошибка при очистке старых логов: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Получение текущей статистики."""
        return {
            "stats": self.test_stats.copy(),
            "start_time": self.start_time.isoformat(),
            "log_file": str(self.log_file),
            "test_type": self.test_type
        }
    
    def export_json_report(self) -> str:
        """Экспорт результатов в JSON формат."""
        json_file = self.log_file.with_suffix('.json')
        
        report_data = {
            "test_session": {
                "start_time": self.start_time.isoformat(),
                "end_time": datetime.now().isoformat(),
                "test_type": self.test_type,
                "log_file": str(self.log_file)
            },
            "statistics": self.test_stats,
            "test_results": self.test_results
        }
        
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        return str(json_file)


# Глобальный экземпляр логгера
_test_logger: Optional[TestLogger] = None


def get_test_logger() -> TestLogger:
    """Получение глобального экземпляра логгера."""
    global _test_logger
    if _test_logger is None:
        test_type = os.getenv("TEST_TYPE", "all")
        _test_logger = TestLogger(test_type)
    return _test_logger


def initialize_test_logger(test_type: str = "all") -> TestLogger:
    """Инициализация нового логгера."""
    global _test_logger
    _test_logger = TestLogger(test_type)
    return _test_logger


def finalize_test_logger():
    """Финализация логгера."""
    global _test_logger
    if _test_logger:
        _test_logger.finalize_log()
        json_report = _test_logger.export_json_report()
        print(f"Лог сохранен: {_test_logger.log_file}")
        print(f"JSON отчет: {json_report}")


class LogCapture:
    """Контекстный менеджер для захвата логов теста."""
    
    def __init__(self, test_name: str):
        self.test_name = test_name
        self.start_time = None
        self.logger = get_test_logger()
    
    def __enter__(self):
        self.start_time = time.time()
        self.logger.log_test_start(self.test_name)
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        duration = time.time() - self.start_time
        
        if exc_type is None:
            status = "PASSED"
            error_message = None
        else:
            status = "FAILED"
            error_message = str(exc_val) if exc_val else "Неизвестная ошибка"
        
        self.logger.log_test_result(self.test_name, status, duration, error_message)
