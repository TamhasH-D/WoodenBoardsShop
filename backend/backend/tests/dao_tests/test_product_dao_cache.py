import pytest
import json
from uuid_extensions import uuid7, Uuid
from unittest.mock import AsyncMock, MagicMock, patch

from backend.daos.product_daos import ProductDAO
from backend.dtos.product_dtos import ProductOutDTO, ProductUpdateDTO, ProductFilterDTO
from backend.dtos import OffsetPaginationMetadata, OffsetResults, PaginationParams, PaginationParamsSortBy
from backend.models.product_models import Product
from backend.models.seller_models import Seller # Needed for Product.seller
from backend.models.wood_type_models import WoodType # Needed for Product.wood_type

# Fixtures

@pytest.fixture
def db_session_mock():
    session = MagicMock(spec=AsyncMock) # Using AsyncMock for session if methods are async
    session.execute = AsyncMock()
    session.flush = AsyncMock()
    session.commit = AsyncMock()
    session.rollback = AsyncMock()
    return session

@pytest.fixture
def product_id_fixture() -> Uuid:
    return uuid7()

@pytest.fixture
def seller_fixture() -> Seller:
    return Seller(
        id=uuid7(),
        user_id=uuid7(),
        company_name="Test Seller Inc.",
        company_registration_number="123456789",
        company_address="123 Test St, Testville",
        company_phone_number="+1234567890",
        contact_email="seller@example.com",
        website_url="http://testseller.com",
        description="A test seller.",
        approved=True,
    )

@pytest.fixture
def wood_type_fixture() -> WoodType:
    return WoodType(
        id=uuid7(),
        name="Test Oak",
        description="A durable and beautiful test wood.",
        hardness_level=8,
        density_g_cm3=0.75,
        conductivity_w_mk=0.16,
        image_id=None,
    )

@pytest.fixture
def product_fixture(product_id_fixture: Uuid, seller_fixture: Seller, wood_type_fixture: WoodType) -> Product:
    return Product(
        id=product_id_fixture,
        title="Test Product",
        description="A beautiful test product made of Test Oak.",
        price=100.50,
        volume=1.5,
        wood_type_id=wood_type_fixture.id,
        seller_id=seller_fixture.id,
        delivery_possible=True,
        pickup_location="Test Location, Test City",
        # Relationships - these might not be needed for DAO layer if not directly accessed
        # but good for completeness if model_validate expects them or they are part of DTOs
        seller=seller_fixture,
        wood_type=wood_type_fixture,
    )

@pytest.fixture
def product_out_dto_fixture(product_fixture: Product) -> ProductOutDTO:
    # Assuming ProductOutDTO can be created via model_validate from Product
    # and handles relationships correctly if they are part of ProductOutDTO
    return ProductOutDTO.model_validate(product_fixture)


# Tests for get_by_id caching (BaseDAO via ProductDAO)

@pytest.mark.asyncio
async def test_get_product_by_id_first_call_caches_result(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    # Arrange
    product_id = product_fixture.id

    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    db_session_mock.execute.return_value.scalar_one_or_none.return_value = product_fixture

    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = f"Product:{product_id}"

    # Act: First call
    result_dto = await product_dao.get_by_id(product_id, out_dto_class=ProductOutDTO)

    # Assert: Cache miss, DB hit, cache set
    mock_cache_get.assert_called_once_with(expected_cache_key, ProductOutDTO)
    db_session_mock.execute.assert_called_once() # Check that DB was queried
    mock_cache_set.assert_called_once_with(expected_cache_key, product_out_dto_fixture)
    assert result_dto == product_out_dto_fixture

@pytest.mark.asyncio
async def test_get_product_by_id_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    # Arrange
    product_id = product_fixture.id

    # Simulate cache having the item
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=product_out_dto_fixture)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    db_session_mock.execute.return_value.scalar_one_or_none.return_value = product_fixture # DB should not be hit ideally

    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = f"Product:{product_id}"

    # Act: Call get_by_id (simulating it's the second call due to cache mock)
    retrieved_product = await product_dao.get_by_id(product_id, out_dto_class=ProductOutDTO)

    # Assert: Cache hit, no DB interaction, no new cache set
    mock_cache_get.assert_called_once_with(expected_cache_key, ProductOutDTO)
    db_session_mock.execute.assert_not_called() # Crucial: DB was not hit
    mock_cache_set.assert_not_called() # Cache should not be set again
    assert retrieved_product == product_out_dto_fixture


# Tests for update invalidates get_by_id cache

