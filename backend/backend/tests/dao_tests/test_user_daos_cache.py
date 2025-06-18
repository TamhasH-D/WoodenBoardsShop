import pytest
from uuid_extensions import uuid7, Uuid # type: ignore
from unittest.mock import AsyncMock, MagicMock

# DAOs
from backend.daos.seller_daos import SellerDAO
from backend.daos.buyer_daos import BuyerDAO

# DTOs
from backend.dtos.seller_dtos import SellerOutDTO
from backend.dtos.buyer_dtos import BuyerOutDTO

# Models
from backend.models.seller_models import Seller
from backend.models.buyer_models import Buyer

# Fixtures

@pytest.fixture
def db_session_mock():
    session = MagicMock(spec=AsyncMock)
    session.execute = AsyncMock()
    # Add flush, commit, rollback if specific DAO methods under test use them directly
    # and are not mocked out at a higher level (like super().create)
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
        user_id=uuid7(), # Assuming user_id is still relevant from model def
        company_name="Test Seller Co.",
        # Add other required fields for Seller model
    )

@pytest.fixture
def seller_out_dto_fixture(seller_model_fixture: Seller) -> SellerOutDTO:
    return SellerOutDTO.model_validate(seller_model_fixture)

# Buyer Fixtures
@pytest.fixture
def buyer_model_fixture(keycloak_uuid_fixture: Uuid) -> Buyer:
    return Buyer(
        id=uuid7(),
        keycloak_uuid=keycloak_uuid_fixture,
        user_id=uuid7(), # Assuming user_id is still relevant
        # Add other required fields for Buyer model
        company_name="Test Buyer Co.", # Example field
    )

@pytest.fixture
def buyer_out_dto_fixture(buyer_model_fixture: Buyer) -> BuyerOutDTO:
    return BuyerOutDTO.model_validate(buyer_model_fixture)


# SellerDAO Tests for get_by_keycloak_uuid

@pytest.mark.asyncio
async def test_get_seller_by_keycloak_uuid_first_call_caches(
    mocker, db_session_mock: MagicMock, seller_model_fixture: Seller, seller_out_dto_fixture: SellerOutDTO, keycloak_uuid_fixture: Uuid
):
    # Arrange
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    # Mock the filter_first call which get_by_keycloak_uuid uses internally
    # filter_first returns a model instance or None
    # For this test, assume filter_first is part of the SellerDAO class, not BaseDAO, if it's specific
    # Or if it's BaseDAO.filter_first, mock that if necessary.
    # SellerDAO.get_by_keycloak_uuid calls self.filter_first(keycloak_uuid=keycloak_uuid)
    # BaseDAO.filter_first executes a select query.
    db_session_mock.execute.return_value.scalars.return_value.first.return_value = seller_model_fixture

    seller_dao = SellerDAO(db_session_mock)
    expected_cache_key = f"Seller_keycloak:{keycloak_uuid_fixture}"

    # Act
    result_dto = await seller_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=SellerOutDTO)

    # Assert
    mock_cache_get.assert_called_once_with(expected_cache_key, SellerOutDTO)
    db_session_mock.execute.assert_called_once() # filter_first should trigger a DB call
    mock_cache_set.assert_called_once_with(expected_cache_key, seller_out_dto_fixture)
    assert result_dto == seller_out_dto_fixture

@pytest.mark.asyncio
async def test_get_seller_by_keycloak_uuid_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, seller_out_dto_fixture: SellerOutDTO, keycloak_uuid_fixture: Uuid
):
    # Arrange
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=seller_out_dto_fixture)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    seller_dao = SellerDAO(db_session_mock)
    expected_cache_key = f"Seller_keycloak:{keycloak_uuid_fixture}"

    # Act
    result_dto = await seller_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=SellerOutDTO)

    # Assert
    mock_cache_get.assert_called_once_with(expected_cache_key, SellerOutDTO)
    db_session_mock.execute.assert_not_called() # DB should not be hit
    mock_cache_set.assert_not_called() # Cache should not be set again
    assert result_dto == seller_out_dto_fixture


# BuyerDAO Tests for get_by_keycloak_uuid

@pytest.mark.asyncio
async def test_get_buyer_by_keycloak_uuid_first_call_caches(
    mocker, db_session_mock: MagicMock, buyer_model_fixture: Buyer, buyer_out_dto_fixture: BuyerOutDTO, keycloak_uuid_fixture: Uuid
):
    # Arrange
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    db_session_mock.execute.return_value.scalars.return_value.first.return_value = buyer_model_fixture

    buyer_dao = BuyerDAO(db_session_mock)
    expected_cache_key = f"Buyer_keycloak:{keycloak_uuid_fixture}"

    # Act
    result_dto = await buyer_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=BuyerOutDTO)

    # Assert
    mock_cache_get.assert_called_once_with(expected_cache_key, BuyerOutDTO)
    db_session_mock.execute.assert_called_once()
    mock_cache_set.assert_called_once_with(expected_cache_key, buyer_out_dto_fixture)
    assert result_dto == buyer_out_dto_fixture

@pytest.mark.asyncio
async def test_get_buyer_by_keycloak_uuid_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, buyer_out_dto_fixture: BuyerOutDTO, keycloak_uuid_fixture: Uuid
):
    # Arrange
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=buyer_out_dto_fixture)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    buyer_dao = BuyerDAO(db_session_mock)
    expected_cache_key = f"Buyer_keycloak:{keycloak_uuid_fixture}"

    # Act
    result_dto = await buyer_dao.get_by_keycloak_uuid(keycloak_uuid_fixture, out_dto_class=BuyerOutDTO)

    # Assert
    mock_cache_get.assert_called_once_with(expected_cache_key, BuyerOutDTO)
    db_session_mock.execute.assert_not_called()
    mock_cache_set.assert_not_called()
    assert result_dto == buyer_out_dto_fixture
```
