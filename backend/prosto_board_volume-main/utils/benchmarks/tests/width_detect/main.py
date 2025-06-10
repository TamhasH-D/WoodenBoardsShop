import os
import requests
from PIL import Image, ImageDraw
import random

def draw_polygons(image_path, output_path, boards):
    """Рисуем многоугольники на изображении разными цветами и сохраняем"""
    with Image.open(image_path) as img:
        draw = ImageDraw.Draw(img)
        
        for board in boards:
            # Генерируем случайный цвет с прозрачностью
            color = (
                random.randint(0, 255),
                random.randint(0, 255),
                random.randint(0, 255),
                128  # Альфа-канал для прозрачности
            )
            
            # Преобразуем точки в кортежи (x, y)
            points = [(p["x"], p["y"]) for p in board["detection"]["points"]]
            
            # Рисуем полигон с обводкой
            draw.polygon(
                points,
                fill=color,
                outline=(0, 0, 0, 255),  # Черная обводка
                width=3
            )
            
            # Добавляем текст с номером доски
            text_position = (points[0][0] + 10, points[0][1] + 10)
            draw.text(
                text_position,
                f"{round(board['width'], 2)}",
                fill=(255, 255, 255, 255),
                stroke_width=2,
                stroke_fill=(0, 0, 0, 255)
            )
        
        img.save(output_path)

def process_image(input_dir, output_dir, height, length):
    url = f"http://0.0.0.0:8000/wooden_boards_volume_seg/?height={height}&length={length}"
    
    try:
        with open(input_dir, 'rb') as f:
            response = requests.post(
                url,
                files={'image': f},
                headers={'accept': 'application/json'}
            )
            response.raise_for_status()
        
        result = response.json()
        
        filename = os.path.basename(input_dir)
        output_path = os.path.join(output_dir, f"annotated_{filename}")
        
        draw_polygons(input_dir, output_path, result["wooden_boards"])
        print(f"Processed {filename} -> {output_path}")
        
    except requests.exceptions.HTTPError as errh:
        print(f"HTTP Error: {errh}")
    except Exception as e:
        print(f"Error: {e}")

def main(input_dir, output_dir, height, length):
    os.makedirs(output_dir, exist_ok=True)
    
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            file_path = os.path.join(input_dir, filename)
            process_image(file_path, output_dir, height, length)

if __name__ == "__main__":
    input_dir = "input"
    output_dir = "output"
    height = 1
    length = 10
    
    main(input_dir, output_dir, height, length)
