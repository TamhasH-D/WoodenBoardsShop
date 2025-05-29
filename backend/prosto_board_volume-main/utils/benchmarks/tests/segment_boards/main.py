import os
import requests
from PIL import Image, ImageDraw
import random

def draw_polygons(image_path, output_path, detections):
    """Рисуем полигоны обнаруженных объектов на изображении"""
    with Image.open(image_path) as img:
        draw = ImageDraw.Draw(img, 'RGBA')
        
        for detection in detections:
            # Генерируем полупрозрачный цвет
            color = (
                random.randint(0, 255),
                random.randint(0, 255),
                random.randint(0, 255),
                128
            )
            
            # Преобразуем точки в координаты
            points = [(p["x"], p["y"]) for p in detection["points"]]
            
            # Рисуем полигон с обводкой
            draw.polygon(
                points,
                fill=color,
                outline=(0, 0, 0, 255),
                width=2
            )
            
            # Добавляем подпись с классом и уверенностью
            text = f"{detection['confidence']:.2f}"
            draw.text(
                (points[0][0] + 5, points[0][1] + 5),
                text,
                fill=(255, 255, 255, 255),
                stroke_width=1,
                stroke_fill=(0, 0, 0, 255)
            )
        
        img.save(output_path)

def process_image(input_path, output_dir):
    url = "http://0.0.0.0:8001/detect_seg/"
    
    try:
        with open(input_path, 'rb') as f:
            response = requests.post(
                url,
                files={'file': f},
                headers={'accept': 'application/json'}
            )
        response.raise_for_status()
        
        detections = response.json()
        
        # Создаем имя выходного файла
        filename = os.path.basename(input_path)
        output_path = os.path.join(output_dir, f"annotated_{filename}")
        
        # Рисуем и сохраняем результат
        draw_polygons(input_path, output_path, detections)
        print(f"Обработано: {filename} -> {output_path}")
        
    except requests.exceptions.HTTPError as errh:
        print(f"HTTP ошибка: {errh}")
    except Exception as e:
        print(f"Ошибка: {e}")

def main(input_dir, output_dir):
    # Создаем выходную директорию
    os.makedirs(output_dir, exist_ok=True)
    
    # Обрабатываем все изображения в директории
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            file_path = os.path.join(input_dir, filename)
            process_image(file_path, output_dir)

if __name__ == "__main__":
    main(
        input_dir="input",
        output_dir="output"
    )
