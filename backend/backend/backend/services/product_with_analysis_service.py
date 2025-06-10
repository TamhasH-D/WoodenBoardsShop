from uuid import uuid4, UUID
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List

from backend.daos import AllDAOs
from backend.dtos.product_with_analysis_dtos import (
    ProductWithAnalysisInputDTO, 
    ProductWithAnalysisResponseDTO
)
from backend.dtos.product_dtos import ProductInputDTO
from backend.dtos.image_dtos import ImageInputDTO
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO
from backend.services.image_service import image_service
from backend.models.seller_models import Seller
from backend.models.wood_type_models import WoodType


class ProductWithAnalysisService:
    """Service for creating products with image analysis and wooden boards."""
    
    def __init__(self, daos: AllDAOs, session: AsyncSession):
        self.daos = daos
        self.session = session
    
    async def create_product_with_analysis(
        self, 
        input_data: ProductWithAnalysisInputDTO,
        image: UploadFile
    ) -> ProductWithAnalysisResponseDTO:
        """
        Create product with image analysis and wooden boards.
        Uses database transaction for atomicity.
        """
        # Start transaction
        async with self.session.begin():
            try:
                # Step 1: Validate input data
                await self._validate_input_data(input_data)
                
                # Step 2: Get seller by keycloak_id
                seller = await self._get_seller_by_keycloak_id(input_data.keycloak_id)
                
                # Step 3: Validate wood type exists
                await self._validate_wood_type(input_data.wood_type_id)
                
                # Step 4: Analyze image with YOLO backend
                analysis_result = await image_service.analyze_wooden_boards(
                    image, 
                    input_data.board_height, 
                    input_data.board_length
                )
                
                # Step 5: Validate analysis result
                if not analysis_result.get("wooden_boards"):
                    raise HTTPException(
                        status_code=400,
                        detail="На изображении не обнаружено досок"
                    )
                
                # Step 6: Generate UUIDs
                product_id = uuid4()
                image_id = uuid4()
                
                # Step 7: Create product
                product = await self._create_product(
                    product_id, seller.id, input_data
                )
                
                # Step 8: Save image to filesystem
                image_path = await image_service.save_image(image, str(product_id))
                
                # Step 9: Create image record
                image_record = await self._create_image_record(
                    image_id, image_path, product_id
                )
                
                # Step 10: Create wooden board records
                wooden_boards = await self._create_wooden_boards(
                    analysis_result["wooden_boards"], image_id
                )
                
                # Commit transaction automatically when exiting context
                
                return ProductWithAnalysisResponseDTO(
                    product_id=product_id,
                    seller_id=seller.id,
                    image_id=image_id,
                    analysis_result=analysis_result,
                    wooden_boards_count=len(wooden_boards),
                    total_volume=analysis_result.get("total_volume", 0.0),
                    message="Товар успешно создан с анализом изображения"
                )
                
            except Exception as e:
                # Transaction will be rolled back automatically
                # Clean up saved image if it exists
                if 'image_path' in locals():
                    await image_service.delete_image(image_path)
                
                # Re-raise the exception
                if isinstance(e, HTTPException):
                    raise
                else:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Ошибка создания товара: {str(e)}"
                    )
    
    async def _validate_input_data(self, input_data: ProductWithAnalysisInputDTO) -> None:
        """Validate input data."""
        if not input_data.title.strip():
            raise HTTPException(status_code=400, detail="Название товара не может быть пустым")
        
        if input_data.volume <= 0:
            raise HTTPException(status_code=400, detail="Объем должен быть больше 0")
        
        if input_data.price <= 0:
            raise HTTPException(status_code=400, detail="Цена должна быть больше 0")
        
        if input_data.board_height <= 0 or input_data.board_height > 1000:
            raise HTTPException(status_code=400, detail="Высота доски должна быть от 0 до 1000 мм")
        
        if input_data.board_length <= 0 or input_data.board_length > 10000:
            raise HTTPException(status_code=400, detail="Длина доски должна быть от 0 до 10000 мм")
    
    async def _get_seller_by_keycloak_id(self, keycloak_id: UUID) -> Seller:
        """Get seller by keycloak_uuid."""
        seller = await self.daos.seller.get_by_keycloak_uuid(keycloak_id)
        if not seller:
            raise HTTPException(
                status_code=404, 
                detail="Продавец с указанным keycloak_id не найден"
            )
        return seller
    
    async def _validate_wood_type(self, wood_type_id: UUID) -> WoodType:
        """Validate that wood type exists."""
        wood_type = await self.daos.wood_type.filter_first(id=wood_type_id)
        if not wood_type:
            raise HTTPException(
                status_code=404,
                detail="Тип древесины не найден"
            )
        return wood_type
    
    async def _create_product(
        self, 
        product_id: UUID, 
        seller_id: UUID, 
        input_data: ProductWithAnalysisInputDTO
    ):
        """Create product record."""
        product_dto = ProductInputDTO(
            id=product_id,
            volume=input_data.volume,
            price=input_data.price,
            title=input_data.title.strip(),
            descrioption=input_data.description.strip() if input_data.description else None,
            delivery_possible=input_data.delivery_possible,
            pickup_location=input_data.pickup_location.strip() if input_data.pickup_location else None,
            seller_id=seller_id,
            wood_type_id=input_data.wood_type_id
        )
        
        return await self.daos.product.create(product_dto)
    
    async def _create_image_record(
        self, 
        image_id: UUID, 
        image_path: str, 
        product_id: UUID
    ):
        """Create image record in database."""
        image_dto = ImageInputDTO(
            id=image_id,
            image_path=image_path,
            product_id=product_id
        )
        
        return await self.daos.image.create(image_dto)
    
    async def _create_wooden_boards(
        self, 
        wooden_boards_data: List[Dict[str, Any]], 
        image_id: UUID
    ) -> List:
        """Create wooden board records."""
        wooden_boards = []
        
        for board_data in wooden_boards_data:
            board_dto = WoodenBoardInputDTO(
                id=uuid4(),
                height=board_data.get("height", 0.0),
                width=board_data.get("width", 0.0),
                lenght=board_data.get("length", 0.0),  # Note: keeping backend typo
                image_id=image_id
            )
            
            board = await self.daos.wooden_board.create(board_dto)
            wooden_boards.append(board)
        
        return wooden_boards
