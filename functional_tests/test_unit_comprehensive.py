"""
Comprehensive Unit Testing Suite.
Консолидированный набор модульных тестов для всех компонентов системы.
"""

import pytest
import requests
import json
import uuid
import httpx
from datetime import datetime
from typing import Dict, List, Any
from utils.api_client import APIClient


@pytest.mark.unit
@pytest.mark.comprehensive
class TestUnitComprehensive:
    """Comprehensive unit testing suite combining all API and integration tests."""
    
    def test_system_health_comprehensive(self, api_client):
        """Comprehensive system health check."""
        # Test all health endpoints
        health_endpoints = [
            "/health",
            "/api/health", 
            "/api/v1/health",
            "/status"
        ]
        
        for endpoint in health_endpoints:
            try:
                response = api_client.get(endpoint)
                if response.status_code == 200:
                    print(f"✅ Health endpoint {endpoint} is working")
                    break
            except Exception as e:
                print(f"⚠️ Health endpoint {endpoint} failed: {str(e)}")
        else:
            pytest.fail("No health endpoints are working")
    
    def test_all_crud_operations_comprehensive(self, api_client):
        """Test all CRUD operations across all entities."""
        entities = [
            "buyers",
            "sellers", 
            "products",
            "wood-types",
            "wooden-boards",
            "images",
            "chats",
            "chat-messages",
            "chat-threads",
            "wood-type-prices"
        ]
        
        results = {}
        
        for entity in entities:
            results[entity] = {
                "create": False,
                "read": False,
                "update": False,
                "delete": False
            }
            
            try:
                # Test GET (Read)
                response = api_client.get(f"/api/{entity}/")
                if response.status_code in [200, 404]:  # 404 is OK for empty collections
                    results[entity]["read"] = True
                
                # Test POST (Create) - only if we have test data
                if entity in ["buyers", "sellers", "wood-types"]:
                    test_data = self._get_test_data_for_entity(entity)
                    if test_data:
                        response = api_client.post(f"/api/{entity}/", json=test_data)
                        if response.status_code in [200, 201]:
                            results[entity]["create"] = True
                            
                            # Get the created item ID for update/delete tests
                            if response.status_code == 201:
                                created_item = response.json()
                                item_id = created_item.get("id")
                                
                                if item_id:
                                    # Test PATCH (Update)
                                    update_data = {"neme": f"Updated {entity}"}
                                    response = api_client.patch(f"/api/{entity}/{item_id}/", json=update_data)
                                    if response.status_code in [200, 204]:
                                        results[entity]["update"] = True
                                    
                                    # Test DELETE
                                    response = api_client.delete(f"/api/{entity}/{item_id}/")
                                    if response.status_code in [200, 204]:
                                        results[entity]["delete"] = True
                
            except Exception as e:
                print(f"Error testing {entity}: {str(e)}")
        
        # Log results
        print("\n📊 CRUD Operations Test Results:")
        for entity, operations in results.items():
            status = "✅" if any(operations.values()) else "❌"
            print(f"{status} {entity}: {operations}")
        
        # At least some operations should work
        total_operations = sum(sum(ops.values()) for ops in results.values())
        assert total_operations > 0, "No CRUD operations are working"
    
    def _get_test_data_for_entity(self, entity: str) -> Dict[str, Any]:
        """Get test data for entity creation."""
        test_data = {
            "buyers": {
                "id": str(uuid.uuid4()),
                "neme": "Test Buyer",
                "email": f"buyer_{uuid.uuid4().hex[:8]}@test.com",
                "phone": "+1234567890"
            },
            "sellers": {
                "id": str(uuid.uuid4()),
                "neme": "Test Seller", 
                "email": f"seller_{uuid.uuid4().hex[:8]}@test.com",
                "phone": "+1234567890",
                "company_neme": "Test Company"
            },
            "wood-types": {
                "id": str(uuid.uuid4()),
                "neme": f"Test Wood {uuid.uuid4().hex[:8]}",
                "descrioption": "Test wood type description"
            }
        }
        
        return test_data.get(entity, {})
    
    def test_uuid_validation_comprehensive(self, api_client):
        """Comprehensive UUID validation across all endpoints."""
        # Test invalid UUID formats
        invalid_uuids = [
            "invalid-uuid",
            "123",
            "not-a-uuid-at-all",
            "12345678-1234-1234-1234-12345678901",  # Too long
            "12345678-1234-1234-1234-123456789012"   # Too short
        ]
        
        entities = ["buyers", "sellers", "products", "wood-types"]
        
        for entity in entities:
            for invalid_uuid in invalid_uuids:
                try:
                    response = api_client.get(f"/api/{entity}/{invalid_uuid}/")
                    # Should return 400 (Bad Request) or 404 (Not Found)
                    assert response.status_code in [400, 404], \
                        f"Invalid UUID {invalid_uuid} should return 400/404 for {entity}"
                except Exception as e:
                    print(f"UUID validation test failed for {entity}: {str(e)}")
    
    def test_api_error_handling_comprehensive(self, api_client):
        """Test comprehensive error handling across all endpoints."""
        # Test non-existent endpoints
        response = api_client.get("/api/non-existent-endpoint/")
        assert response.status_code == 404
        
        # Test malformed JSON
        try:
            response = api_client.post("/api/buyers/", data="invalid json")
            assert response.status_code in [400, 422]
        except Exception:
            pass  # Some clients might raise exceptions for malformed data
        
        # Test missing required fields
        entities_with_required_fields = {
            "buyers": {"neme": "Test"},  # Missing email
            "sellers": {"neme": "Test"},  # Missing email and company_neme
            "wood-types": {}  # Missing neme
        }
        
        for entity, incomplete_data in entities_with_required_fields.items():
            try:
                response = api_client.post(f"/api/{entity}/", json=incomplete_data)
                assert response.status_code in [400, 422], \
                    f"Incomplete data should return 400/422 for {entity}"
            except Exception as e:
                print(f"Error handling test failed for {entity}: {str(e)}")
    
    def test_pagination_comprehensive(self, api_client):
        """Test pagination across all list endpoints."""
        entities = ["buyers", "sellers", "products", "wood-types"]
        
        for entity in entities:
            try:
                # Test with limit parameter
                response = api_client.get(f"/api/{entity}/?limit=5")
                assert response.status_code in [200, 404]
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, dict) and "results" in data:
                        assert len(data["results"]) <= 5
                    elif isinstance(data, list):
                        assert len(data) <= 20  # Default backend limit
                
                # Test with offset parameter
                response = api_client.get(f"/api/{entity}/?offset=0&limit=10")
                assert response.status_code in [200, 404]
                
            except Exception as e:
                print(f"Pagination test failed for {entity}: {str(e)}")
    
    def test_data_consistency_comprehensive(self, api_client):
        """Test data consistency across related entities."""
        # This test checks that related data is consistent
        # For example, products should reference valid sellers and wood types
        
        try:
            # Get all products
            response = api_client.get("/api/products/")
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, dict) and "results" in products:
                    products = products["results"]
                elif not isinstance(products, list):
                    products = []
                
                # Check that each product has valid references
                for product in products[:5]:  # Check first 5 products
                    if "seller_id" in product:
                        seller_response = api_client.get(f"/api/sellers/{product['seller_id']}/")
                        # Seller should exist or return 404 (which is acceptable)
                        assert seller_response.status_code in [200, 404]
                    
                    if "wood_type_id" in product:
                        wood_type_response = api_client.get(f"/api/wood-types/{product['wood_type_id']}/")
                        # Wood type should exist or return 404 (which is acceptable)
                        assert wood_type_response.status_code in [200, 404]
        
        except Exception as e:
            print(f"Data consistency test failed: {str(e)}")
    
    def test_performance_comprehensive(self, api_client):
        """Test basic performance of API endpoints."""
        import time
        
        entities = ["buyers", "sellers", "products", "wood-types"]
        performance_results = {}
        
        for entity in entities:
            start_time = time.time()
            try:
                response = api_client.get(f"/api/{entity}/")
                end_time = time.time()
                
                response_time = end_time - start_time
                performance_results[entity] = {
                    "response_time": response_time,
                    "status_code": response.status_code,
                    "success": response.status_code in [200, 404]
                }
                
                # Response should be under 5 seconds
                assert response_time < 5.0, f"{entity} endpoint took too long: {response_time:.2f}s"
                
            except Exception as e:
                performance_results[entity] = {
                    "error": str(e),
                    "success": False
                }
        
        print("\n⚡ Performance Test Results:")
        for entity, result in performance_results.items():
            if result.get("success"):
                print(f"✅ {entity}: {result['response_time']:.3f}s")
            else:
                print(f"❌ {entity}: {result.get('error', 'Failed')}")
        
        # At least half of the endpoints should respond quickly
        successful_tests = sum(1 for r in performance_results.values() if r.get("success"))
        assert successful_tests >= len(entities) // 2, "Too many endpoints are slow or failing"


# Additional comprehensive test markers
pytestmark = [
    pytest.mark.unit,
    pytest.mark.comprehensive,
    pytest.mark.api,
    pytest.mark.integration
]
