#!/usr/bin/env python3
"""
Миграция существующих изображений в новую структуру папок.
Перемещает файлы из старой структуры /uploads/products/{product_id}_{image_id}.jpg
в новую структуру /uploads/sellers/{seller_id}/products/{product_id}/{image_id}.jpg
"""

import asyncio
import sys
from pathlib import Path
from uuid import UUID

# Добавляем путь к backend модулям
sys.path.append('/home/kindaruman/Sync/projects/diplom/backend/backend')

try:
    from backend.settings import settings
    from backend.database import get_session
    from backend.daos import AllDAOs
    from backend.services.image_service import image_service
except ImportError as e:
    print(f"❌ Ошибка импорта: {e}")
    print("Убедитесь, что backend настроен корректно")
    sys.exit(1)


async def migrate_images():
    """Мигрирует существующие изображения в новую структуру."""
    print("🚀 Начинаем миграцию изображений в новую структуру...")
    
    # Получаем сессию базы данных
    async with get_session() as session:
        daos = AllDAOs(session)
        
        # Получаем все изображения из базы данных
        print("📊 Получаем список всех изображений...")
        images = await daos.image.filter()
        print(f"Найдено {len(images)} изображений для миграции")
        
        if not images:
            print("✅ Нет изображений для миграции")
            return True
        
        migrated_count = 0
        error_count = 0
        
        for image in images:
            try:
                print(f"\n🔄 Обрабатываем изображение {image.id}...")
                
                # Получаем информацию о продукте
                product = await daos.product.filter_first(id=image.product_id)
                if not product:
                    print(f"❌ Продукт {image.product_id} не найден для изображения {image.id}")
                    error_count += 1
                    continue
                
                # Проверяем текущий путь к файлу
                current_path = Path(image.image_path)
                if not current_path.exists():
                    print(f"❌ Файл не найден: {current_path}")
                    error_count += 1
                    continue
                
                # Определяем новый путь
                new_dir = image_service.get_seller_product_dir(product.seller_id, product.id)
                new_dir.mkdir(parents=True, exist_ok=True)
                
                # Извлекаем имя файла из текущего пути
                filename = current_path.name
                new_path = new_dir / filename
                
                # Проверяем, не находится ли файл уже в новой структуре
                if "sellers" in str(current_path) and "products" in str(current_path):
                    print(f"✅ Файл уже в новой структуре: {current_path}")
                    migrated_count += 1
                    continue
                
                # Перемещаем файл
                print(f"📁 Перемещаем: {current_path} -> {new_path}")
                current_path.rename(new_path)
                
                # Обновляем путь в базе данных
                await daos.image.update(image.id, {"image_path": str(new_path)})
                
                print(f"✅ Изображение {image.id} успешно мигрировано")
                migrated_count += 1
                
            except Exception as e:
                print(f"❌ Ошибка при миграции изображения {image.id}: {e}")
                error_count += 1
                continue
        
        print(f"\n📊 Результаты миграции:")
        print(f"   ✅ Успешно мигрировано: {migrated_count}")
        print(f"   ❌ Ошибок: {error_count}")
        print(f"   📝 Всего обработано: {len(images)}")
        
        if error_count == 0:
            print("\n🎉 Миграция завершена успешно!")
            return True
        else:
            print(f"\n⚠️  Миграция завершена с {error_count} ошибками")
            return False


async def cleanup_old_directories():
    """Очищает старые пустые директории после миграции."""
    print("\n🧹 Очистка старых пустых директорий...")
    
    old_products_dir = settings.products_uploads_path
    if not old_products_dir.exists():
        print("✅ Старая директория products не найдена")
        return
    
    try:
        # Проверяем, пуста ли директория
        if not any(old_products_dir.iterdir()):
            old_products_dir.rmdir()
            print(f"✅ Удалена пустая директория: {old_products_dir}")
        else:
            remaining_files = list(old_products_dir.iterdir())
            print(f"⚠️  В директории {old_products_dir} остались файлы:")
            for file in remaining_files[:5]:  # Показываем первые 5 файлов
                print(f"   - {file.name}")
            if len(remaining_files) > 5:
                print(f"   ... и еще {len(remaining_files) - 5} файлов")
    except Exception as e:
        print(f"❌ Ошибка при очистке директории: {e}")


async def verify_migration():
    """Проверяет корректность миграции."""
    print("\n🔍 Проверка корректности миграции...")
    
    async with get_session() as session:
        daos = AllDAOs(session)
        
        # Получаем все изображения
        images = await daos.image.filter()
        
        valid_count = 0
        invalid_count = 0
        
        for image in images:
            image_path = Path(image.image_path)
            
            # Проверяем, что файл существует
            if not image_path.exists():
                print(f"❌ Файл не найден: {image_path}")
                invalid_count += 1
                continue
            
            # Проверяем, что путь соответствует новой структуре
            path_parts = image_path.parts
            if "sellers" in path_parts and "products" in path_parts:
                valid_count += 1
            else:
                print(f"⚠️  Файл не в новой структуре: {image_path}")
                invalid_count += 1
        
        print(f"\n📊 Результаты проверки:")
        print(f"   ✅ Файлы в новой структуре: {valid_count}")
        print(f"   ❌ Файлы в старой структуре: {invalid_count}")
        
        return invalid_count == 0


async def main():
    """Главная функция миграции."""
    print("🚀 Запуск миграции изображений в новую структуру\n")
    
    try:
        # Выполняем миграцию
        migration_success = await migrate_images()
        
        # Проверяем результат
        verification_success = await verify_migration()
        
        # Очищаем старые директории
        await cleanup_old_directories()
        
        if migration_success and verification_success:
            print("\n🎉 Миграция полностью завершена успешно!")
            return 0
        else:
            print("\n💥 Миграция завершена с ошибками")
            return 1
            
    except Exception as e:
        print(f"\n💥 Критическая ошибка миграции: {e}")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
