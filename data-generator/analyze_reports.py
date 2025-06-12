#!/usr/bin/env python3
"""
Анализатор отчетов генерации данных
"""

import json
import glob
from datetime import datetime
from pathlib import Path

def load_reports():
    """Загружает все отчеты генерации"""
    report_files = glob.glob('generation_report_*.json')
    reports = []
    
    for file_path in report_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                report = json.load(f)
                report['file'] = file_path
                reports.append(report)
        except Exception as e:
            print(f"⚠️ Ошибка чтения {file_path}: {e}")
    
    # Сортируем по времени
    reports.sort(key=lambda x: x.get('timestamp', ''))
    return reports

def analyze_performance(reports):
    """Анализирует производительность генерации"""
    if not reports:
        print("📊 Нет отчетов для анализа")
        return
    
    print("📈 Анализ производительности генерации")
    print("=" * 60)
    
    # Заголовок таблицы
    print(f"{'Дата':<12} {'Профиль':<10} {'Записей':<8} {'Время':<8} {'Запросы':<8} {'Ошибки':<7} {'Успех%':<7}")
    print("-" * 60)
    
    total_records = 0
    total_time = 0
    total_requests = 0
    total_errors = 0
    
    for report in reports:
        # Парсим дату
        try:
            timestamp = datetime.fromisoformat(report['timestamp'].replace('Z', '+00:00'))
            date_str = timestamp.strftime('%d.%m.%Y')
        except:
            date_str = 'Unknown'
        
        # Подсчитываем записи
        actual_counts = report.get('actual_counts', {})
        records = sum(count for count in actual_counts.values() if isinstance(count, int))
        
        # Получаем статистику
        stats = report.get('stats', {})
        
        # Время выполнения
        start_time = stats.get('start_time')
        end_time = stats.get('end_time')
        duration = 'N/A'
        
        if start_time and end_time:
            try:
                start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                duration_seconds = (end - start).total_seconds()
                duration = f"{duration_seconds/60:.1f}м"
                total_time += duration_seconds
            except:
                pass
        
        # Запросы и ошибки
        requests = stats.get('total_requests', 0)
        errors = stats.get('failed_requests', 0)
        success_rate = ((requests - errors) / requests * 100) if requests > 0 else 0
        
        # Профиль
        profile = report.get('profile', 'unknown')
        
        print(f"{date_str:<12} {profile:<10} {records:<8,} {duration:<8} {requests:<8} {errors:<7} {success_rate:<6.1f}%")
        
        total_records += records
        total_requests += requests
        total_errors += errors
    
    print("-" * 60)
    
    # Итоговая статистика
    avg_success_rate = ((total_requests - total_errors) / total_requests * 100) if total_requests > 0 else 0
    avg_time = total_time / len(reports) / 60 if reports else 0
    
    print(f"{'ИТОГО':<12} {'':<10} {total_records:<8,} {avg_time:<7.1f}м {total_requests:<8} {total_errors:<7} {avg_success_rate:<6.1f}%")

def analyze_trends(reports):
    """Анализирует тренды производительности"""
    if len(reports) < 2:
        return
    
    print(f"\n📊 Тренды производительности:")
    
    # Сравниваем последние два отчета
    latest = reports[-1]
    previous = reports[-2]
    
    latest_stats = latest.get('stats', {})
    previous_stats = previous.get('stats', {})
    
    # Сравнение времени выполнения
    latest_time = latest_stats.get('start_time'), latest_stats.get('end_time')
    previous_time = previous_stats.get('start_time'), previous_stats.get('end_time')
    
    if all(latest_time) and all(previous_time):
        try:
            latest_duration = (datetime.fromisoformat(latest_time[1].replace('Z', '+00:00')) - 
                             datetime.fromisoformat(latest_time[0].replace('Z', '+00:00'))).total_seconds()
            previous_duration = (datetime.fromisoformat(previous_time[1].replace('Z', '+00:00')) - 
                               datetime.fromisoformat(previous_time[0].replace('Z', '+00:00'))).total_seconds()
            
            time_change = ((latest_duration - previous_duration) / previous_duration * 100)
            time_icon = "📈" if time_change > 0 else "📉" if time_change < 0 else "➡️"
            print(f"  {time_icon} Время выполнения: {time_change:+.1f}%")
        except:
            pass
    
    # Сравнение успешности
    latest_success = ((latest_stats.get('total_requests', 0) - latest_stats.get('failed_requests', 0)) / 
                     latest_stats.get('total_requests', 1) * 100)
    previous_success = ((previous_stats.get('total_requests', 0) - previous_stats.get('failed_requests', 0)) / 
                       previous_stats.get('total_requests', 1) * 100)
    
    success_change = latest_success - previous_success
    success_icon = "📈" if success_change > 0 else "📉" if success_change < 0 else "➡️"
    print(f"  {success_icon} Успешность запросов: {success_change:+.1f}%")

def show_profile_statistics(reports):
    """Показывает статистику по профилям"""
    if not reports:
        return
    
    print(f"\n📋 Статистика по профилям:")
    
    profile_stats = {}
    
    for report in reports:
        profile = report.get('profile', 'unknown')
        if profile not in profile_stats:
            profile_stats[profile] = {
                'count': 0,
                'total_records': 0,
                'total_time': 0,
                'total_requests': 0,
                'total_errors': 0
            }
        
        stats = report.get('stats', {})
        actual_counts = report.get('actual_counts', {})
        
        profile_stats[profile]['count'] += 1
        profile_stats[profile]['total_records'] += sum(count for count in actual_counts.values() if isinstance(count, int))
        profile_stats[profile]['total_requests'] += stats.get('total_requests', 0)
        profile_stats[profile]['total_errors'] += stats.get('failed_requests', 0)
        
        # Время
        start_time = stats.get('start_time')
        end_time = stats.get('end_time')
        if start_time and end_time:
            try:
                start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
                end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
                duration = (end - start).total_seconds()
                profile_stats[profile]['total_time'] += duration
            except:
                pass
    
    print(f"{'Профиль':<12} {'Запусков':<9} {'Ср.записей':<10} {'Ср.время':<9} {'Успех%':<7}")
    print("-" * 50)
    
    for profile, stats in profile_stats.items():
        avg_records = stats['total_records'] // stats['count'] if stats['count'] > 0 else 0
        avg_time = stats['total_time'] / stats['count'] / 60 if stats['count'] > 0 else 0
        success_rate = ((stats['total_requests'] - stats['total_errors']) / 
                       stats['total_requests'] * 100) if stats['total_requests'] > 0 else 0
        
        print(f"{profile:<12} {stats['count']:<9} {avg_records:<10,} {avg_time:<8.1f}м {success_rate:<6.1f}%")

def main():
    """Основная функция анализа"""
    print("📊 Анализ отчетов генерации данных")
    print("=" * 50)
    
    reports = load_reports()
    
    if not reports:
        print("❌ Отчеты не найдены")
        print("💡 Запустите генерацию данных для создания отчетов")
        return
    
    print(f"📁 Найдено {len(reports)} отчетов")
    
    analyze_performance(reports)
    analyze_trends(reports)
    show_profile_statistics(reports)
    
    print(f"\n💡 Советы по оптимизации:")
    print(f"  - Используйте профиль 'small' для быстрого тестирования")
    print(f"  - Проверьте стабильность сети при высоком проценте ошибок")
    print(f"  - Увеличьте REQUEST_TIMEOUT при медленном API")

if __name__ == "__main__":
    main()
