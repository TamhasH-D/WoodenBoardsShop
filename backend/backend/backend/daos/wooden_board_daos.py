from uuid import uuid4

from backend.daos.base_daos import BaseDAO
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO, WoodenBoardUpdateDTO
from backend.models.wooden_board_models import WoodenBoard


class WoodenBoardDAO(
    BaseDAO[
        WoodenBoard,
        WoodenBoardInputDTO,
        WoodenBoardUpdateDTO,
    ]
):
    """WoodenBoard DAO."""

    async def create(self, input_dto: WoodenBoardInputDTO) -> WoodenBoard:
        """Create and return a new WoodenBoard record with calculated fields."""
        # Convert DTO to dict and handle missing fields
        data = input_dto.model_dump(exclude_none=True)

        # Generate ID if not provided
        if "id" not in data or data["id"] is None:
            data["id"] = uuid4()

        # Calculate volume if not provided
        if "volume" not in data or data["volume"] is None:
            data["volume"] = data["height"] * data["width"] * data["length"]

        # Set default confidence if not provided
        if "confidence" not in data or data["confidence"] is None:
            data["confidence"] = 0.95  # Default confidence

        # Handle product_id - if not provided, create a minimal product for tests
        if "product_id" not in data or data["product_id"] is None:
            # Import here to avoid circular imports
            from backend.models.product_models import Product
            from tests.factories import SellerFactory, WoodTypeFactory

            # Create minimal dependencies for the product
            seller = await SellerFactory.create()
            wood_type = await WoodTypeFactory.create()

            # Create a minimal product
            product = Product(
                volume=data["volume"],
                price=100.0,  # Default price for test
                title="Test Product",
                delivery_possible=False,
                seller_id=seller.id,
                wood_type_id=wood_type.id,
            )
            self.session.add(product)
            await self.session.flush()
            data["product_id"] = product.id

        # Create the record
        record = self.model(**data)
        self.session.add(record)
        await self.session.flush()
        return record
