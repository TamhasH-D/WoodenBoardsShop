#!/usr/bin/env python3
"""
Простой тест WebSocket соединения для чата
"""

import asyncio
import json
import websockets
import uuid
from datetime import datetime

# Конфигурация
WS_URL = "ws://localhost:8000/ws/chat"
THREAD_ID = str(uuid.uuid4())
BUYER_ID = str(uuid.uuid4())
SELLER_ID = str(uuid.uuid4())

async def test_buyer_connection():
    """Тест подключения покупателя"""
    uri = f"{WS_URL}/{THREAD_ID}?user_id={BUYER_ID}&user_type=buyer"
    print(f"🔵 Buyer connecting to: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("🔵 Buyer connected successfully!")
            
            # Отправляем тестовое сообщение
            test_message = {
                "type": "message",
                "message": "Привет от покупателя!",
                "message_id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat()
            }
            
            await websocket.send(json.dumps(test_message))
            print(f"🔵 Buyer sent: {test_message['message']}")
            
            # Ждем ответы
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(response)
                    print(f"🔵 Buyer received: {data}")
                    
                    if data.get('type') == 'message' and data.get('sender_type') == 'seller':
                        print("🔵 Buyer received message from seller!")
                        break
                        
            except asyncio.TimeoutError:
                print("🔵 Buyer timeout waiting for messages")
                
    except Exception as e:
        print(f"🔵 Buyer connection error: {e}")

async def test_seller_connection():
    """Тест подключения продавца"""
    # Небольшая задержка чтобы покупатель подключился первым
    await asyncio.sleep(1)
    
    uri = f"{WS_URL}/{THREAD_ID}?user_id={SELLER_ID}&user_type=seller"
    print(f"🟠 Seller connecting to: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("🟠 Seller connected successfully!")
            
            # Ждем сообщение от покупателя
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    data = json.loads(response)
                    print(f"🟠 Seller received: {data}")
                    
                    if data.get('type') == 'message' and data.get('sender_type') == 'buyer':
                        print("🟠 Seller received message from buyer!")
                        
                        # Отвечаем
                        reply_message = {
                            "type": "message",
                            "message": "Привет от продавца! Как дела?",
                            "message_id": str(uuid.uuid4()),
                            "timestamp": datetime.now().isoformat()
                        }
                        
                        await websocket.send(json.dumps(reply_message))
                        print(f"🟠 Seller sent: {reply_message['message']}")
                        break
                        
            except asyncio.TimeoutError:
                print("🟠 Seller timeout waiting for messages")
                
    except Exception as e:
        print(f"🟠 Seller connection error: {e}")

async def test_ping_pong():
    """Тест ping/pong механизма"""
    uri = f"{WS_URL}/{THREAD_ID}?user_id={str(uuid.uuid4())}&user_type=buyer"
    print(f"🏓 Testing ping/pong: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("🏓 Connected for ping/pong test")
            
            # Ждем ping от сервера
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=35.0)
                    data = json.loads(response)
                    print(f"🏓 Received: {data}")
                    
                    if data.get('type') == 'ping':
                        print("🏓 Received ping, sending pong...")
                        pong_message = {
                            "type": "pong",
                            "timestamp": datetime.now().isoformat()
                        }
                        await websocket.send(json.dumps(pong_message))
                        print("🏓 Pong sent!")
                        break
                        
            except asyncio.TimeoutError:
                print("🏓 Timeout waiting for ping")
                
    except Exception as e:
        print(f"🏓 Ping/pong test error: {e}")

async def main():
    """Основная функция тестирования"""
    print("🚀 Starting WebSocket chat tests...")
    print(f"📋 Thread ID: {THREAD_ID}")
    print(f"👤 Buyer ID: {BUYER_ID}")
    print(f"🏪 Seller ID: {SELLER_ID}")
    print("-" * 50)
    
    # Запускаем тесты параллельно
    tasks = [
        test_buyer_connection(),
        test_seller_connection(),
    ]
    
    try:
        await asyncio.gather(*tasks)
        print("-" * 50)
        print("✅ Basic chat test completed!")
        
        # Тест ping/pong
        print("\n🏓 Testing ping/pong mechanism...")
        await test_ping_pong()
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
    
    print("\n🏁 All tests completed!")

if __name__ == "__main__":
    print("WebSocket Chat Test")
    print("==================")
    print("Make sure the backend server is running on localhost:8000")
    print()
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
