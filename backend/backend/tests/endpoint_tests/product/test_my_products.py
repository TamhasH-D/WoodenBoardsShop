"""Test my products endpoints."""

import pytest
from httpx import AsyncClient
from uuid import uuid4

from backend.daos import AllDAOs
from tests import factories

URI_MY_PRODUCTS = "/api/v1/products/my-products"
URI_MY_PRODUCTS_SEARCH = "/api/v1/products/my-products/search"


@pytest.mark.anyio
async def test_get_my_products_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get my products: 200."""
    # Create seller and products
    seller = await factories.SellerFactory.create()
    other_seller = await factories.SellerFactory.create()
    
    # Create products for our seller
    product1 = await factories.ProductFactory.create(seller_id=seller.id, title="My Product 1")
    product2 = await factories.ProductFactory.create(seller_id=seller.id, title="My Product 2")
    
    # Create product for other seller (should not be returned)
    await factories.ProductFactory.create(seller_id=other_seller.id, title="Other Product")
    
    # Test request
    response = await client.get(f"{URI_MY_PRODUCTS}?keycloak_id={seller.keycloak_uuid}")
    assert response.status_code == 200
    
    response_data = response.json()
    assert "data" in response_data
    assert "pagination" in response_data
    
    products = response_data["data"]
    assert len(products) == 2
    
    # Check that only our seller's products are returned
    product_ids = {product["id"] for product in products}
    assert str(product1.id) in product_ids
    assert str(product2.id) in product_ids


@pytest.mark.anyio
async def test_get_my_products_seller_not_found(
    client: AsyncClient,
) -> None:
    """Test get my products with non-existent seller: 404."""
    non_existent_keycloak_id = uuid4()
    
    response = await client.get(f"{URI_MY_PRODUCTS}?keycloak_id={non_existent_keycloak_id}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Seller not found"


@pytest.mark.anyio
async def test_get_my_products_empty_result(
    client: AsyncClient,
) -> None:
    """Test get my products when seller has no products: 200 with empty data."""
    # Create seller without products
    seller = await factories.SellerFactory.create()
    
    response = await client.get(f"{URI_MY_PRODUCTS}?keycloak_id={seller.keycloak_uuid}")
    assert response.status_code == 200
    
    response_data = response.json()
    assert response_data["data"] == []
    assert response_data["pagination"]["total"] == 0


@pytest.mark.anyio
async def test_get_my_products_with_pagination(
    client: AsyncClient,
) -> None:
    """Test get my products with pagination parameters."""
    seller = await factories.SellerFactory.create()
    
    # Create multiple products
    for i in range(5):
        await factories.ProductFactory.create(seller_id=seller.id, title=f"Product {i}")
    
    # Test with limit
    response = await client.get(
        f"{URI_MY_PRODUCTS}?keycloak_id={seller.keycloak_uuid}&limit=2&offset=0"
    )
    assert response.status_code == 200
    
    response_data = response.json()
    assert len(response_data["data"]) == 2
    assert response_data["pagination"]["total"] == 5


@pytest.mark.anyio
async def test_search_my_products_success(
    client: AsyncClient,
) -> None:
    """Test search my products with filters: 200."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    
    # Create products with different attributes
    product1 = await factories.ProductFactory.create(
        seller_id=seller.id,
        title="Oak Board",
        price=1000.0,
        wood_type_id=wood_type.id
    )
    product2 = await factories.ProductFactory.create(
        seller_id=seller.id,
        title="Pine Board",
        price=500.0,
        wood_type_id=wood_type.id
    )
    
    # Test search by title
    response = await client.get(
        f"{URI_MY_PRODUCTS_SEARCH}?keycloak_id={seller.keycloak_uuid}&search_query=Oak"
    )
    assert response.status_code == 200
    
    response_data = response.json()
    products = response_data["data"]
    assert len(products) == 1
    assert products[0]["id"] == str(product1.id)


@pytest.mark.anyio
async def test_search_my_products_price_filter(
    client: AsyncClient,
) -> None:
    """Test search my products with price filter."""
    seller = await factories.SellerFactory.create()
    
    # Create products with different prices
    expensive_product = await factories.ProductFactory.create(
        seller_id=seller.id,
        price=2000.0
    )
    cheap_product = await factories.ProductFactory.create(
        seller_id=seller.id,
        price=500.0
    )
    
    # Test price filter
    response = await client.get(
        f"{URI_MY_PRODUCTS_SEARCH}?keycloak_id={seller.keycloak_uuid}&price_min=1000"
    )
    assert response.status_code == 200
    
    response_data = response.json()
    products = response_data["data"]
    assert len(products) == 1
    assert products[0]["id"] == str(expensive_product.id)


@pytest.mark.anyio
async def test_search_my_products_seller_not_found(
    client: AsyncClient,
) -> None:
    """Test search my products with non-existent seller: 404."""
    non_existent_keycloak_id = uuid4()
    
    response = await client.get(
        f"{URI_MY_PRODUCTS_SEARCH}?keycloak_id={non_existent_keycloak_id}"
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Seller not found"


@pytest.mark.anyio
async def test_search_my_products_security_seller_ids_override(
    client: AsyncClient,
) -> None:
    """Test that seller_ids filter is overridden for security."""
    seller1 = await factories.SellerFactory.create()
    seller2 = await factories.SellerFactory.create()
    
    # Create products for both sellers
    product1 = await factories.ProductFactory.create(seller_id=seller1.id)
    product2 = await factories.ProductFactory.create(seller_id=seller2.id)
    
    # Try to access other seller's products by passing seller_ids parameter
    # This should be ignored and only current seller's products returned
    response = await client.get(
        f"{URI_MY_PRODUCTS_SEARCH}?keycloak_id={seller1.keycloak_uuid}&seller_ids={seller2.id}"
    )
    assert response.status_code == 200
    
    response_data = response.json()
    products = response_data["data"]
    assert len(products) == 1
    assert products[0]["id"] == str(product1.id)  # Only seller1's product
