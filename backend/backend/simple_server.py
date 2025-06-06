#!/usr/bin/env python3
"""
Простой HTTP сервер для тестирования admin frontend
Эмулирует основные API endpoints backend
"""

import json
import uuid
import re
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# UUID валидация
UUID_PATTERN = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)

def is_valid_uuid(uuid_string):
    """Проверка валидности UUID"""
    return UUID_PATTERN.match(uuid_string) is not None

# Мок данные
MOCK_DATA = {
    "buyers": [
        {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True,
            "last_activity": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        for _ in range(5)
    ],
    "sellers": [
        {
            "id": str(uuid.uuid4()),
            "keycloak_uuid": str(uuid.uuid4()),
            "is_online": True,
            "last_activity": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        for _ in range(3)
    ],
    "products": [
        {
            "id": str(uuid.uuid4()),
            "volume": 2.5,
            "price": 150.0,
            "title": f"Продукт {i+1}",
            "descrioption": f"Описание продукта {i+1}",
            "delivery_possible": True,
            "pickup_location": "Склад",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "seller_id": str(uuid.uuid4()),
            "wood_type_id": str(uuid.uuid4())
        }
        for i in range(10)
    ],
    "wood_types": [
        {
            "id": str(uuid.uuid4()),
            "neme": wood_type,
            "description": f"Описание {wood_type}"
        }
        for wood_type in ["Дуб", "Сосна", "Береза", "Ель"]
    ],
    "wood_type_prices": [
        {
            "id": str(uuid.uuid4()),
            "price_per_m3": 1000.0 + i * 100,
            "created_at": datetime.now().isoformat(),
            "wood_type_id": str(uuid.uuid4())
        }
        for i in range(4)
    ],
    "wooden_boards": [],
    "images": [],
    "chat_threads": [],
    "chat_messages": []
}

class SimpleAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Обработка GET запросов"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        query_params = parse_qs(parsed_url.query)
        
        logger.info(f"GET {path}")
        
        # Health check
        if path == "/api/v1/health":
            self.send_json_response(True)
            return
            
        # Обработка списков сущностей
        for entity_type in MOCK_DATA.keys():
            if path == f"/api/v1/{entity_type.replace('_', '-')}":
                offset = int(query_params.get('offset', [0])[0])
                limit = int(query_params.get('limit', [10])[0])
                
                data = MOCK_DATA[entity_type]
                paginated_data = data[offset:offset + limit]
                
                response = {
                    "data": paginated_data,
                    "pagination": {
                        "total": len(data),
                        "offset": offset,
                        "limit": limit
                    }
                }
                self.send_json_response(response)
                return
        
        # 404 для неизвестных путей с JSON ответом
        self.send_error_response(404, f"Endpoint {self.path} not found")
    
    def do_POST(self):
        """Обработка POST запросов"""
        parsed_url = urlparse(self.path)
        path = parsed_url.path
        
        logger.info(f"POST {path}")
        
        # Читаем тело запроса
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            data = json.loads(post_data.decode('utf-8'))
        except:
            data = {}
        
        # Создание новых сущностей
        for entity_type in MOCK_DATA.keys():
            if path == f"/api/v1/{entity_type.replace('_', '-')}":
                new_item = {
                    "id": str(uuid.uuid4()),
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    **data
                }
                MOCK_DATA[entity_type].append(new_item)
                
                response = {"data": new_item}
                self.send_json_response(response, status=201)
                return
        
        # 404 для неизвестных путей с JSON ответом
        self.send_error_response(404, f"Endpoint {self.path} not found")
    
    def do_PATCH(self):
        """Обработка PATCH запросов"""
        self.send_json_response({"message": "Updated successfully"})
    
    def do_DELETE(self):
        """Обработка DELETE запросов"""
        self.send_json_response({"message": "Deleted successfully"})
    
    def send_json_response(self, data, status=200):
        """Отправка JSON ответа"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

        response_json = json.dumps(data, ensure_ascii=False, indent=2)
        self.wfile.write(response_json.encode('utf-8'))

    def send_error_response(self, status_code, message):
        """Отправка JSON ошибки с русской локализацией"""
        # Русские сообщения об ошибках
        russian_messages = {
            400: "Неверный запрос. Проверьте данные.",
            404: "Ресурс не найден.",
            409: "Конфликт данных. Возможно, запись уже существует.",
            422: "Ошибка валидации данных.",
            500: "Внутренняя ошибка сервера."
        }

        localized_message = russian_messages.get(status_code, message)

        error_response = {
            "detail": localized_message,
            "status_code": status_code,
            "message": message  # Оригинальное сообщение для отладки
        }

        self.send_json_response(error_response, status_code)
    
    def do_OPTIONS(self):
        """Обработка OPTIONS запросов для CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Переопределяем логирование для более чистого вывода"""
        logger.info(f"{self.address_string()} - {format % args}")

def run_server(port=8000):
    """Запуск сервера"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleAPIHandler)
    
    logger.info(f"🚀 Простой API сервер запущен на порту {port}")
    logger.info(f"📋 Доступные endpoints:")
    logger.info(f"   GET  /api/v1/health")
    for entity_type in MOCK_DATA.keys():
        endpoint = entity_type.replace('_', '-')
        logger.info(f"   CRUD /api/v1/{endpoint}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("🛑 Сервер остановлен")
        httpd.shutdown()

if __name__ == "__main__":
    run_server(8001)
