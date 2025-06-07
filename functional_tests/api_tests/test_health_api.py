"""Функциональные тесты для Health API."""

import pytest
from typing import Dict, Any
from base.test_base import BaseAPITest
from utils.api_client import APIClient
from utils.test_logger import LogCapture


class TestHealthAPI(BaseAPITest):
    """Тесты для API проверки здоровья системы."""
    
    @pytest.mark.asyncio
    async def test_health_check_success(self, api_client: httpx.AsyncClient):
        """Тест успешной проверки здоровья системы."""
        self.api_client = api_client
        
        response = await api_client.health_check()
        
        # Проверяем структуру ответа
        assert isinstance(response, dict)
        
        # Базовые проверки для health check
        # Точная структура зависит от реализации в backend
        if "status" in response:
            assert response["status"] in ["ok", "healthy", "up"]
        
        if "timestamp" in response:
            assert isinstance(response["timestamp"], str)
        
        if "version" in response:
            assert isinstance(response["version"], str)
    
    @pytest.mark.asyncio
    async def test_health_check_response_time(self, api_client: httpx.AsyncClient):
        """Тест времени ответа health check."""
        self.api_client = api_client
        
        import time
        
        start_time = time.time()
        response = await api_client.health_check()
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Health check должен отвечать быстро (менее 1 секунды)
        assert response_time < 1.0
        
        # Проверяем, что ответ получен
        assert response is not None
    
    @pytest.mark.asyncio
    async def test_health_check_multiple_calls(self, api_client: httpx.AsyncClient):
        """Тест множественных вызовов health check."""
        self.api_client = api_client
        
        responses = []
        
        # Делаем несколько вызовов подряд
        for i in range(5):
            response = await api_client.health_check()
            responses.append(response)
        
        # Проверяем, что все вызовы успешны
        assert len(responses) == 5
        
        for response in responses:
            assert response is not None
            assert isinstance(response, dict)
    
    @pytest.mark.asyncio
    async def test_health_check_consistency(self, api_client: httpx.AsyncClient):
        """Тест консистентности ответов health check."""
        self.api_client = api_client
        
        # Получаем первый ответ
        first_response = await api_client.health_check()
        
        # Получаем второй ответ через небольшой промежуток
        import asyncio
        await asyncio.sleep(0.1)
        second_response = await api_client.health_check()
        
        # Проверяем, что структура ответов одинакова
        assert type(first_response) == type(second_response)
        assert first_response.keys() == second_response.keys()
        
        # Статус должен оставаться стабильным
        if "status" in first_response and "status" in second_response:
            assert first_response["status"] == second_response["status"]
