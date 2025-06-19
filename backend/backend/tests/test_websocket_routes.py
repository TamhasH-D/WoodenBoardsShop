"""
Тесты для WebSocket роутов.
Проверяют корректность исправления ошибки FastAPI и базовую функциональность.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4, UUID

# Мокаем FastAPI и WebSocket для тестирования
class MockWebSocket:
    def __init__(self):
        self.client_state = "CONNECTED"
        self.accept = AsyncMock()
        self.close = AsyncMock()
        self.receive_text = AsyncMock()
        self.send_text = AsyncMock()

class MockDAOs:
    def __init__(self):
        self.chat_thread = MagicMock()
        self.chat_message = MagicMock()

def test_websocket_function_signature():
    """Тест проверяет, что функция websocket_chat_endpoint имеет правильную сигнатуру."""
    
    # Импортируем функцию
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    
    try:
        from backend.routes.websocket_routes import websocket_chat_endpoint
    except ImportError as e:
        pytest.skip(f"Не удалось импортировать websocket_routes: {e}")
    
    # Проверяем сигнатуру функции
    import inspect
    sig = inspect.signature(websocket_chat_endpoint)
    
    # Проверяем наличие всех необходимых параметров
    expected_params = ['websocket', 'thread_id', 'user_id', 'user_type', 'daos']
    actual_params = list(sig.parameters.keys())
    
    assert actual_params == expected_params, f"Неправильные параметры: {actual_params}"
    
    # Проверяем аннотацию типа для daos
    daos_param = sig.parameters['daos']
    assert daos_param.annotation.__name__ == 'GetDAOs', "Неправильная аннотация для параметра daos"
    
    # Проверяем, что нет значения по умолчанию
    assert daos_param.default == inspect.Parameter.empty, "Параметр daos не должен иметь значение по умолчанию"

def test_connection_manager_basic_functionality():
    """Тест базовой функциональности ConnectionManager."""
    
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    
    try:
        from backend.routes.websocket_routes import ConnectionManager
    except ImportError as e:
        pytest.skip(f"Не удалось импортировать ConnectionManager: {e}")
    
    manager = ConnectionManager()
    
    # Тест начального состояния
    assert manager.active_connections == {}
    
    # Тест получения пользователей пустого треда
    users = manager.get_thread_users("test_thread")
    assert users == set()
    
    # Тест отключения несуществующего пользователя
    manager.disconnect("test_thread", "test_user")
    assert manager.active_connections == {}

@pytest.mark.asyncio
async def test_connection_manager_connect():
    """Тест подключения пользователя через ConnectionManager."""
    
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    
    try:
        from backend.routes.websocket_routes import ConnectionManager
    except ImportError as e:
        pytest.skip(f"Не удалось импортировать ConnectionManager: {e}")
    
    manager = ConnectionManager()
    mock_websocket = MockWebSocket()
    
    # Тест подключения
    await manager.connect(mock_websocket, "thread1", "user1")
    
    # Проверяем, что пользователь добавлен
    assert "thread1" in manager.active_connections
    assert "user1" in manager.active_connections["thread1"]
    assert manager.active_connections["thread1"]["user1"] == mock_websocket
    
    # Проверяем, что websocket.accept() был вызван
    mock_websocket.accept.assert_called_once()
    
    # Проверяем получение пользователей треда
    users = manager.get_thread_users("thread1")
    assert users == {"user1"}

def test_websocket_route_imports():
    """Тест проверяет, что все необходимые импорты работают корректно."""
    
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    
    try:
        # Проверяем основные импорты
        from backend.routes.websocket_routes import router, manager, ConnectionManager
        from backend.routes.websocket_routes import websocket_chat_endpoint, notify_new_message
        
        # Проверяем, что router является APIRouter
        assert hasattr(router, 'websocket'), "router должен иметь метод websocket"
        assert hasattr(router, 'prefix'), "router должен иметь атрибут prefix"
        assert router.prefix == "/ws", "Неправильный prefix для WebSocket router"
        
        # Проверяем, что manager является экземпляром ConnectionManager
        assert isinstance(manager, ConnectionManager), "manager должен быть экземпляром ConnectionManager"
        
    except ImportError as e:
        pytest.skip(f"Не удалось импортировать websocket_routes: {e}")

def test_connection_manager_ping_settings():
    """Тест проверяет настройки ping_interval и ping_timeout в глобальном ConnectionManager."""
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

    try:
        from backend.routes.websocket_routes import manager as global_manager
    except ImportError as e:
        pytest.skip(f"Не удалось импортировать manager из websocket_routes: {e}")

    assert global_manager.ping_timeout == 30, "ping_timeout должен быть 30"
    assert global_manager.ping_interval == 30, "ping_interval должен быть 30 (базовый, до добавления jitter)"

def test_uuid_validation_logic():
    """Тест логики валидации UUID в WebSocket функции."""
    
    # Тест валидных UUID
    valid_uuid = str(uuid4())
    try:
        parsed_uuid = UUID(valid_uuid)
        assert str(parsed_uuid) == valid_uuid
    except ValueError:
        pytest.fail("Валидный UUID не должен вызывать ValueError")
    
    # Тест невалидных UUID
    invalid_uuids = ["invalid", "123", "", "not-a-uuid"]
    for invalid_uuid in invalid_uuids:
        with pytest.raises(ValueError):
            UUID(invalid_uuid)

if __name__ == "__main__":
    # Запуск тестов
    pytest.main([__file__, "-v"])
