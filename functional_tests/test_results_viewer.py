#!/usr/bin/env python3
"""
Test Results Viewer.
Простой скрипт для просмотра результатов comprehensive тестирования.
"""

import os
import sys
import glob
import json
from datetime import datetime
from pathlib import Path


def get_latest_test_results():
    """Получить результаты последнего тестирования."""
    logs_dir = Path("logs")
    
    if not logs_dir.exists():
        print("❌ Директория logs не найдена")
        return None
    
    # Найти последний comprehensive test лог
    log_files = list(logs_dir.glob("comprehensive_test_*.log"))
    if not log_files:
        print("❌ Comprehensive test логи не найдены")
        return None
    
    latest_log = max(log_files, key=os.path.getctime)
    
    # Извлечь timestamp из имени файла
    timestamp = latest_log.stem.replace("comprehensive_test_", "")
    
    return {
        "timestamp": timestamp,
        "log_file": latest_log,
        "unit_report": Path(f"reports/unit_tests_{timestamp}.html"),
        "functional_report": Path(f"reports/functional_tests_{timestamp}.html"),
        "unit_xml": Path(f"reports/unit_tests_{timestamp}.xml"),
        "functional_xml": Path(f"reports/functional_tests_{timestamp}.xml")
    }


def parse_log_file(log_file):
    """Парсинг лог файла для извлечения результатов."""
    if not log_file.exists():
        return None
    
    results = {
        "unit_status": "UNKNOWN",
        "functional_status": "UNKNOWN",
        "overall_status": "UNKNOWN",
        "summary": []
    }
    
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Поиск статусов тестов
        if "Unit Tests: PASSED" in content:
            results["unit_status"] = "PASSED"
        elif "Unit Tests: FAILED" in content:
            results["unit_status"] = "FAILED"
        
        if "Functional Tests: PASSED" in content:
            results["functional_status"] = "PASSED"
        elif "Functional Tests: FAILED" in content:
            results["functional_status"] = "FAILED"
        
        # Определение общего статуса
        if results["unit_status"] == "PASSED" and results["functional_status"] == "PASSED":
            results["overall_status"] = "ALL PASSED"
        elif results["unit_status"] == "PASSED" or results["functional_status"] == "PASSED":
            results["overall_status"] = "PARTIAL SUCCESS"
        else:
            results["overall_status"] = "ALL FAILED"
        
        # Извлечение сводки
        lines = content.split('\n')
        in_final_results = False
        for line in lines:
            if "FINAL TEST RESULTS" in line:
                in_final_results = True
                continue
            if in_final_results and line.strip():
                results["summary"].append(line.strip())
                if len(results["summary"]) >= 10:  # Ограничиваем количество строк
                    break
    
    except Exception as e:
        print(f"❌ Ошибка при парсинге лог файла: {e}")
    
    return results


def parse_xml_report(xml_file):
    """Парсинг XML отчета для получения статистики."""
    if not xml_file.exists():
        return None
    
    try:
        import xml.etree.ElementTree as ET
        tree = ET.parse(xml_file)
        root = tree.getroot()
        
        # Поиск элемента testsuite
        testsuite = root.find('testsuite') if root.tag != 'testsuite' else root
        
        if testsuite is not None:
            return {
                "tests": int(testsuite.get('tests', 0)),
                "failures": int(testsuite.get('failures', 0)),
                "errors": int(testsuite.get('errors', 0)),
                "skipped": int(testsuite.get('skipped', 0)),
                "time": float(testsuite.get('time', 0))
            }
    except Exception as e:
        print(f"⚠️ Не удалось парсить XML отчет {xml_file}: {e}")
    
    return None


def display_results():
    """Отображение результатов тестирования."""
    print("🎯 COMPREHENSIVE TEST RESULTS VIEWER")
    print("=" * 50)
    
    results = get_latest_test_results()
    if not results:
        return
    
    print(f"📅 Timestamp: {results['timestamp']}")
    print(f"📋 Log file: {results['log_file']}")
    print()
    
    # Парсинг лог файла
    log_results = parse_log_file(results['log_file'])
    if log_results:
        print("📊 OVERALL STATUS:")
        status = log_results['overall_status']
        if status == "ALL PASSED":
            print(f"✅ {status}")
        elif status == "PARTIAL SUCCESS":
            print(f"⚠️ {status}")
        else:
            print(f"❌ {status}")
        print()
        
        print("📋 DETAILED RESULTS:")
        print(f"  Unit Tests: {get_status_emoji(log_results['unit_status'])} {log_results['unit_status']}")
        print(f"  Functional Tests: {get_status_emoji(log_results['functional_status'])} {log_results['functional_status']}")
        print()
    
    # Статистика из XML отчетов
    print("📈 STATISTICS:")
    
    unit_stats = parse_xml_report(results['unit_xml'])
    if unit_stats:
        passed = unit_stats['tests'] - unit_stats['failures'] - unit_stats['errors']
        print(f"  Unit Tests: {passed}/{unit_stats['tests']} passed "
              f"({unit_stats['failures']} failed, {unit_stats['errors']} errors, "
              f"{unit_stats['skipped']} skipped) in {unit_stats['time']:.2f}s")
    
    functional_stats = parse_xml_report(results['functional_xml'])
    if functional_stats:
        passed = functional_stats['tests'] - functional_stats['failures'] - functional_stats['errors']
        print(f"  Functional Tests: {passed}/{functional_stats['tests']} passed "
              f"({functional_stats['failures']} failed, {functional_stats['errors']} errors, "
              f"{functional_stats['skipped']} skipped) in {functional_stats['time']:.2f}s")
    
    print()
    
    # Доступные отчеты
    print("📊 AVAILABLE REPORTS:")
    if results['unit_report'].exists():
        print(f"  ✅ Unit Tests HTML: {results['unit_report']}")
    else:
        print(f"  ❌ Unit Tests HTML: Not found")
    
    if results['functional_report'].exists():
        print(f"  ✅ Functional Tests HTML: {results['functional_report']}")
    else:
        print(f"  ❌ Functional Tests HTML: Not found")
    
    print()
    
    # Скриншоты
    screenshots_dir = Path("screenshots")
    if screenshots_dir.exists():
        screenshots = list(screenshots_dir.glob("*.png"))
        if screenshots:
            print(f"📸 SCREENSHOTS: {len(screenshots)} files in screenshots/")
        else:
            print("📸 SCREENSHOTS: No screenshots found")
    else:
        print("📸 SCREENSHOTS: Directory not found")
    
    print()
    print("🔧 QUICK COMMANDS:")
    print("  make test-status     - Показать статус")
    print("  make test-results    - Показать результаты")
    print("  make test-summary    - Краткая сводка")
    print("  make test-open-reports - Открыть отчеты в браузере")


def get_status_emoji(status):
    """Получить эмодзи для статуса."""
    if status == "PASSED":
        return "✅"
    elif status == "FAILED":
        return "❌"
    else:
        return "❓"


def main():
    """Главная функция."""
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "--help" or command == "-h":
            print("Test Results Viewer")
            print("Usage: python test_results_viewer.py [--help]")
            print("Shows comprehensive test results from the latest test run")
            return
    
    display_results()


if __name__ == "__main__":
    main()
