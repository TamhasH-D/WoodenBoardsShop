"""
Тесты POST /api/v1/wooden-boards/calculate-volume endpoint.
Проверяют расчет объема деревянных досок через анализ изображений.
"""

import pytest
import httpx
import io
from PIL import Image

from api_tests.api_client import (
    assert_response_success,
    assert_response_error,
)

URI = "/api/v1/wooden-boards/calculate-volume"


def create_test_image(width: int = 100, height: int = 100) -> bytes:
    """Создает тестовое изображение в формате JPEG."""
    img = Image.new('RGB', (width, height), color='brown')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    return img_bytes.getvalue()


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.calculation
@pytest.mark.fast
async def test_calculate_volume_success() -> None:
    """Тест расчета объема деревянной доски через изображение: 200."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Создаем тестовое изображение
        test_image = create_test_image(200, 150)

        # Подготовка данных для загрузки
        files = {
            "image": ("test_board.jpg", test_image, "image/jpeg")
        }

        # Параметры запроса (опциональные размеры)
        params = {
            "board_height": 2.5,
            "board_length": 1.5
        }

        # Выполнение запроса
        response = await client.post(URI, files=files, params=params)

        # Проверка ответа
        response_data = assert_response_success(response, 200)

        # Проверка наличия результатов анализа
        # API может возвращать различные поля в зависимости от реализации YOLO
        assert isinstance(response_data, dict), f"Expected dict response, got {type(response_data)}"

        # Проверяем, что есть какие-то данные о результате анализа
        assert len(response_data) > 0, "Response should contain analysis results"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.calculation
@pytest.mark.fast
async def test_calculate_volume_various_dimensions() -> None:
    """Тест расчета объема с различными размерами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тестируем различные размеры
        test_cases = [
            {"length": 1.0, "width": 1.0, "thickness": 1.0, "expected": 1.0},
            {"length": 2.0, "width": 0.1, "thickness": 0.05, "expected": 0.01},
            {"length": 3.5, "width": 0.2, "thickness": 0.03, "expected": 0.021},
            {"length": 0.5, "width": 0.5, "thickness": 0.5, "expected": 0.125},
        ]
        
        for case in test_cases:
            input_json = {
                "length": case["length"],
                "width": case["width"],
                "thickness": case["thickness"]
            }
            
            response = await client.post(URI, json=input_json)
            response_data = assert_response_success(response, 200)
            
            # Проверка правильности расчета
            assert abs(response_data["volume"] - case["expected"]) < 0.0001, (
                f"Volume calculation incorrect for {input_json}. "
                f"Expected: {case['expected']}, got: {response_data['volume']}"
            )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_invalid_data() -> None:
    """Тест расчета объема с невалидными данными: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с невалидными типами данных
        invalid_data = {
            "length": "not-a-number",
            "width": "invalid",
            "thickness": None
        }
        
        response = await client.post(URI, json=invalid_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_missing_fields() -> None:
    """Тест расчета объема с отсутствующими полями: 422."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с отсутствующими обязательными полями
        incomplete_data = {
            "length": 2.0
            # Отсутствуют width и thickness
        }
        
        response = await client.post(URI, json=incomplete_data)
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_negative_dimensions() -> None:
    """Тест расчета объема с отрицательными размерами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с отрицательными размерами
        negative_data = {
            "length": -2.0,
            "width": -0.15,
            "thickness": -0.025
        }
        
        response = await client.post(URI, json=negative_data)
        
        # API может либо принять отрицательные размеры (200), либо отклонить (400/422)
        assert response.status_code in [200, 400, 422], (
            f"Expected success (200) or validation error (400/422), got {response.status_code}. "
            f"Response: {response.text}"
        )
        
        if response.status_code == 200:
            response_data = assert_response_success(response, 200)
            # Объем отрицательных размеров должен быть отрицательным
            expected_volume = negative_data["length"] * negative_data["width"] * negative_data["thickness"]
            assert abs(response_data["volume"] - expected_volume) < 0.0001


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_zero_dimensions() -> None:
    """Тест расчета объема с нулевыми размерами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с нулевыми размерами
        zero_data = {
            "length": 0.0,
            "width": 0.0,
            "thickness": 0.0
        }
        
        response = await client.post(URI, json=zero_data)
        
        # API должен принять нулевые размеры и вернуть нулевой объем
        response_data = assert_response_success(response, 200)
        assert response_data["volume"] == 0.0, f"Expected volume 0.0, got {response_data['volume']}"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_very_small_dimensions() -> None:
    """Тест расчета объема с очень маленькими размерами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с очень маленькими размерами
        small_data = {
            "length": 0.001,
            "width": 0.001,
            "thickness": 0.001
        }
        
        response = await client.post(URI, json=small_data)
        response_data = assert_response_success(response, 200)
        
        # Проверка правильности расчета для маленьких размеров
        expected_volume = 0.001 * 0.001 * 0.001  # 0.000000001
        assert abs(response_data["volume"] - expected_volume) < 0.0000000001, (
            f"Volume calculation incorrect for small dimensions. "
            f"Expected: {expected_volume}, got: {response_data['volume']}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_very_large_dimensions() -> None:
    """Тест расчета объема с очень большими размерами."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с очень большими размерами
        large_data = {
            "length": 1000.0,
            "width": 1000.0,
            "thickness": 1000.0
        }
        
        response = await client.post(URI, json=large_data)
        
        # API может либо принять большие размеры (200), либо отклонить (400/422)
        assert response.status_code in [200, 400, 422], (
            f"Expected success (200) or validation error (400/422), got {response.status_code}. "
            f"Response: {response.text}"
        )
        
        if response.status_code == 200:
            response_data = assert_response_success(response, 200)
            expected_volume = 1000.0 * 1000.0 * 1000.0  # 1,000,000,000
            assert abs(response_data["volume"] - expected_volume) < 1.0, (
                f"Volume calculation incorrect for large dimensions. "
                f"Expected: {expected_volume}, got: {response_data['volume']}"
            )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.performance
