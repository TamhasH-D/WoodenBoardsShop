#!/usr/bin/env python3
"""
Демонстрация живых данных генератора
"""

import random
from generate_data import DataGenerator
from data_templates import (
    WOOD_TYPES, PRODUCT_TITLE_TEMPLATES, PRODUCT_DESCRIPTIONS,
    CHAT_MESSAGES_BUYER, CHAT_MESSAGES_SELLER, PRODUCT_STORIES,
    WOOD_EMOTIONS, SEASONAL_MOODS, SELLER_PERSONALITIES
)

def demo_alive_products():
    """Демонстрация живых товаров"""
    print("🛍️ Примеры живых товаров:")
    print("=" * 60)
    
    generator = DataGenerator()
    
    for i in range(5):
        # Выбираем случайный тип древесины
        wood_type = random.choice(WOOD_TYPES)
        wood_name = wood_type['neme']
        
        # Генерируем размеры
        width, height = random.choice([(100, 25), (150, 40), (200, 50)])
        length = random.choice([3000, 4000, 6000])
        
        # Генерируем название
        title_template = random.choice(PRODUCT_TITLE_TEMPLATES)
        title = title_template.format(
            wood_type=wood_name,
            width=width,
            height=height,
            length=length
        )
        
        # Добавляем живые детали
        if random.random() < 0.5:
            title += random.choice([
                " [СВЕЖИЙ ЗАВОЗ]",
                " [ХИТ ПРОДАЖ]",
                " [МАСТЕР ВЫБОР]",
                " [СЕВЕРНОЕ КАЧЕСТВО]"
            ])
        
        # Генерируем описание
        description = random.choice(PRODUCT_DESCRIPTIONS).format(wood_type=wood_name)
        
        # Добавляем историю
        if random.random() < 0.6:
            story = random.choice(PRODUCT_STORIES)
            description += f" {story}"
        
        # Добавляем эмоцию
        if wood_name in WOOD_EMOTIONS and random.random() < 0.7:
            emotion = random.choice(WOOD_EMOTIONS[wood_name])
            description += f" Древесина особенно {emotion}."
        
        # Генерируем цену
        price = random.randint(15000, 80000)
        volume = round((width * height * length) / 1_000_000_000, 4)
        total_price = round(volume * price, 2)
        
        print(f"\n📦 Товар {i+1}:")
        print(f"   Название: {title}")
        print(f"   Цена: {total_price:,.2f} ₽ ({price:,} ₽/м³)")
        print(f"   Описание: {description}")
        print(f"   Объем: {volume} м³")

def demo_alive_chat():
    """Демонстрация живого чата"""
    print("\n\n💬 Пример живого диалога:")
    print("=" * 60)
    
    # Генерируем диалог
    messages = []
    
    # Покупатель начинает
    buyer_msg = random.choice(CHAT_MESSAGES_BUYER)
    if random.random() < 0.3:
        buyer_msg += random.choice([
            " (строю дом для семьи)",
            " (делаю мебель своими руками)",
            " (ремонт в квартире)"
        ])
    messages.append(("👤 Покупатель", buyer_msg))
    
    # Продавец отвечает
    seller_msg = random.choice(CHAT_MESSAGES_SELLER)
    if random.random() < 0.2:
        seller_msg += f" {random.choice(SELLER_PERSONALITIES)}"
    messages.append(("🏪 Продавец", seller_msg))
    
    # Еще несколько сообщений
    for _ in range(3):
        if random.choice([True, False]):
            msg = random.choice(CHAT_MESSAGES_BUYER)
            messages.append(("👤 Покупатель", msg))
        else:
            msg = random.choice(CHAT_MESSAGES_SELLER)
            messages.append(("🏪 Продавец", msg))
    
    # Выводим диалог
    for sender, message in messages:
        print(f"\n{sender}:")
        print(f"   {message}")

def demo_alive_addresses():
    """Демонстрация живых адресов"""
    print("\n\n🏠 Примеры живых адресов самовывоза:")
    print("=" * 60)
    
    generator = DataGenerator()
    
    for i in range(5):
        address = generator.generate_pickup_address()
        print(f"   {i+1}. {address}")

def demo_seasonal_prices():
    """Демонстрация сезонных цен"""
    print("\n\n💰 Сезонные колебания цен:")
    print("=" * 60)
    
    generator = DataGenerator()
    
    wood_types = ["Сосна", "Дуб", "Береза"]
    base_prices = [20000, 60000, 30000]
    
    for wood_type, base_price in zip(wood_types, base_prices):
        seasonal_price = generator.add_seasonal_price_variation(base_price, wood_type)
        change = ((seasonal_price - base_price) / base_price) * 100
        
        print(f"   {wood_type}:")
        print(f"     Базовая цена: {base_price:,} ₽/м³")
        print(f"     Сезонная цена: {seasonal_price:,.0f} ₽/м³")
        print(f"     Изменение: {change:+.1f}%")

def demo_moods_and_stories():
    """Демонстрация настроений и историй"""
    print("\n\n✨ Сезонные настроения и истории:")
    print("=" * 60)
    
    print("\n🎭 Сезонные настроения:")
    for mood in SEASONAL_MOODS[:3]:
        print(f"   • {mood}")
    
    print("\n📖 Истории о товарах:")
    for story in PRODUCT_STORIES[:3]:
        print(f"   • {story}")
    
    print("\n👨‍💼 Личности продавцов:")
    for personality in SELLER_PERSONALITIES[:3]:
        print(f"   • {personality}")

def main():
    """Главная демонстрация"""
    print("🌟 ДЕМОНСТРАЦИЯ ЖИВЫХ ДАННЫХ ГЕНЕРАТОРА")
    print("=" * 80)
    print("Теперь генератор создает не просто данные, а живые истории!")
    print("Каждый товар, каждое сообщение имеет характер и эмоции.")
    
    demo_alive_products()
    demo_alive_chat()
    demo_alive_addresses()
    demo_seasonal_prices()
    demo_moods_and_stories()
    
    print("\n" + "=" * 80)
    print("🎉 Данные стали живыми!")
    print("✨ Каждая запись теперь рассказывает свою историю")
    print("💝 Персонализация и эмоции делают данные реалистичными")
    print("🏆 Готово для создания по-настоящему живой базы данных!")

if __name__ == "__main__":
    main()
