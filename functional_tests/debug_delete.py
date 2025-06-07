import asyncio
import httpx
import json
from api_tests.api_client import generate_test_data, assert_response_success

async def test_delete_debug():
    backend_url = 'http://test-backend:8000'
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data('buyer')
        create_response = await client.post('/api/v1/buyers/', json=buyer_data)
        created_buyer = assert_response_success(create_response, 201)
        print('Created buyer:')
        print(json.dumps(created_buyer, indent=2, ensure_ascii=False))
        
        # Проверяем, что покупатель существует
        get_before = await client.get(f'/api/v1/buyers/{created_buyer["id"]}')
        print(f'\nGET before DELETE: {get_before.status_code}')
        
        # Удаляем покупателя
        delete_response = await client.delete(f'/api/v1/buyers/{created_buyer["id"]}')
        print(f'\nDELETE status: {delete_response.status_code}')
        print(f'DELETE headers: {dict(delete_response.headers)}')
        print(f'DELETE content: {delete_response.text}')
        
        # Проверяем после удаления
        get_after = await client.get(f'/api/v1/buyers/{created_buyer["id"]}')
        print(f'\nGET after DELETE: {get_after.status_code}')
        print(f'GET after content: {get_after.text}')

if __name__ == "__main__":
    asyncio.run(test_delete_debug())
