import pytest
from uuid_extensions import uuid7, Uuid # type: ignore
from unittest.mock import AsyncMock, MagicMock

# DAOs
from backend.daos.seller_daos import SellerDAO
from backend.daos.buyer_daos import BuyerDAO

# DTOs
from backend.dtos.seller_dtos import SellerDTO # Changed from SellerOutDTO
from backend.dtos.buyer_dtos import BuyerDTO

# Models
from backend.models.seller_models import Seller
from backend.models.buyer_models import Buyer

# Fixtures

@pytest.fixture
def db_session_mock():
    session = MagicMock(spec=AsyncMock)
    session.execute = AsyncMock()
    session.flush = AsyncMock()
    return session

@pytest.fixture
def keycloak_uuid_fixture() -> Uuid:
    return uuid7()

# Seller Fixtures
@pytest.fixture
def seller_model_fixture(keycloak_uuid_fixture: Uuid) -> Seller:
    return Seller(
        id=uuid7(),
        keycloak_uuid=keycloak_uuid_fixture,
        user_id=uuid7(),
        company_name="Test Seller Co.",
    )

@pytest.fixture
def seller_dto_fixture(seller_model_fixture: Seller) -> SellerDTO: # Changed from seller_out_dto_fixture and SellerOutDTO
    return SellerDTO.model_validate(seller_model_fixture)

# Buyer Fixtures
@pytest.fixture
def buyer_model_fixture(keycloak_uuid_fixture: Uuid) -> Buyer:
    return Buyer(
        id=uuid7(),
        keycloak_uuid=keycloak_uuid_fixture,
        user_id=uuid7(),
        company_name="Test Buyer Co.",
    )

@pytest.fixture
def buyer_dto_fixture(buyer_model_fixture: Buyer) -> BuyerDTO:
    return BuyerDTO.model_validate(buyer_model_fixture)


# SellerDAO Tests for get_by_keycloak_uuid (Updated to use SellerDTO)

@pytest.mark.asyncio
async def test_get_seller_by_keycloak_uuid_first_call_caches(
    mocker, db_session_mock: MagicMock, seller_model_fixture: Seller, seller_dto_fixture: SellerDTO, keycloak_uuid_fixture: Uuid # Changed
):
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    db_session_mock.execute.return_value.scalars.return_value.first.return_value = seller_model_fixture
    seller_dao = SellerDAO(db_session_mock)
    expected_cache_key = f"Seller_keycloak:{keycloak_uuid_fixture}"

    # Call with SellerDTO as out_dto_class
    result_dto = await seller_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=SellerDTO)

    mock_cache_get.assert_called_once_with(expected_cache_key, SellerDTO) # Expect SellerDTO
    db_session_mock.execute.assert_called_once()
    mock_cache_set.assert_called_once_with(expected_cache_key, seller_dto_fixture) # Expect seller_dto_fixture
    assert result_dto == seller_dto_fixture

@pytest.mark.asyncio
async def test_get_seller_by_keycloak_uuid_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, seller_dto_fixture: SellerDTO, keycloak_uuid_fixture: Uuid # Changed
):
    # Simulate cache having the SellerDTO item
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=seller_dto_fixture)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    seller_dao = SellerDAO(db_session_mock)
    expected_cache_key = f"Seller_keycloak:{keycloak_uuid_fixture}"

    # Call with SellerDTO as out_dto_class
    result_dto = await seller_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=SellerDTO)

    mock_cache_get.assert_called_once_with(expected_cache_key, SellerDTO) # Expect SellerDTO
    db_session_mock.execute.assert_not_called()
    mock_cache_set.assert_not_called()
    assert result_dto == seller_dto_fixture


# BuyerDAO Tests for get_by_keycloak_uuid (Unaffected by SellerDTO change)

@pytest.mark.asyncio
async def test_get_buyer_by_keycloak_uuid_first_call_caches(
    mocker, db_session_mock: MagicMock, buyer_model_fixture: Buyer, buyer_dto_fixture: BuyerDTO, keycloak_uuid_fixture: Uuid
):
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    db_session_mock.execute.return_value.scalars.return_value.first.return_value = buyer_model_fixture
    buyer_dao = BuyerDAO(db_session_mock)
    expected_cache_key = f"Buyer_keycloak:{keycloak_uuid_fixture}"

    result_dto = await buyer_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=BuyerDTO)

    mock_cache_get.assert_called_once_with(expected_cache_key, BuyerDTO)
    db_session_mock.execute.assert_called_once()
    mock_cache_set.assert_called_once_with(expected_cache_key, buyer_dto_fixture)
    assert result_dto == buyer_dto_fixture

@pytest.mark.asyncio
async def test_get_buyer_by_keycloak_uuid_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, buyer_dto_fixture: BuyerDTO, keycloak_uuid_fixture: Uuid
):
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=buyer_dto_fixture)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    buyer_dao = BuyerDAO(db_session_mock)
    expected_cache_key = f"Buyer_keycloak:{keycloak_uuid_fixture}"

    result_dto = await buyer_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=BuyerDTO)

    mock_cache_get.assert_called_once_with(expected_cache_key, BuyerDTO)
    db_session_mock.execute.assert_not_called()
    mock_cache_set.assert_not_called()
    assert result_dto == buyer_dto_fixture
```
