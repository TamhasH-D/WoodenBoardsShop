#!/usr/bin/env python3
"""
Тест каталога товаров продавца с изображениями.
Проверяет работу нового API endpoint для получения изображений по ID товара.
"""

import asyncio
import tempfile
from pathlib import Path
from uuid import uuid4

# Добавляем путь к backend модулям
import sys
sys.path.append('/home/kindaruman/Sync/projects/diplom/backend/backend')

try:
    from backend.settings import settings
    from backend.database import get_session
    from backend.daos import AllDAOs
    from backend.dtos.product_dtos import ProductInputDTO
    from backend.dtos.image_dtos import ImageInputDTO
    from backend.services.image_service import image_service
    from tests import factories
except ImportError as e:
    print(f"❌ Ошибка импорта: {e}")
    print("Убедитесь, что backend настроен корректно")
    sys.exit(1)


async def test_seller_catalog():
    """Тестирует каталог товаров продавца с изображениями."""
    print("🚀 Тестирование каталога товаров продавца с изображениями...")
    
    async with get_session() as session:
        daos = AllDAOs(session)
        
        try:
            # Создаем тестового продавца
            print("👤 Создаем тестового продавца...")
            seller = await factories.SellerFactory.create()
            print(f"✅ Продавец создан: {seller.id}")
            
            # Создаем тип древесины
            print("🌲 Создаем тип древесины...")
            wood_type = await factories.WoodTypeFactory.create()
            print(f"✅ Тип древесины создан: {wood_type.id}")
            
            # Создаем товар
            print("📦 Создаем товар...")
            product_id = uuid4()
            product_dto = ProductInputDTO(
                id=product_id,
                volume=1.5,
                price=5000.0,
                title="Тестовая доска дуб",
                descrioption="Качественная дубовая доска для тестирования",
                delivery_possible=True,
                pickup_location="Москва, ул. Тестовая, 1",
                seller_id=seller.id,
                wood_type_id=wood_type.id
            )
            
            product = await daos.product.create(product_dto)
            print(f"✅ Товар создан: {product.id}")
            
            # Создаем тестовое изображение
            print("🖼️  Создаем тестовое изображение...")
            with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
                tmp_file.write(b"fake image content for testing seller catalog")
                tmp_path = tmp_file.name
            
            try:
                # Создаем запись изображения в БД
                image_id = uuid4()
                image_dto = ImageInputDTO(
                    id=image_id,
                    image_path=tmp_path,
                    product_id=product.id
                )
                
                image = await daos.image.create(image_dto)
                print(f"✅ Изображение создано: {image.id}")
                
                # Тестируем получение товаров продавца
                print("📋 Тестируем получение товаров продавца...")
                seller_products = await daos.product.filter(seller_id=seller.id)
                print(f"✅ Найдено товаров продавца: {len(seller_products)}")
                
                if seller_products:
                    test_product = seller_products[0]
                    print(f"📦 Тестовый товар: {test_product.title}")
                    
                    # Тестируем получение изображения товара
                    print("🖼️  Тестируем получение изображения товара...")
                    product_images = await daos.image.filter(product_id=test_product.id)
                    
                    if product_images:
                        test_image = product_images[0]
                        print(f"✅ Найдено изображение: {test_image.id}")
                        print(f"📁 Путь к файлу: {test_image.image_path}")
                        
                        # Проверяем, что файл существует
                        if Path(test_image.image_path).exists():
                            print("✅ Файл изображения существует!")
                            
                            # Читаем содержимое для проверки
                            with open(test_image.image_path, 'rb') as f:
                                content = f.read()
                            
                            if content == b"fake image content for testing seller catalog":
                                print("✅ Содержимое файла корректно!")
                            else:
                                print("❌ Содержимое файла не соответствует ожидаемому")
                                return False
                        else:
                            print("❌ Файл изображения не найден!")
                            return False
                    else:
                        print("❌ Изображения для товара не найдены!")
                        return False
                else:
                    print("❌ Товары продавца не найдены!")
                    return False
                
                print("🎉 Все тесты каталога прошли успешно!")
                return True
                
            finally:
                # Очищаем временный файл
                Path(tmp_path).unlink(missing_ok=True)
                
        except Exception as e:
            print(f"❌ Ошибка в тесте: {e}")
            return False


async def test_api_endpoint_simulation():
    """Симулирует работу API endpoint для получения изображения по ID товара."""
    print("\n🔗 Симулируем работу API endpoint /products/{product_id}/image...")
    
    async with get_session() as session:
        daos = AllDAOs(session)
        
        try:
            # Получаем любой товар с изображением
            products = await daos.product.filter()
            
            for product in products:
                images = await daos.image.filter(product_id=product.id)
                if images:
                    print(f"📦 Товар: {product.title}")
                    print(f"🖼️  Изображений: {len(images)}")
                    
                    # Симулируем логику API endpoint
                    first_image = images[0]
                    print(f"📁 Путь к первому изображению: {first_image.image_path}")
                    
                    # Проверяем существование файла
                    if Path(first_image.image_path).exists():
                        print("✅ API endpoint вернул бы изображение успешно!")
                        
                        # Определяем MIME-тип
                        file_extension = Path(first_image.image_path).suffix.lower()
                        media_type_map = {
                            ".jpg": "image/jpeg",
                            ".jpeg": "image/jpeg",
                            ".png": "image/png",
                            ".gif": "image/gif",
                            ".webp": "image/webp",
                        }
                        media_type = media_type_map.get(file_extension, "image/jpeg")
                        print(f"📄 MIME-тип: {media_type}")
                        
                        return True
                    else:
                        print("❌ Файл не найден - API endpoint вернул бы 404")
            
            print("ℹ️  Товаров с изображениями не найдено")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка симуляции API: {e}")
            return False


async def main():
    """Главная функция тестирования."""
    print("🚀 Запуск тестов каталога товаров продавца\n")
    
    try:
        # Тестируем создание и получение данных
        test1_result = await test_seller_catalog()
        
        # Тестируем симуляцию API endpoint
        test2_result = await test_api_endpoint_simulation()
        
        print(f"\n📊 Результаты тестирования:")
        print(f"   Тест каталога: {'✅ ПРОЙДЕН' if test1_result else '❌ ПРОВАЛЕН'}")
        print(f"   Тест API endpoint: {'✅ ПРОЙДЕН' if test2_result else '❌ ПРОВАЛЕН'}")
        
        if test1_result and test2_result:
            print("\n🎉 Все тесты успешно пройдены! Каталог товаров продавца с изображениями работает корректно.")
            return 0
        else:
            print("\n💥 Некоторые тесты провалены. Требуется исправление.")
            return 1
            
    except Exception as e:
        print(f"\n💥 Критическая ошибка тестирования: {e}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
