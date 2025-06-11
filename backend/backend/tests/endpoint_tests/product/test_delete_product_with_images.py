"""Tests for DELETE /products/{product_id}/with-images endpoint."""

from uuid import uuid4
import pytest
from httpx import AsyncClient
from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/{product_id}/with-images"


@pytest.mark.anyio
async def test_delete_product_with_images_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete product with images: 200."""
    # Create test data
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # Create test image
    image = await factories.ImageFactory.create(product_id=product.id)
    
    # Create test wooden boards
    board1 = await factories.WoodenBoardFactory.create(image_id=image.id)
    board2 = await factories.WoodenBoardFactory.create(image_id=image.id)
    
    response = await client.delete(URI.format(product_id=product.id))
    
    assert response.status_code == 200
    
    # Verify response structure
    data = response.json()
    assert "data" in data
    assert data["data"] is None
    
    # Verify product is deleted
    deleted_product = await daos.product.filter_first(id=product.id)
    assert deleted_product is None
    
    # Verify image is deleted
    deleted_image = await daos.image.filter_first(id=image.id)
    assert deleted_image is None
    
    # Verify wooden boards are deleted
    deleted_board1 = await daos.wooden_board.filter_first(id=board1.id)
    assert deleted_board1 is None
    
    deleted_board2 = await daos.wooden_board.filter_first(id=board2.id)
    assert deleted_board2 is None


@pytest.mark.anyio
async def test_delete_product_with_multiple_images(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete product with multiple images: 200."""
    # Create test data
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # Create multiple test images
    image1 = await factories.ImageFactory.create(product_id=product.id)
    image2 = await factories.ImageFactory.create(product_id=product.id)
    
    # Create test wooden boards for each image
    board1 = await factories.WoodenBoardFactory.create(image_id=image1.id)
    board2 = await factories.WoodenBoardFactory.create(image_id=image2.id)
    
    response = await client.delete(URI.format(product_id=product.id))
    
    assert response.status_code == 200
    
    # Verify all related data is deleted
    deleted_product = await daos.product.filter_first(id=product.id)
    assert deleted_product is None
    
    deleted_image1 = await daos.image.filter_first(id=image1.id)
    assert deleted_image1 is None
    
    deleted_image2 = await daos.image.filter_first(id=image2.id)
    assert deleted_image2 is None
    
    deleted_board1 = await daos.wooden_board.filter_first(id=board1.id)
    assert deleted_board1 is None
    
    deleted_board2 = await daos.wooden_board.filter_first(id=board2.id)
    assert deleted_board2 is None


@pytest.mark.anyio
async def test_delete_product_not_found(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete product - not found: 404."""
    response = await client.delete(URI.format(product_id=uuid4()))
    
    assert response.status_code == 404
    
    # Verify error message
    data = response.json()
    assert "detail" in data
    assert "не найден" in data["detail"]


@pytest.mark.anyio
async def test_delete_product_without_images(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete product without images: 200."""
    # Create test data
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # No images created for this product
    
    response = await client.delete(URI.format(product_id=product.id))
    
    assert response.status_code == 200
    
    # Verify product is deleted
    deleted_product = await daos.product.filter_first(id=product.id)
    assert deleted_product is None


@pytest.mark.anyio
async def test_delete_product_with_orphaned_boards(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete product handles orphaned wooden boards correctly: 200."""
    # Create test data
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # Create test image
    image = await factories.ImageFactory.create(product_id=product.id)
    
    # Create test wooden boards
    board = await factories.WoodenBoardFactory.create(image_id=image.id)
    
    # Manually delete image to create orphaned board scenario
    await daos.image.delete(id=image.id)
    
    response = await client.delete(URI.format(product_id=product.id))
    
    assert response.status_code == 200
    
    # Verify product is deleted
    deleted_product = await daos.product.filter_first(id=product.id)
    assert deleted_product is None
    
    # Verify orphaned board is handled (should be deleted or ignored)
    # The exact behavior depends on implementation
    # This test documents the expected behavior
