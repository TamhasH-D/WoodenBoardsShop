from uuid import uuid4

import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/sellers/"
URI_BY_KEYCLOAK = "/api/v1/sellers/by-keycloak/"


@pytest.mark.anyio
async def test_get_sellers(
    client: AsyncClient,
) -> None:
    """Test get Seller: 200."""
    sellers = await factories.SellerFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for seller, data in zip(sellers, response_data, strict=True):
        assert str(seller.keycloak_uuid) == data["keycloak_uuid"]


@pytest.mark.anyio
async def test_get_seller_by_keycloak_uuid_success(
    client: AsyncClient,
) -> None:
    """Test get Seller by keycloak_uuid: 200."""
    # Create a seller using factory
    seller = await factories.SellerFactory.create()

    # Test getting seller by keycloak_uuid
    response = await client.get(f"{URI_BY_KEYCLOAK}{seller.keycloak_uuid}")

    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(seller.id)
    assert response_data["keycloak_uuid"] == str(seller.keycloak_uuid)
    assert response_data["is_online"] == seller.is_online


@pytest.mark.anyio
async def test_get_seller_by_keycloak_uuid_not_found(
    client: AsyncClient,
) -> None:
    """Test get Seller by keycloak_uuid when seller doesn't exist: 404."""
    non_existent_keycloak_uuid = uuid4()

    response = await client.get(f"{URI_BY_KEYCLOAK}{non_existent_keycloak_uuid}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Seller not found"


@pytest.mark.anyio
async def test_get_seller_by_keycloak_uuid_invalid_uuid(
    client: AsyncClient,
) -> None:
    """Test get Seller by keycloak_uuid with invalid UUID format: 422."""
    invalid_uuid = "not-a-valid-uuid"

    response = await client.get(f"{URI_BY_KEYCLOAK}{invalid_uuid}")

    assert response.status_code == 422
