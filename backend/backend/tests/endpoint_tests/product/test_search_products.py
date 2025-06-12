import pytest
from httpx import AsyncClient
from uuid import uuid4

from tests import factories

URI = "/api/v1/products/search"


@pytest.mark.anyio
async def test_search_products_basic(
    client: AsyncClient,
) -> None:
    """Test basic product search without filters."""
    # Create test products
    products = await factories.ProductFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_json = response.json()
    assert "data" in response_json
    assert "pagination" in response_json

    response_data = response_json["data"]
    assert len(response_data) == 3

    # Verify pagination metadata
    assert response_json["pagination"]["total"] == 3


@pytest.mark.anyio
async def test_search_products_text_search(
    client: AsyncClient,
) -> None:
    """Test text search in title and description."""
    # Create products with specific titles
    product1 = await factories.ProductFactory.create(title="Дубовые доски")
    product2 = await factories.ProductFactory.create(title="Сосновые доски")
    product3 = await factories.ProductFactory.create(
        title="Березовые доски", 
        descrioption="Качественная древесина дуба"
    )

    # Search by title
    response = await client.get(f"{URI}?search_query=дуб")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 2  # product1 and product3 (description contains "дуба")
    
    found_ids = {item["id"] for item in response_data}
    assert str(product1.id) in found_ids
    assert str(product3.id) in found_ids


@pytest.mark.anyio
async def test_search_products_price_range(
    client: AsyncClient,
) -> None:
    """Test price range filtering."""
    # Create products with different prices
    product1 = await factories.ProductFactory.create(price=1000.0)
    product2 = await factories.ProductFactory.create(price=2000.0)
    product3 = await factories.ProductFactory.create(price=3000.0)

    # Test price range filter
    response = await client.get(f"{URI}?price_min=1500&price_max=2500")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product2.id)
    assert response_data[0]["price"] == 2000.0


@pytest.mark.anyio
async def test_search_products_volume_range(
    client: AsyncClient,
) -> None:
    """Test volume range filtering."""
    # Create products with different volumes
    product1 = await factories.ProductFactory.create(volume=0.5)
    product2 = await factories.ProductFactory.create(volume=1.0)
    product3 = await factories.ProductFactory.create(volume=1.5)

    # Test volume range filter
    response = await client.get(f"{URI}?volume_min=0.8&volume_max=1.2")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product2.id)
    assert response_data[0]["volume"] == 1.0


@pytest.mark.anyio
async def test_search_products_wood_type_filter(
    client: AsyncClient,
) -> None:
    """Test filtering by wood type IDs."""
    # Create wood types
    wood_type1 = await factories.WoodTypeFactory.create()
    wood_type2 = await factories.WoodTypeFactory.create()
    wood_type3 = await factories.WoodTypeFactory.create()

    # Create products with different wood types
    product1 = await factories.ProductFactory.create(wood_type_id=wood_type1.id)
    product2 = await factories.ProductFactory.create(wood_type_id=wood_type2.id)
    product3 = await factories.ProductFactory.create(wood_type_id=wood_type3.id)

    # Test single wood type filter
    response = await client.get(f"{URI}?wood_type_ids={wood_type1.id}")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product1.id)

    # Test multiple wood type filter
    response = await client.get(f"{URI}?wood_type_ids={wood_type1.id}&wood_type_ids={wood_type2.id}")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 2
    found_ids = {item["id"] for item in response_data}
    assert str(product1.id) in found_ids
    assert str(product2.id) in found_ids


@pytest.mark.anyio
async def test_search_products_seller_filter(
    client: AsyncClient,
) -> None:
    """Test filtering by seller IDs."""
    # Create sellers
    seller1 = await factories.SellerFactory.create()
    seller2 = await factories.SellerFactory.create()

    # Create products with different sellers
    product1 = await factories.ProductFactory.create(seller_id=seller1.id)
    product2 = await factories.ProductFactory.create(seller_id=seller2.id)

    # Test seller filter
    response = await client.get(f"{URI}?seller_ids={seller1.id}")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product1.id)


@pytest.mark.anyio
async def test_search_products_delivery_filter(
    client: AsyncClient,
) -> None:
    """Test filtering by delivery availability."""
    # Create products with different delivery options
    product1 = await factories.ProductFactory.create(delivery_possible=True)
    product2 = await factories.ProductFactory.create(delivery_possible=False)

    # Test delivery filter
    response = await client.get(f"{URI}?delivery_possible=true")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product1.id)
    assert response_data[0]["delivery_possible"] is True


