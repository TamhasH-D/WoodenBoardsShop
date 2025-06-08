#!/usr/bin/env python3
"""
Тест для проверки исправления времени created_at в моделях
"""

import asyncio
import json
import time
from datetime import datetime, timezone
import aiohttp

# Конфигурация
TEST_API_URL = "http://localhost:8001"  # Тестовый backend
ENDPOINTS = {
    "wood_type_price": "/api/v1/wood-type-prices",
    "wood_type": "/api/v1/wood-types",
    "seller": "/api/v1/sellers",
    "buyer": "/api/v1/buyers",
    "product": "/api/v1/products",
    "chat_thread": "/api/v1/chat-threads",
    "chat_message": "/api/v1/chat-messages"
}

def generate_uuid():
    """Генерация UUID v4"""
    import uuid
    return str(uuid.uuid4())

async def test_datetime_creation():
    """Тест создания записей с проверкой времени"""
    print("🧪 Тестирование исправления времени created_at...")
    
    async with aiohttp.ClientSession() as session:
        results = []
        
        # Тест 1: Создание типа древесины
        print("\n📝 Тест 1: Создание типа древесины")
        wood_type_data = {
            "id": generate_uuid(),
            "neme": f"Тестовая древесина {int(time.time())}",
            "description": "Тестовое описание"
        }
        
        start_time = datetime.now(timezone.utc)
        
        try:
            async with session.post(f"{TEST_API_URL}{ENDPOINTS['wood_type']}", 
                                  json=wood_type_data) as response:
                if response.status == 201:
                    data = await response.json()
                    wood_type_id = data["data"]["id"]
                    print(f"  ✅ Тип древесины создан: {wood_type_id}")
                    
                    # Тест 2: Создание цены (несколько раз с интервалом)
                    print("\n📝 Тест 2: Создание цен на древесину")
                    prices = []
                    
                    for i in range(3):
                        price_data = {
                            "id": generate_uuid(),
                            "price_per_m3": 1000.0 + i * 100,
                            "wood_type_id": wood_type_id
                        }
                        
                        creation_time = datetime.now(timezone.utc)
                        
                        async with session.post(f"{TEST_API_URL}{ENDPOINTS['wood_type_price']}", 
                                              json=price_data) as price_response:
                            if price_response.status == 201:
                                price_result = await price_response.json()
                                created_at_str = price_result["data"]["created_at"]
                                created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                                
                                prices.append({
                                    "id": price_result["data"]["id"],
                                    "price": price_result["data"]["price_per_m3"],
                                    "created_at": created_at,
                                    "creation_time": creation_time
                                })
                                
                                print(f"  ✅ Цена {i+1}: {price_result['data']['price_per_m3']} ₽/м³")
                                print(f"     Время создания: {created_at}")
                                print(f"     Время запроса:  {creation_time}")
                                
                                # Проверка, что время создания близко к времени запроса
                                time_diff = abs((created_at - creation_time).total_seconds())
                                if time_diff < 5:  # Разница менее 5 секунд
                                    print(f"     ✅ Время корректное (разница: {time_diff:.2f}с)")
                                else:
                                    print(f"     ❌ Время некорректное (разница: {time_diff:.2f}с)")
                                
                                results.append({
                                    "test": f"wood_type_price_{i+1}",
                                    "success": time_diff < 5,
                                    "time_diff": time_diff,
                                    "created_at": created_at_str
                                })
                            else:
                                print(f"  ❌ Ошибка создания цены {i+1}: {price_response.status}")
                        
                        # Небольшая задержка между созданием цен
                        await asyncio.sleep(1)
                    
                    # Анализ результатов
                    print("\n📊 Анализ времени создания цен:")
                    if len(prices) >= 2:
                        for i in range(1, len(prices)):
                            prev_time = prices[i-1]["created_at"]
                            curr_time = prices[i]["created_at"]
                            diff = (curr_time - prev_time).total_seconds()
                            print(f"  Разница между ценой {i} и {i+1}: {diff:.2f}с")
                            
                            if diff > 0.5:  # Разница больше 0.5 секунды
                                print(f"    ✅ Время увеличивается корректно")
                            else:
                                print(f"    ⚠️ Малая разница во времени")
                    
                else:
                    print(f"  ❌ Ошибка создания типа древесины: {response.status}")
                    
        except Exception as e:
            print(f"  ❌ Ошибка: {e}")
        
        # Тест 3: Создание продавца
        print("\n📝 Тест 3: Создание продавца")
        seller_data = {
            "id": generate_uuid(),
            "keycloak_uuid": generate_uuid(),
            "is_online": True
        }
        
        seller_creation_time = datetime.now(timezone.utc)
        
        try:
            async with session.post(f"{TEST_API_URL}{ENDPOINTS['seller']}", 
                                  json=seller_data) as response:
                if response.status == 201:
                    data = await response.json()
                    created_at_str = data["data"]["created_at"]
                    created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                    
                    time_diff = abs((created_at - seller_creation_time).total_seconds())
                    print(f"  ✅ Продавец создан: {data['data']['id']}")
                    print(f"     Время создания: {created_at}")
                    print(f"     Время запроса:  {seller_creation_time}")
                    print(f"     Разница: {time_diff:.2f}с")
                    
                    results.append({
                        "test": "seller_creation",
                        "success": time_diff < 5,
                        "time_diff": time_diff,
                        "created_at": created_at_str
                    })
                else:
                    print(f"  ❌ Ошибка создания продавца: {response.status}")
        except Exception as e:
            print(f"  ❌ Ошибка: {e}")
        
        # Итоговый отчет
        print("\n📋 Итоговый отчет:")
        successful_tests = sum(1 for r in results if r["success"])
        total_tests = len(results)
        
        print(f"Успешных тестов: {successful_tests}/{total_tests}")
        
        if successful_tests == total_tests:
            print("🎉 ВСЕ ТЕСТЫ ПРОШЛИ! Время created_at работает корректно.")
        else:
            print("⚠️ Некоторые тесты не прошли. Проверьте исправления.")
        
        # Детальные результаты
        print("\nДетальные результаты:")
        for result in results:
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {result['test']}: {result['time_diff']:.2f}с")
        
        return results

async def main():
    """Главная функция"""
    print("🔧 Тест исправления времени created_at в моделях")
    print("=" * 60)
    
    # Проверка доступности API
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{TEST_API_URL}/health") as response:
                if response.status == 200:
                    print(f"✅ Тестовый API доступен: {TEST_API_URL}")
                else:
                    print(f"❌ Тестовый API недоступен: {response.status}")
                    return
    except Exception as e:
        print(f"❌ Не удается подключиться к API: {e}")
        return
    
    # Запуск тестов
    results = await test_datetime_creation()
    
    # Сохранение результатов
    with open("datetime_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2, default=str)
    
    print(f"\n💾 Результаты сохранены в datetime_test_results.json")

if __name__ == "__main__":
    asyncio.run(main())