@pytest.mark.asyncio
async def test_update_product_invalidates_cache(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    # Arrange
    product_id = product_fixture.id
    update_data = ProductUpdateDTO(title="Updated Title", description="Updated Description")

    mock_cache_delete = mocker.patch('backend.cache_manager.cache_manager.delete', new_callable=AsyncMock)

    # Mock DB execute for update (to return the updated instance)
    updated_product_fixture = product_fixture.model_copy(update=update_data.model_dump(exclude_none=True))
    db_session_mock.execute.return_value.scalar_one_or_none.return_value = updated_product_fixture
    # For update, the BaseDAO's update method now uses .returning(self.model)
    # So execute directly returns an object that has scalar_one_or_none yielding the updated instance

    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = f"Product:{product_id}"

    # Act
    await product_dao.update(item_id=product_id, update_dto=update_data, out_dto_class=ProductOutDTO)

    # Assert
    db_session_mock.execute.assert_called_once() # Ensure DB update was attempted
    mock_cache_delete.assert_called_once_with(expected_cache_key)


# Tests for delete invalidates get_by_id cache

@pytest.mark.asyncio
async def test_delete_product_invalidates_cache(
    mocker, db_session_mock: MagicMock, product_fixture: Product
):
    # Arrange
    product_id = product_fixture.id

    mock_cache_delete = mocker.patch('backend.cache_manager.cache_manager.delete', new_callable=AsyncMock)

    # Mock DB execute for delete (to indicate success, rowcount > 0)
    db_session_mock.execute.return_value.rowcount = 1

    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = f"Product:{product_id}"

    # Act
    await product_dao.delete(item_id=product_id)

    # Assert
    db_session_mock.execute.assert_called_once() # Ensure DB delete was attempted
    mock_cache_delete.assert_called_once_with(expected_cache_key)


# Placeholder for get_filtered_results tests - to be expanded
# These tests will be more complex due to cache key generation

def generate_product_filter_cache_key(filters_dto: ProductFilterDTO, pagination_dto: PaginationParams, out_dto_class_name: str) -> str:
    """Helper to generate cache keys consistently with the DAO."""
    cache_key_payload = {
        "filters": filters_dto.model_dump(exclude_none=True),
        "pagination": pagination_dto.model_dump(exclude_none=True),
        "out_dto_class": out_dto_class_name
    }
    sorted_payload_str = json.dumps(cache_key_payload, sort_keys=True)
    # This must match the DAO's hashing. Python's hash() is not stable.
    # For testing, if we mock cache_manager.get/set, exact hash value doesn't matter as much as consistency.
    # However, if the DAO's hash() is called, it will be process-specific.
    # For robust tests, we might need to patch hash() or use a stable hash in DAO and test.
    # For now, we'll assume we can predict the key or that mocking strategy handles it.
    # The DAO uses: cache_key = f"product_filter:{hash(sorted_payload_str)}"
    # We will mock the `hash` function for predictable keys in tests.
    return f"product_filter:{hash(sorted_payload_str)}" # Placeholder, see note above

@pytest.mark.asyncio
async def test_get_filtered_products_first_call_caches_result(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    # Arrange
    filters = ProductFilterDTO(search_query="Test")
    pagination = PaginationParams(offset=0, limit=10)

    # Mock hash function for predictable cache key
    # The string to be hashed:
    cache_key_payload = {
        "filters": filters.model_dump(exclude_none=True),
        "pagination": pagination.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }
    sorted_payload_str = json.dumps(cache_key_payload, sort_keys=True)
    expected_hash_value = 123456789 # Example predictable hash
    mocker.patch('builtins.hash', return_value=expected_hash_value)

    expected_cache_key = f"product_filter:{expected_hash_value}"

    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    # DB returns a list containing one product
    db_session_mock.execute.return_value.scalars.return_value = [product_fixture]
    # Mock for _compute_offset_pagination
    # It executes a count query. Let's assume total is 1.
    # This requires a more complex mock if we want to test pagination metadata precisely.
    # For now, let's simplify: _compute_offset_pagination might be called by get_filtered_results.
    # We need to ensure the session mock handles the count query as well.
    # Let's assume the count query returns 1.
    # A separate mock for the count query's execute may be needed if the main execute mock is too simple.
    # For now, we focus on the list of results and cache interaction.
    # The DAO calls _compute_offset_pagination which does its own execute.
    # We can mock _compute_offset_pagination directly if it's too complex to mock its session usage.

    # Simpler: Mock _compute_offset_pagination
    mocker.patch.object(ProductDAO, '_compute_offset_pagination', new_callable=AsyncMock, return_value=OffsetPaginationMetadata(total=1))


    product_dao = ProductDAO(db_session_mock)

    expected_results_data = [product_out_dto_fixture]
    expected_offset_results = OffsetResults[ProductOutDTO](
        data=expected_results_data,
        pagination=OffsetPaginationMetadata(total=1) # Matches the mocked _compute_offset_pagination
    )

    # Act
    results = await product_dao.get_filtered_results(
        out_dto_class=ProductOutDTO, pagination=pagination, filters=filters
    )

    # Assert
    mock_cache_get.assert_called_once_with(expected_cache_key, OffsetResults[ProductOutDTO])
    db_session_mock.execute.assert_called_once() # Main query for data
    ProductDAO._compute_offset_pagination.assert_called_once() # Pagination metadata query/logic
    mock_cache_set.assert_called_once_with(expected_cache_key, expected_offset_results)
    assert results == expected_offset_results


@pytest.mark.asyncio
async def test_get_filtered_products_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, product_out_dto_fixture: ProductOutDTO
):
    # Arrange
    filters = ProductFilterDTO(search_query="Test")
    pagination = PaginationParams(offset=0, limit=10)

    cache_key_payload = {
        "filters": filters.model_dump(exclude_none=True),
        "pagination": pagination.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }
    sorted_payload_str = json.dumps(cache_key_payload, sort_keys=True)
    expected_hash_value = 123456789 # Must be same as in first_call test
    mocker.patch('builtins.hash', return_value=expected_hash_value)

    expected_cache_key = f"product_filter:{expected_hash_value}"

    # Expected cached object
    expected_offset_results = OffsetResults[ProductOutDTO](
        data=[product_out_dto_fixture],
        pagination=OffsetPaginationMetadata(total=1)
    )

    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=expected_offset_results)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    mock_compute_pagination = mocker.patch.object(ProductDAO, '_compute_offset_pagination', new_callable=AsyncMock)


    product_dao = ProductDAO(db_session_mock)

    # Act
    results = await product_dao.get_filtered_results(
        out_dto_class=ProductOutDTO, pagination=pagination, filters=filters
    )

    # Assert
    mock_cache_get.assert_called_once_with(expected_cache_key, OffsetResults[ProductOutDTO])
    db_session_mock.execute.assert_not_called() # DB not hit for data
    mock_compute_pagination.assert_not_called() # Pagination logic also skipped
    mock_cache_set.assert_not_called()
    assert results == expected_offset_results