@pytest.mark.anyio
async def test_search_products_pickup_location_filter(
    client: AsyncClient,
) -> None:
    """Test filtering by pickup location availability."""
    # Create products with and without pickup location
    product1 = await factories.ProductFactory.create(pickup_location="Москва, ул. Ленина 1")
    product2 = await factories.ProductFactory.create(pickup_location=None)

    # Test has_pickup_location filter
    response = await client.get(f"{URI}?has_pickup_location=true")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product1.id)
    assert response_data[0]["pickup_location"] is not None

    # Test no pickup location filter
    response = await client.get(f"{URI}?has_pickup_location=false")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product2.id)
    assert response_data[0]["pickup_location"] is None


@pytest.mark.anyio
async def test_search_products_sorting(
    client: AsyncClient,
) -> None:
    """Test sorting functionality."""
    # Create products with different prices
    product1 = await factories.ProductFactory.create(price=3000.0, title="C Product")
    product2 = await factories.ProductFactory.create(price=1000.0, title="A Product")
    product3 = await factories.ProductFactory.create(price=2000.0, title="B Product")

    # Test sorting by price ascending
    response = await client.get(f"{URI}?sort_by=price&sort_order=asc")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 3
    assert response_data[0]["price"] == 1000.0  # product2
    assert response_data[1]["price"] == 2000.0  # product3
    assert response_data[2]["price"] == 3000.0  # product1

    # Test sorting by price descending
    response = await client.get(f"{URI}?sort_by=price&sort_order=desc")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 3
    assert response_data[0]["price"] == 3000.0  # product1
    assert response_data[1]["price"] == 2000.0  # product3
    assert response_data[2]["price"] == 1000.0  # product2

    # Test sorting by title
    response = await client.get(f"{URI}?sort_by=title&sort_order=asc")
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 3
    assert response_data[0]["title"] == "A Product"  # product2
    assert response_data[1]["title"] == "B Product"  # product3
    assert response_data[2]["title"] == "C Product"  # product1


@pytest.mark.anyio
async def test_search_products_combined_filters(
    client: AsyncClient,
) -> None:
    """Test combining multiple filters."""
    # Create wood type and seller
    wood_type = await factories.WoodTypeFactory.create()
    seller = await factories.SellerFactory.create()

    # Create products with various combinations
    product1 = await factories.ProductFactory.create(
        title="Дубовые доски премиум",
        price=2500.0,
        volume=1.2,
        wood_type_id=wood_type.id,
        seller_id=seller.id,
        delivery_possible=True
    )
    product2 = await factories.ProductFactory.create(
        title="Сосновые доски",
        price=1500.0,
        volume=0.8,
        delivery_possible=False
    )

    # Test combined filters
    response = await client.get(
        f"{URI}?search_query=дуб&price_min=2000&volume_min=1.0&"
        f"wood_type_ids={wood_type.id}&delivery_possible=true&sort_by=price"
    )
    assert response.status_code == 200
    
    response_data = response.json()["data"]
    assert len(response_data) == 1
    assert response_data[0]["id"] == str(product1.id)


@pytest.mark.anyio
async def test_search_products_pagination(
    client: AsyncClient,
) -> None:
    """Test pagination with search."""
    # Create many products
    products = await factories.ProductFactory.create_batch(25)

    # Test first page
    response = await client.get(f"{URI}?offset=0&limit=10")
    assert response.status_code == 200
    
    response_json = response.json()
    assert len(response_json["data"]) == 10
    assert response_json["pagination"]["total"] == 25

    # Test second page
    response = await client.get(f"{URI}?offset=10&limit=10")
    assert response.status_code == 200
    
    response_json = response.json()
    assert len(response_json["data"]) == 10
    assert response_json["pagination"]["total"] == 25

    # Test last page
    response = await client.get(f"{URI}?offset=20&limit=10")
    assert response.status_code == 200
    
    response_json = response.json()
    assert len(response_json["data"]) == 5
    assert response_json["pagination"]["total"] == 25


@pytest.mark.anyio
async def test_search_products_empty_results(
    client: AsyncClient,
) -> None:
    """Test search with no matching results."""
    # Create some products
    await factories.ProductFactory.create_batch(3)

    # Search for non-existent term
    response = await client.get(f"{URI}?search_query=nonexistent")
    assert response.status_code == 200
    
    response_json = response.json()
    assert len(response_json["data"]) == 0
    assert response_json["pagination"]["total"] == 0


@pytest.mark.anyio
async def test_search_products_invalid_parameters(
    client: AsyncClient,
) -> None:
    """Test search with invalid parameters."""
    # Test invalid sort field
    response = await client.get(f"{URI}?sort_by=invalid_field")
    assert response.status_code == 422  # Validation error

    # Test negative price
    response = await client.get(f"{URI}?price_min=-100")
    assert response.status_code == 422  # Validation error

    # Test invalid UUID
    response = await client.get(f"{URI}?wood_type_ids=invalid-uuid")
    assert response.status_code == 422  # Validation error
