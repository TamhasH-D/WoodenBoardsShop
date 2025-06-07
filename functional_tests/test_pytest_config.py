"""Простой тест для проверки конфигурации pytest."""

import pytest


def test_pytest_config_works():
    """Простой тест для проверки, что pytest.ini работает корректно."""
    assert True


@pytest.mark.fast
def test_fast_marker():
    """Тест с маркером fast."""
    assert True


@pytest.mark.api
def test_api_marker():
    """Тест с маркером api."""
    assert True


def test_simple_math():
    """Простой математический тест."""
    assert 2 + 2 == 4


def test_string_operations():
    """Простой тест строковых операций."""
    assert "hello" + " " + "world" == "hello world"
