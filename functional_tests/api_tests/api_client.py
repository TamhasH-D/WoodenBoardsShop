"""
API клиент для функциональных тестов.
Аналогично backend тестам, но для интеграционного тестирования через HTTP.
"""

from typing import Any, Dict
from uuid import UUID

import httpx
from httpx import Response


def assert_response_success(response: Response, expected_status: int = 200):
    """Проверка успешного ответа API."""
    assert response.status_code == expected_status, (
        f"Expected status {expected_status}, got {response.status_code}. "
        f"Response: {response.text}"
    )

    data = response.json()

    # Если ответ - простое значение (например, boolean для health), возвращаем как есть
    if not isinstance(data, dict):
        return data

    # Если есть поле data, возвращаем его содержимое
    if "data" in data:
        return data["data"]

    # Иначе возвращаем весь объект (для endpoints без обертки data)
    return data


def assert_response_error(response: Response, expected_status: int) -> Dict[str, Any]:
    """Проверка ошибочного ответа API."""
    assert response.status_code == expected_status, (
        f"Expected status {expected_status}, got {response.status_code}. "
        f"Response: {response.text}"
    )
    
    data = response.json()
    assert "error" in data or "detail" in data, f"Response missing error field: {data}"
    
    return data


def generate_test_data(entity_type: str) -> Dict[str, Any]:
    """Генерация тестовых данных для различных сущностей."""
    from uuid import uuid4
    
    base_data = {"id": str(uuid4())}
    
    if entity_type == "buyer":
        return {
            **base_data,
            "keycloak_uuid": str(uuid4()),
            "is_online": False,
        }
    
    elif entity_type == "seller":
        return {
            **base_data,
            "keycloak_uuid": str(uuid4()),
            "is_online": False,
        }
    
    elif entity_type == "wood_type":
        import time
        timestamp = str(int(time.time() * 1000))  # Миллисекунды для уникальности
        return {
            **base_data,
            "neme": f"Тестовая древесина {timestamp}",
            "description": f"Описание тестовой древесины {timestamp}",
        }
    
    elif entity_type == "wood_type_price":
        return {
            **base_data,
            "price_per_m3": 1500.50,
            "wood_type_id": str(uuid4()),  # Будет заменен на реальный ID
        }
    
    elif entity_type == "product":
        return {
            **base_data,
            "neme": "Тестовый товар",
            "descrioption": "Описание тестового товара",
            "price": 2500.00,
            "seller_id": str(uuid4()),  # Будет заменен на реальный ID
            "volume": 1.5,  # Объем в м3
            "title": "Заголовок товара",
            "pickup_location": "Москва, ул. Тестовая, 1",
            "wood_type_id": str(uuid4()),  # Будет заменен на реальный ID
        }
    
    elif entity_type == "wooden_board":
        return {
            **base_data,
            "height": 2.5,
            "width": 1.2,
            "lenght": 3.0,
            "image_id": str(uuid4()),  # Будет заменен на реальный ID
        }
    
    elif entity_type == "image":
        return {
            **base_data,
            "image_path": "/test/path/image.jpg",
            "product_id": str(uuid4()),  # Будет заменен на реальный ID
        }

    elif entity_type == "chat_thread":
        return {
            **base_data,
            "buyer_id": str(uuid4()),  # Будет заменен на реальный ID
            "seller_id": str(uuid4()),  # Будет заменен на реальный ID
        }

    elif entity_type == "chat":  # Алиас для обратной совместимости
        return generate_test_data("chat_thread")

    elif entity_type == "wood_type_price":
        return {
            **base_data,
            "price_per_m3": 1500.0,  # Цена за кубический метр
            "wood_type_id": str(uuid4()),  # Будет заменен на реальный ID
        }

    else:
        raise ValueError(f"Unknown entity type: {entity_type}")


def validate_uuid(value: str) -> bool:
    """Проверка валидности UUID."""
    try:
        UUID(value)
        return True
    except (ValueError, TypeError):
        return False


