import asyncio
import httpx
import json
from api_tests.api_client import generate_test_data, assert_response_success

async def debug_responses():
    backend_url = 'http://test-backend:8000'
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем покупателя
        buyer_data = generate_test_data('buyer')
        print('Input data:')
        print(json.dumps(buyer_data, indent=2, ensure_ascii=False))
        
        create_response = await client.post('/api/v1/buyers/', json=buyer_data)
        print(f'\nPOST status: {create_response.status_code}')
        created_buyer = create_response.json()
        print('POST response:')
        print(json.dumps(created_buyer, indent=2, ensure_ascii=False))
        
        # Получаем по ID
        buyer_id = created_buyer['data']['id']
        get_response = await client.get(f'/api/v1/buyers/{buyer_id}')
        print(f'\nGET by ID status: {get_response.status_code}')
        if get_response.status_code == 200:
            retrieved_data = get_response.json()
            print('GET by ID response:')
            print(json.dumps(retrieved_data, indent=2, ensure_ascii=False))
        else:
            print(f'GET error: {get_response.text}')
        
        # Получаем список
        list_response = await client.get('/api/v1/buyers/')
        print(f'\nGET list status: {list_response.status_code}')
        if list_response.status_code == 200:
            list_data = list_response.json()
            print('GET list response:')
            print(json.dumps(list_data, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    asyncio.run(debug_responses())
