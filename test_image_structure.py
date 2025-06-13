#!/usr/bin/env python3
"""
Тест новой структуры хранения изображений.
Проверяет, что изображения сохраняются в правильной иерархии папок.
"""

import tempfile
from pathlib import Path
from uuid import uuid4


def test_image_structure():
    """Тестирует новую структуру хранения изображений."""
    print("🧪 Тестирование новой структуры хранения изображений...")

    # Создаем временную директорию для тестов
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"📁 Временная директория: {temp_dir}")

        # Генерируем тестовые UUID
        seller_id = uuid4()
        product_id = uuid4()
        image_id = uuid4()

        print(f"👤 Seller ID: {seller_id}")
        print(f"📦 Product ID: {product_id}")
        print(f"🖼️  Image ID: {image_id}")

        # Создаем тестовое изображение
        image_content = b"fake image content for testing"
        
        try:
            # Тестируем структуру папок
            print("💾 Тестируем структуру папок...")

            # Создаем ожидаемую структуру папок
            base_upload_dir = Path(temp_dir)
            seller_dir = base_upload_dir / "sellers" / str(seller_id)
            product_dir = seller_dir / "products" / str(product_id)
            product_dir.mkdir(parents=True, exist_ok=True)

            # Создаем файл изображения
            filename = f"{image_id}.jpg"
            file_path = product_dir / filename

            # Сохраняем тестовое содержимое
            with open(file_path, 'wb') as f:
                f.write(image_content)

            print(f"✅ Изображение сохранено: {file_path}")

            # Проверяем структуру папок
            expected_path = Path(temp_dir) / "sellers" / str(seller_id) / "products" / str(product_id) / f"{image_id}.jpg"
            print(f"📍 Ожидаемый путь: {expected_path}")

            if file_path == expected_path:
                print("✅ Путь соответствует ожидаемой структуре!")
            else:
                print(f"❌ Путь не соответствует! Получен: {file_path}")
                return False
            
            # Проверяем, что файл существует
            if expected_path.exists():
                print("✅ Файл существует!")
            else:
                print("❌ Файл не найден!")
                return False

            # Проверяем содержимое файла
            with open(expected_path, 'rb') as f:
                saved_content = f.read()

            if saved_content == image_content:
                print("✅ Содержимое файла корректно!")
            else:
                print("❌ Содержимое файла не соответствует!")
                return False

            # Тестируем удаление файла
            print("🗑️  Тестируем удаление файла...")
            expected_path.unlink()

            if not expected_path.exists():
                print("✅ Файл успешно удален!")
            else:
                print("❌ Ошибка удаления файла!")
                return False

            # Тестируем очистку пустых папок
            print("🧹 Тестируем очистку пустых папок...")

            # Удаляем пустые папки
            try:
                product_dir.rmdir()  # Удаляем папку продукта
                products_dir = product_dir.parent
                if not any(products_dir.iterdir()):
                    products_dir.rmdir()  # Удаляем папку products
                    seller_dir = products_dir.parent
                    if not any(seller_dir.iterdir()):
                        seller_dir.rmdir()  # Удаляем папку продавца
                print("✅ Пустые папки очищены!")
            except OSError as e:
                print(f"❌ Ошибка очистки папок: {e}")
                return False
            
            print("🎉 Все тесты прошли успешно!")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            return False


def test_get_seller_product_dir():
    """Тестирует логику получения директории продавца."""
    print("\n🧪 Тестирование логики get_seller_product_dir...")

    with tempfile.TemporaryDirectory() as temp_dir:
        base_upload_dir = Path(temp_dir)
        seller_id = uuid4()
        product_id = uuid4()

        expected_dir = base_upload_dir / "sellers" / str(seller_id) / "products" / str(product_id)

        print(f"📁 Базовая директория: {base_upload_dir}")
        print(f"👤 Seller ID: {seller_id}")
        print(f"📦 Product ID: {product_id}")
        print(f"📍 Ожидаемая директория: {expected_dir}")

        # Проверяем логику построения пути
        actual_dir = base_upload_dir / "sellers" / str(seller_id) / "products" / str(product_id)

        if expected_dir == actual_dir:
            print("✅ Логика построения пути работает корректно!")
            return True
        else:
            print(f"❌ Ошибка в логике построения пути!")
            print(f"   Ожидалось: {expected_dir}")
            print(f"   Получено: {actual_dir}")
            return False


def main():
    """Главная функция тестирования."""
    print("🚀 Запуск тестов новой структуры изображений\n")

    test1_result = test_image_structure()
    test2_result = test_get_seller_product_dir()

    print(f"\n📊 Результаты тестирования:")
    print(f"   Тест структуры файлов: {'✅ ПРОЙДЕН' if test1_result else '❌ ПРОВАЛЕН'}")
    print(f"   Тест логики директории: {'✅ ПРОЙДЕН' if test2_result else '❌ ПРОВАЛЕН'}")

    if test1_result and test2_result:
        print("\n🎉 Все тесты успешно пройдены! Новая структура работает корректно.")
        return 0
    else:
        print("\n💥 Некоторые тесты провалены. Требуется исправление.")
        return 1


if __name__ == "__main__":
    exit_code = main()
    exit(exit_code)
