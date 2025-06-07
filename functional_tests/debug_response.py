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
        created_buyer = assert_response_success(create_response, 201)
        print('POST response:')
        print(json.dumps(created_buyer, indent=2, ensure_ascii=False))

        # Обновляем покупателя
        update_data = {'is_online': not created_buyer['is_online']}
        patch_response = await client.patch(f'/api/v1/buyers/{created_buyer["id"]}', json=update_data)
        print(f'\nPATCH status: {patch_response.status_code}')
        print(f'PATCH headers: {dict(patch_response.headers)}')
        print(f'PATCH content: {patch_response.text}')

        if patch_response.status_code in [200, 204]:
            if patch_response.text:
                patch_data = patch_response.json()
                print('PATCH response:')
                print(json.dumps(patch_data, indent=2, ensure_ascii=False))
            else:
                print('PATCH response: No content (204)')

        # Получаем по ID после обновления
        get_response = await client.get(f'/api/v1/buyers/{created_buyer["id"]}')
        print(f'\nGET after PATCH status: {get_response.status_code}')
        if get_response.status_code == 200:
            retrieved_data = assert_response_success(get_response, 200)
            print('GET after PATCH response:')
            print(json.dumps(retrieved_data, indent=2, ensure_ascii=False))

if __name__ == '__main__':
    asyncio.run(debug_responses())
