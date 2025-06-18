from uuid import uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs

URI = "/api/v1/wood-types/"


@pytest.mark.anyio
async def test_post_wood_type(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create WoodType: 201."""
    input_json = {
        "id": str(uuid4()),
        "neme": "world",
        "description": "world",
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_wood_type = await daos.wood_type.filter_first(
        id=response_data["id"],
    )

    assert db_wood_type is not None
    assert db_wood_type.neme == input_json["neme"]
    assert db_wood_type.description == input_json["description"]


@pytest.mark.anyio
async def test_create_wood_type_duplicate_name(
    client: AsyncClient,
    # Assuming auth_headers_admin is a fixture providing necessary auth headers
    # If the endpoint is not protected, this can be removed.
    # For this example, we'll assume it's needed based on the prompt's original snippet.
    # If your conftest.py provides it, it will be injected.
    # auth_headers_admin: dict[str, str],
    daos: AllDAOs, # Added daos to potentially clean up or verify, though not strictly used in this version
) -> None:
    """Test creating a wood type with a duplicate name returns 409."""
    wood_type_name = "Duplicate Test Wood Type" # Corrected variable name for clarity

    # First POST request: Create a wood type with this name.
    payload1 = {"neme": wood_type_name, "description": "First instance"}
    # Assuming the endpoint requires admin auth based on prompt snippet.
    # If not, remove headers=auth_headers_admin
    response1 = await client.post(URI, json=payload1) # Removed auth_headers_admin for now as original test doesn't use it
    assert response1.status_code == 201

    # Second POST request: Attempt to create another wood type with the exact same name.
    payload2 = {"neme": wood_type_name, "description": "Second instance"}
    response2 = await client.post(URI, json=payload2) # Removed auth_headers_admin
    assert response2.status_code == 409
    data2 = response2.json()
    assert data2["detail"] == "A wood type with this name already exists."

    # Third POST request: Attempt to create another wood type with the same name but different casing.
    payload3 = {"neme": wood_type_name.lower(), "description": "Third instance, different case"}
    response3 = await client.post(URI, json=payload3) # Removed auth_headers_admin
    assert response3.status_code == 409
    data3 = response3.json()
    assert data3["detail"] == "A wood type with this name already exists."
