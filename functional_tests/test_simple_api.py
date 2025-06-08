"""Простые API тесты для проверки работоспособности системы."""

import pytest
import httpx
import uuid


class TestSimpleAPI:
    """Простые тесты API для проверки базовой функциональности."""
    
    @pytest.mark.asyncio
    async def test_health_check(self, api_client: httpx.AsyncClient):
        """Тест проверки здоровья системы."""
        response = await api_client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data or "message" in data
    
    @pytest.mark.asyncio
    async def test_create_wood_type_simple(self, api_client: httpx.AsyncClient):
        """Простой тест создания типа древесины."""
        wood_type_data = {
            "id": str(uuid.uuid4()),
            "neme": "Тестовая древесина",
            "description": "Описание тестовой древесины"
        }
        
        response = await api_client.post("/api/v1/wood-types/", json=wood_type_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["data"]["id"] == wood_type_data["id"]
        assert data["data"]["neme"] == wood_type_data["neme"]
        
        # Очистка
        await api_client.delete(f"/api/v1/wood-types/{wood_type_data['id']}")
    
    @pytest.mark.asyncio
    async def test_get_wood_types_list(self, api_client: httpx.AsyncClient):
        """Тест получения списка типов древесины."""
        response = await api_client.get("/api/v1/wood-types/")
        assert response.status_code == 200
        
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)
    
    @pytest.mark.asyncio
    async def test_create_buyer_simple(self, api_client: httpx.AsyncClient):
        """Простой тест создания покупателя."""
        buyer_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True
        }
        
        response = await api_client.post("/api/v1/buyers/", json=buyer_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["data"]["id"] == buyer_data["id"]
        assert data["data"]["is_online"] == buyer_data["is_online"]
        
        # Очистка
        await api_client.delete(f"/api/v1/buyers/{buyer_data['id']}")
    
    @pytest.mark.asyncio
    async def test_create_seller_simple(self, api_client: httpx.AsyncClient):
        """Простой тест создания продавца."""
        seller_data = {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True
        }
        
        response = await api_client.post("/api/v1/sellers/", json=seller_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["data"]["id"] == seller_data["id"]
        assert data["data"]["is_online"] == seller_data["is_online"]
        
        # Очистка
        await api_client.delete(f"/api/v1/sellers/{seller_data['id']}")