@pytest.mark.fast
async def test_calculate_volume_performance() -> None:
    """Тест производительности расчета объема."""
    import time
    
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Подготовка данных для множественных расчетов
        test_data = [
            {"length": 1.0 + i * 0.1, "width": 0.1 + i * 0.01, "thickness": 0.01 + i * 0.001}
            for i in range(10)
        ]
        
        # Измеряем время расчетов
        start_time = time.time()
        
        for data in test_data:
            response = await client.post(URI, json=data)
            response_data = assert_response_success(response, 200)
            
            # Проверяем правильность каждого расчета
            expected_volume = data["length"] * data["width"] * data["thickness"]
            assert abs(response_data["volume"] - expected_volume) < 0.0001
        
        end_time = time.time()
        calculation_time = end_time - start_time
        
        # Проверяем производительность (не более 5 секунд на 10 расчетов)
        assert calculation_time < 5.0, f"10 volume calculations took too long: {calculation_time:.2f} seconds"


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.calculation
@pytest.mark.fast
async def test_calculate_volume_precision() -> None:
    """Тест точности расчета объема."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с размерами, требующими высокой точности
        precision_data = {
            "length": 1.23456789,
            "width": 0.98765432,
            "thickness": 0.11111111
        }
        
        response = await client.post(URI, json=precision_data)
        response_data = assert_response_success(response, 200)
        
        # Проверка точности расчета
        expected_volume = precision_data["length"] * precision_data["width"] * precision_data["thickness"]
        assert abs(response_data["volume"] - expected_volume) < 0.000001, (
            f"Volume calculation lacks precision. "
            f"Expected: {expected_volume}, got: {response_data['volume']}, "
            f"difference: {abs(response_data['volume'] - expected_volume)}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_extra_fields() -> None:
    """Тест расчета объема с дополнительными полями."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с дополнительными полями
        data_with_extra = {
            "length": 2.0,
            "width": 0.15,
            "thickness": 0.025,
            "extra_field": "should_be_ignored",
            "another_field": 123
        }
        
        response = await client.post(URI, json=data_with_extra)
        
        # API должен игнорировать дополнительные поля и выполнить расчет
        response_data = assert_response_success(response, 200)
        
        expected_volume = data_with_extra["length"] * data_with_extra["width"] * data_with_extra["thickness"]
        assert abs(response_data["volume"] - expected_volume) < 0.0001, (
            f"Volume calculation incorrect with extra fields. "
            f"Expected: {expected_volume}, got: {response_data['volume']}"
        )


@pytest.mark.asyncio
@pytest.mark.api
@pytest.mark.post
@pytest.mark.validation
@pytest.mark.fast
async def test_calculate_volume_empty_request() -> None:
    """Тест расчета объема с пустым запросом."""
    backend_url = "http://test-backend:8000"
    async with httpx.AsyncClient(base_url=backend_url, timeout=30.0) as client:
        # Тест с пустым JSON
        response = await client.post(URI, json={})
        
        # Ожидаем ошибку валидации
        assert response.status_code in [400, 422], (
            f"Expected validation error (400 or 422), got {response.status_code}. "
            f"Response: {response.text}"
        )
