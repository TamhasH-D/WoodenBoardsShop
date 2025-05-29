import logging
import sys
from logging.handlers import RotatingFileHandler
import os

# Создаем директорию для логов если её нет
log_directory = "logs"
if not os.path.exists(log_directory):
    os.makedirs(log_directory)

# Настройка форматирования
log_format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")


def setup_logger(name):
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Обработчик для записи в файл
    file_handler = RotatingFileHandler(
        os.path.join(log_directory, f"{name}.log"),
        maxBytes=10485760,  # 10MB
        backupCount=5,
    )
    file_handler.setFormatter(log_format)
    logger.addHandler(file_handler)

    # Обработчик для вывода в консоль
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_format)
    logger.addHandler(console_handler)

    return logger
