from uuid import uuid4, UUID

from httpx import AsyncClient
import pytest

from tests.factories import ProductFactory, SellerFactory, WoodTypeFactory


@pytest.mark.asyncio
async def test_get_product_boards_stats_no_boards(
    async_client: AsyncClient,
    seller_factory: SellerFactory,
    wood_type_factory: WoodTypeFactory,
    product_factory: ProductFactory,
) -> None:
    """
    Test GET /products/{product_id}/boards/stats when product has no boards.

    It should return 200 OK with total_count = 0 and null averages.
    """
    # Create a seller and wood_type for the product
    seller = await seller_factory.create()
    wood_type = await wood_type_factory.create()

    # Create a product without any images or boards
    product = await product_factory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id
    )

    response = await async_client.get(f"/products/{product.id}/boards/stats")

    assert response.status_code == 200
    response_data = response.json()
    assert response_data["data"]["total_count"] == 0
    assert response_data["data"]["average_height"] is None
    assert response_data["data"]["average_width"] is None
    assert response_data["data"]["average_length"] is None
    assert response_data["data"]["total_volume"] == 0.0