def validate_entity_fields(data: Dict[str, Any], entity_type: str) -> None:
    """Валидация полей сущности."""
    # Общие поля
    assert "id" in data, "Missing 'id' field"
    assert validate_uuid(data["id"]), f"Invalid UUID in 'id': {data['id']}"
    
    # Специфичные поля для каждой сущности
    if entity_type in ["buyer", "seller"]:
        assert "keycloak_uuid" in data, "Missing 'keycloak_uuid' field"
        assert validate_uuid(data["keycloak_uuid"]), f"Invalid UUID in 'keycloak_uuid': {data['keycloak_uuid']}"
        assert "is_online" in data, "Missing 'is_online' field"
        assert isinstance(data["is_online"], bool), f"'is_online' should be boolean: {data['is_online']}"
    
    elif entity_type == "wood_type":
        assert "neme" in data, "Missing 'neme' field"
        assert "description" in data, "Missing 'description' field"
        assert isinstance(data["neme"], str), f"'neme' should be string: {data['neme']}"
        assert isinstance(data["description"], str), f"'description' should be string: {data['description']}"
    
    elif entity_type == "wood_type_price":
        assert "price_per_m3" in data, "Missing 'price_per_m3' field"
        assert "wood_type_id" in data, "Missing 'wood_type_id' field"
        assert isinstance(data["price_per_m3"], (int, float)), f"'price_per_m3' should be number: {data['price_per_m3']}"
        assert validate_uuid(data["wood_type_id"]), f"Invalid UUID in 'wood_type_id': {data['wood_type_id']}"
    
    elif entity_type == "product":
        assert "neme" in data, "Missing 'neme' field"
        assert "descrioption" in data, "Missing 'descrioption' field"
        assert "price" in data, "Missing 'price' field"
        assert "seller_id" in data, "Missing 'seller_id' field"
        assert "volume" in data, "Missing 'volume' field"
        assert "title" in data, "Missing 'title' field"
        assert "pickup_location" in data, "Missing 'pickup_location' field"
        assert "wood_type_id" in data, "Missing 'wood_type_id' field"
        assert isinstance(data["price"], (int, float)), f"'price' should be number: {data['price']}"
        assert isinstance(data["volume"], (int, float)), f"'volume' should be number: {data['volume']}"
        assert validate_uuid(data["seller_id"]), f"Invalid UUID in 'seller_id': {data['seller_id']}"
        assert validate_uuid(data["wood_type_id"]), f"Invalid UUID in 'wood_type_id': {data['wood_type_id']}"
    
    elif entity_type == "wooden_board":
        assert "height" in data, "Missing 'height' field"
        assert "width" in data, "Missing 'width' field"
        assert "lenght" in data, "Missing 'lenght' field"
        assert "image_id" in data, "Missing 'image_id' field"
        assert isinstance(data["height"], (int, float)), f"'height' should be number: {data['height']}"
        assert isinstance(data["width"], (int, float)), f"'width' should be number: {data['width']}"
        assert isinstance(data["lenght"], (int, float)), f"'lenght' should be number: {data['lenght']}"
        assert validate_uuid(data["image_id"]), f"Invalid UUID in 'image_id': {data['image_id']}"
    
    elif entity_type == "image":
        assert "image_path" in data, "Missing 'image_path' field"
        assert "product_id" in data, "Missing 'product_id' field"
        assert isinstance(data["image_path"], str), f"'image_path' should be string: {data['image_path']}"
        assert validate_uuid(data["product_id"]), f"Invalid UUID in 'product_id': {data['product_id']}"

    elif entity_type in ["chat", "chat_thread"]:
        assert "buyer_id" in data, "Missing 'buyer_id' field"
        assert "seller_id" in data, "Missing 'seller_id' field"
        assert validate_uuid(data["buyer_id"]), f"Invalid UUID in 'buyer_id': {data['buyer_id']}"
        assert validate_uuid(data["seller_id"]), f"Invalid UUID in 'seller_id': {data['seller_id']}"

    elif entity_type == "wood_type_price":
        assert "price_per_m3" in data, "Missing 'price_per_m3' field"
        assert "wood_type_id" in data, "Missing 'wood_type_id' field"
        assert isinstance(data["price_per_m3"], (int, float)), f"'price_per_m3' should be number: {data['price_per_m3']}"
        assert validate_uuid(data["wood_type_id"]), f"Invalid UUID in 'wood_type_id': {data['wood_type_id']}"
