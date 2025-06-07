"""Простые функциональные тесты для Health API."""

import pytest
import httpx
import asyncio


@pytest.mark.asyncio
async def test_health_endpoint():
    """Простой тест health endpoint."""
    backend_url = "http://test-backend:8000"

    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        response = await client.get(f"{backend_url}/api/v1/health/")

        # Проверяем статус код
        assert response.status_code == 200, f"Ожидался статус 200, получен {response.status_code}"

        # Проверяем Content-Type
        assert "application/json" in response.headers.get("content-type", ""), "Ответ должен быть JSON"

        # Проверяем, что ответ валидный JSON
        data = response.json()
        assert data is not None, "Ответ не должен быть None"

        print(f"✅ Health endpoint работает: {data}")


@pytest.mark.asyncio
async def test_health_response_time():
    """Тест времени ответа health endpoint."""
    backend_url = "http://test-backend:8000"
    
    import time
    
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        start_time = time.time()
        response = await client.get(f"{backend_url}/api/v1/health/")
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Health check должен отвечать быстро (менее 2 секунд)
        assert response_time < 2.0, f"Health endpoint слишком медленный: {response_time:.2f}s"
        assert response.status_code == 200
        
        print(f"✅ Health endpoint отвечает за {response_time:.3f}s")


@pytest.mark.asyncio
async def test_health_multiple_calls():
    """Тест множественных вызовов health endpoint."""
    backend_url = "http://test-backend:8000"
    
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        responses = []
        
        # Делаем 3 вызова подряд
        for i in range(3):
            response = await client.get(f"{backend_url}/api/v1/health/")
            responses.append(response)
        
        # Проверяем, что все вызовы успешны
        for i, response in enumerate(responses):
            assert response.status_code == 200, f"Вызов {i+1} неуспешен: {response.status_code}"
            data = response.json()
            assert data is not None, f"Вызов {i+1}: ответ не должен быть None"
        
        print(f"✅ Все {len(responses)} вызовов health endpoint успешны")


def test_health_sync():
    """Синхронный тест health endpoint."""
    import requests

    backend_url = "http://test-backend:8000"

    response = requests.get(f"{backend_url}/api/v1/health/", timeout=10)

    assert response.status_code == 200, f"Ожидался статус 200, получен {response.status_code}"

    # Проверяем Content-Type
    assert "application/json" in response.headers.get("content-type", ""), "Ответ должен быть JSON"

    data = response.json()
    # Health endpoint может возвращать boolean true или объект
    assert data is not None, "Ответ не должен быть None"

    print(f"✅ Синхронный health endpoint работает: {data}")
