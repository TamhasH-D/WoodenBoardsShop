# Используем официальный образ python
FROM python:3.13-slim
# Установка uv
RUN pip install uv
RUN apt-get update && apt-get install -y --no-install-recommends libgl1-mesa-glx libglib2.0-0 curl

# Устанавливаем рабочую директорию
WORKDIR /app

COPY . .

# Устанавливаем только production зависимости
RUN uv sync --no-dev

# Команда по умолчанию
CMD ["uv", "run", "--no-dev", "python", "main.py"]
