import asyncio
import httpx
import json
from api_tests.api_client import generate_test_data, assert_response_success

async def debug_product():
    backend_url = 'http://test-backend:8000'
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем зависимости
        seller_data = generate_test_data('seller')
        seller_response = await client.post('/api/v1/sellers/', json=seller_data)
        created_seller = assert_response_success(seller_response, 201)
        
        wood_type_data = generate_test_data('wood_type')
        wood_type_response = await client.post('/api/v1/wood-types/', json=wood_type_data)
        created_wood_type = assert_response_success(wood_type_response, 201)
        
        # Создаем товар
        product_data = generate_test_data('product')
        product_data['seller_id'] = created_seller['id']
        product_data['wood_type_id'] = created_wood_type['id']
        product_response = await client.post('/api/v1/products/', json=product_data)
        created_product = assert_response_success(product_response, 201)
        
        # Получаем товар по ID
        get_response = await client.get(f'/api/v1/products/{created_product["id"]}')
        retrieved_product = assert_response_success(get_response, 200)
        
        print('Product fields:')
        print(json.dumps(retrieved_product, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(debug_product())
