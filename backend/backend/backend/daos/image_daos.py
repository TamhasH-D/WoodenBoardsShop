from backend.daos.base_daos import BaseDAO
from backend.dtos.image_dtos import ImageInputDTO, ImageUpdateDTO
from backend.models.image_models import Image


class ImageDAO(
    BaseDAO[
        Image,
        ImageInputDTO,
        ImageUpdateDTO,
    ]
):
    """Image DAO."""
