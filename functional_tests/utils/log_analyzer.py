#!/usr/bin/env python3
"""Утилита для анализа логов функциональных тестов."""

import os
import json
import glob
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any, Optional
import re


class LogAnalyzer:
    """Анализатор логов функциональных тестов."""
    
    def __init__(self, logs_dir: str = "logs"):
        self.logs_dir = Path(logs_dir)
        if not self.logs_dir.exists():
            raise FileNotFoundError(f"Директория логов не найдена: {logs_dir}")
    
    def get_latest_log(self) -> Optional[Path]:
        """Получение последнего лог файла."""
        log_files = list(self.logs_dir.glob("test_results_*.log"))
        if not log_files:
            return None
        return max(log_files, key=lambda f: f.stat().st_mtime)
    
    def get_latest_json(self) -> Optional[Path]:
        """Получение последнего JSON отчета."""
        json_files = list(self.logs_dir.glob("test_results_*.json"))
        if not json_files:
            return None
        return max(json_files, key=lambda f: f.stat().st_mtime)
    
    def parse_log_file(self, log_file: Path) -> Dict[str, Any]:
        """Парсинг лог файла."""
        if not log_file.exists():
            raise FileNotFoundError(f"Лог файл не найден: {log_file}")
        
        results = {
            "file_path": str(log_file),
            "file_size": log_file.stat().st_size,
            "modified_time": datetime.fromtimestamp(log_file.stat().st_mtime),
            "tests": [],
            "statistics": {"passed": 0, "failed": 0, "skipped": 0, "total": 0},
            "sections": [],
            "errors": [],
            "duration": None,
            "test_type": "unknown"
        }
        
        with open(log_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Извлечение типа тестов
        type_match = re.search(r'Тип тестов: (\w+)', content)
        if type_match:
            results["test_type"] = type_match.group(1).lower()
        
        # Парсинг строк тестов
        test_pattern = r'\[([^\]]+)\] ([^|]+) \| (\w+) \| ([^|]+) \| (.+)'
        for match in re.finditer(test_pattern, content):
            timestamp_str, test_name, status, duration_str, error_msg = match.groups()
            
            try:
                timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                timestamp = None
            
            # Парсинг длительности
            duration = 0.0
            if duration_str.strip() != "-":
                duration_match = re.search(r'([\d.]+)s', duration_str)
                if duration_match:
                    duration = float(duration_match.group(1))
            
            test_info = {
                "timestamp": timestamp,
                "name": test_name.strip(),
                "status": status,
                "duration": duration,
                "error": error_msg.strip() if error_msg.strip() != "-" else None
            }
            
            results["tests"].append(test_info)
            
            # Обновление статистики
            if status in results["statistics"]:
                results["statistics"][status.lower()] += 1
            results["statistics"]["total"] += 1
        
        # Извлечение секций
        section_pattern = r'\[([^\]]+)\] ===== ([^=]+) ====='
        for match in re.finditer(section_pattern, content):
            timestamp_str, section_name = match.groups()
            try:
                timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                timestamp = None
            
            results["sections"].append({
                "timestamp": timestamp,
                "name": section_name.strip()
            })
        
        # Извлечение общей длительности
        duration_match = re.search(r'Общее время выполнения: (.+)', content)
        if duration_match:
            results["duration"] = duration_match.group(1).strip()
        
        # Извлечение ошибок
        failed_tests = [t for t in results["tests"] if t["status"] == "FAILED" and t["error"]]
        results["errors"] = failed_tests
        
        return results
    
    def load_json_report(self, json_file: Path) -> Dict[str, Any]:
        """Загрузка JSON отчета."""
        if not json_file.exists():
            raise FileNotFoundError(f"JSON файл не найден: {json_file}")
        
        with open(json_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def get_summary_stats(self, days: int = 7) -> Dict[str, Any]:
        """Получение сводной статистики за период."""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        summary = {
            "period_days": days,
            "total_runs": 0,
            "total_tests": 0,
            "total_passed": 0,
            "total_failed": 0,
            "total_skipped": 0,
            "test_types": {},
            "daily_stats": {},
            "most_failed_tests": {},
            "average_duration": 0.0
        }
        
        log_files = list(self.logs_dir.glob("test_results_*.log"))
        durations = []
        
        for log_file in log_files:
            file_time = datetime.fromtimestamp(log_file.stat().st_mtime)
            if file_time < cutoff_date:
                continue
            
            try:
                log_data = self.parse_log_file(log_file)
                summary["total_runs"] += 1
                
                stats = log_data["statistics"]
                summary["total_tests"] += stats["total"]
                summary["total_passed"] += stats["passed"]
                summary["total_failed"] += stats["failed"]
                summary["total_skipped"] += stats["skipped"]
                
                # Статистика по типам тестов
                test_type = log_data["test_type"]
                if test_type not in summary["test_types"]:
                    summary["test_types"][test_type] = {"runs": 0, "tests": 0, "passed": 0, "failed": 0}
                
                summary["test_types"][test_type]["runs"] += 1
                summary["test_types"][test_type]["tests"] += stats["total"]
                summary["test_types"][test_type]["passed"] += stats["passed"]
                summary["test_types"][test_type]["failed"] += stats["failed"]
                
                # Ежедневная статистика
                date_key = file_time.strftime("%Y-%m-%d")
                if date_key not in summary["daily_stats"]:
                    summary["daily_stats"][date_key] = {"runs": 0, "tests": 0, "passed": 0, "failed": 0}
                
                summary["daily_stats"][date_key]["runs"] += 1
                summary["daily_stats"][date_key]["tests"] += stats["total"]
                summary["daily_stats"][date_key]["passed"] += stats["passed"]
                summary["daily_stats"][date_key]["failed"] += stats["failed"]
                
                # Сбор информации о падающих тестах
                for test in log_data["errors"]:
                    test_name = test["name"]
                    if test_name not in summary["most_failed_tests"]:
                        summary["most_failed_tests"][test_name] = 0
                    summary["most_failed_tests"][test_name] += 1
                
                # Сбор длительности (если есть)
                if log_data.get("duration"):
                    # Попытка извлечь числовое значение из строки длительности
                    duration_str = log_data["duration"]
                    if "секунд" in duration_str:
                        try:
                            duration_val = float(duration_str.split()[0])
                            durations.append(duration_val)
                        except (ValueError, IndexError):
                            pass
                
            except Exception as e:
                print(f"Ошибка при обработке файла {log_file}: {e}")
                continue
        
        # Вычисление средней длительности
        if durations:
            summary["average_duration"] = sum(durations) / len(durations)
        
        # Сортировка наиболее падающих тестов
        summary["most_failed_tests"] = dict(
            sorted(summary["most_failed_tests"].items(), key=lambda x: x[1], reverse=True)
        )
        
        return summary
    
    def print_latest_stats(self):
        """Вывод статистики последнего запуска."""
        json_file = self.get_latest_json()
        if json_file:
            data = self.load_json_report(json_file)
            self._print_json_stats(data)
        else:
            log_file = self.get_latest_log()
            if log_file:
                data = self.parse_log_file(log_file)
                self._print_log_stats(data)
            else:
                print("❌ Логи не найдены")
    
    def _print_json_stats(self, data: Dict[str, Any]):
        """Вывод статистики из JSON отчета."""
        session = data["test_session"]
        stats = data["statistics"]
        
        print(f"📊 Статистика тестирования")
        print(f"{'='*50}")
        print(f"Тип тестов: {session['test_type'].upper()}")
        print(f"Время начала: {session['start_time']}")
        print(f"Время окончания: {session['end_time']}")
        print(f"Лог файл: {session['log_file']}")
        print()
        print(f"📈 Результаты:")
        print(f"  Всего тестов: {stats['total']}")
        print(f"  ✅ Пройдено: {stats['passed']}")
        print(f"  ❌ Упало: {stats['failed']}")
        print(f"  ⏭️ Пропущено: {stats['skipped']}")
        
        if stats['total'] > 0:
            success_rate = (stats['passed'] / stats['total']) * 100
            print(f"  📊 Успешность: {success_rate:.1f}%")
        
        # Показать упавшие тесты
        failed_tests = [t for t in data["test_results"] if t["status"] == "FAILED"]
        if failed_tests:
            print(f"\n❌ Упавшие тесты ({len(failed_tests)}):")
            for test in failed_tests[:5]:  # Показать первые 5
                print(f"  • {test['name']}")
                if test.get('error'):
                    error_short = test['error'][:100] + "..." if len(test['error']) > 100 else test['error']
                    print(f"    {error_short}")
    
    def _print_log_stats(self, data: Dict[str, Any]):
        """Вывод статистики из лог файла."""
        stats = data["statistics"]
        
        print(f"📊 Статистика тестирования")
        print(f"{'='*50}")
        print(f"Тип тестов: {data['test_type'].upper()}")
        print(f"Файл: {data['file_path']}")
        print(f"Размер: {data['file_size']} байт")
        print(f"Изменен: {data['modified_time']}")
        print()
        print(f"📈 Результаты:")
        print(f"  Всего тестов: {stats['total']}")
        print(f"  ✅ Пройдено: {stats['passed']}")
        print(f"  ❌ Упало: {stats['failed']}")
        print(f"  ⏭️ Пропущено: {stats['skipped']}")
        
        if stats['total'] > 0:
            success_rate = (stats['passed'] / stats['total']) * 100
            print(f"  📊 Успешность: {success_rate:.1f}%")
        
        if data['duration']:
            print(f"  ⏱️ Длительность: {data['duration']}")
        
        # Показать упавшие тесты
        if data['errors']:
            print(f"\n❌ Упавшие тесты ({len(data['errors'])}):")
            for test in data['errors'][:5]:  # Показать первые 5
                print(f"  • {test['name']}")
                if test.get('error'):
                    error_short = test['error'][:100] + "..." if len(test['error']) > 100 else test['error']
                    print(f"    {error_short}")


def main():
    """Основная функция CLI."""
    parser = argparse.ArgumentParser(description="Анализатор логов функциональных тестов")
    parser.add_argument("--logs-dir", default="logs", help="Директория с логами")
    parser.add_argument("--latest", action="store_true", help="Показать статистику последнего запуска")
    parser.add_argument("--summary", type=int, metavar="DAYS", help="Сводная статистика за N дней")
    parser.add_argument("--list", action="store_true", help="Список всех логов")
    
    args = parser.parse_args()
    
    try:
        analyzer = LogAnalyzer(args.logs_dir)
        
        if args.latest:
            analyzer.print_latest_stats()
        elif args.summary:
            summary = analyzer.get_summary_stats(args.summary)
            print(f"📊 Сводная статистика за {args.summary} дней")
            print(f"{'='*50}")
            print(f"Всего запусков: {summary['total_runs']}")
            print(f"Всего тестов: {summary['total_tests']}")
            print(f"Пройдено: {summary['total_passed']}")
            print(f"Упало: {summary['total_failed']}")
            print(f"Пропущено: {summary['total_skipped']}")
            
            if summary['total_tests'] > 0:
                success_rate = (summary['total_passed'] / summary['total_tests']) * 100
                print(f"Общая успешность: {success_rate:.1f}%")
            
            if summary['most_failed_tests']:
                print(f"\n❌ Наиболее падающие тесты:")
                for test_name, count in list(summary['most_failed_tests'].items())[:5]:
                    print(f"  • {test_name}: {count} раз")
        elif args.list:
            log_files = list(analyzer.logs_dir.glob("test_results_*"))
            if log_files:
                print(f"📋 Найдено {len(log_files)} файлов логов:")
                for log_file in sorted(log_files, key=lambda f: f.stat().st_mtime, reverse=True):
                    size = log_file.stat().st_size
                    mtime = datetime.fromtimestamp(log_file.stat().st_mtime)
                    print(f"  {log_file.name} ({size} байт, {mtime.strftime('%Y-%m-%d %H:%M:%S')})")
            else:
                print("❌ Логи не найдены")
        else:
            analyzer.print_latest_stats()
    
    except FileNotFoundError as e:
        print(f"❌ Ошибка: {e}")
    except Exception as e:
        print(f"❌ Неожиданная ошибка: {e}")


if __name__ == "__main__":
    main()
