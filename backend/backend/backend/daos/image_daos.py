from backend.daos.base_daos import BaseDAO
from backend.dtos.image_dtos import ImageInputDTO, ImageUpdateDTO, ImageDTO # Added ImageDTO
from backend.models.image_models import Image


class ImageDAO(
    BaseDAO[
        Image,
        ImageInputDTO,
        ImageUpdateDTO,
        ImageDTO, # Added ImageDTO here
    ]
):
    """Image DAO."""
    pass # DAO can be empty if it only uses BaseDAO methods and no custom ones