@pytest.mark.asyncio
async def test_get_filtered_products_different_filters_miss_cache(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    # Arrange - First call with filters_A
    filters_A = ProductFilterDTO(search_query="TestA")
    pagination_A = PaginationParams(offset=0, limit=10)

    payload_A_str = json.dumps({
        "filters": filters_A.model_dump(exclude_none=True),
        "pagination": pagination_A.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }, sort_keys=True)
    hash_A = 11111
    key_A = f"product_filter:{hash_A}"

    results_A = OffsetResults[ProductOutDTO](data=[product_out_dto_fixture], pagination=OffsetPaginationMetadata(total=1))

    # Arrange - Second call with filters_B
    filters_B = ProductFilterDTO(search_query="TestB") # Different filter
    pagination_B = PaginationParams(offset=0, limit=10)
    payload_B_str = json.dumps({
        "filters": filters_B.model_dump(exclude_none=True),
        "pagination": pagination_B.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }, sort_keys=True)
    hash_B = 22222
    key_B = f"product_filter:{hash_B}"

    # Mock hash to return different values for different payloads
    def side_effect_hash(s):
        if s == payload_A_str: return hash_A
        if s == payload_B_str: return hash_B
        return hash(s) # Default for other calls if any

    mocker.patch('builtins.hash', side_effect=side_effect_hash)

    # Cache get: returns None for key_B, might return results_A for key_A
    async def mock_cache_get_side_effect(key, model_class):
        if key == key_A: return results_A # For a potential first call if not resetting mocks
        if key == key_B: return None # Cache miss for key_B
        return None

    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, side_effect=mock_cache_get_side_effect)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)

    db_session_mock.execute.return_value.scalars.return_value = [product_fixture] # DB result for key_B call
    mocker.patch.object(ProductDAO, '_compute_offset_pagination', new_callable=AsyncMock, return_value=OffsetPaginationMetadata(total=1))

    product_dao = ProductDAO(db_session_mock)

    # Act: Call with filters_B (simulating cache miss for B, potentially hit/miss for A depending on test setup)
    # This test specifically checks that filters_B causes a DB fetch.
    await product_dao.get_filtered_results(out_dto_class=ProductOutDTO, pagination=pagination_B, filters=filters_B)

    # Assert: cache.get called for key_B, DB was hit for key_B, cache.set called for key_B
    # Check calls for key_B
    # Get all calls to cache_get and check if key_B was among them with the correct model
    call_args_list_get = [call_args[0] for call_args in mock_cache_get.call_args_list]
    assert (key_B, OffsetResults[ProductOutDTO]) in call_args_list_get

    db_session_mock.execute.assert_called_once() # DB hit for the call with filters_B
    ProductDAO._compute_offset_pagination.assert_called_once()

    # Check calls for cache_set
    call_args_list_set = [call_args[0] for call_args in mock_cache_set.call_args_list]
    # Ensure key_B was set with the correct results structure
    # Constructing the expected_results_B for assertion
    expected_results_B = OffsetResults[ProductOutDTO](data=[product_out_dto_fixture], pagination=OffsetPaginationMetadata(total=1))
    assert (key_B, expected_results_B) in call_args_list_set

    # Ensure key_A was not set in *this specific call sequence for key_B*
    # If test_get_filtered_products_first_call_caches_result ran before, key_A might be in cache.
    # This test ensures that a call with filters_B does not mistakenly use cache from filters_A
    # and correctly goes through the DB fetch and cache set for its own key (key_B).

    # Verify that the number of set calls is what we expect for this flow (i.e., one for key_B)
    # This depends on how you want to structure the "prime cache for A" part.
    # If we assume a clean slate for this test focusing on key_B:
    assert mock_cache_set.call_count == 1 # Only key_B should be set in this test's flow
```
