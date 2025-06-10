# Используем официальный образ Ultralytics
FROM ultralytics/ultralytics:8.3.96

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY . /app

# Устанавливаем только production зависимости в системную среду
RUN pip install -r docker_requirements.txt

# Команда по умолчанию
CMD ["python", "main.py"]

