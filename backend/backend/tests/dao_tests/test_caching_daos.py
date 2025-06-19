import pytest
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession
from fakeredis.aioredis import FakeRedis # For type hinting

from backend.daos.wood_type_daos import WoodTypeDAO
from backend.daos.product_daos import ProductDAO
from backend.dtos.wood_type_dtos import WoodTypeInputDTO, WoodTypeUpdateDTO, WoodTypeDTO
from backend.dtos.product_dtos import ProductInputDTO, ProductUpdateDTO, ProductFullDTO, ProductFilterDTO
from backend.dtos import PaginationParams, PaginationParamsSortBy, OffsetResults
from backend.models.wood_type_models import WoodType
from backend.models.product_models import Product
from backend.settings import settings

# Fixtures to provide DAO instances with caching enabled
@pytest.fixture
async def wood_type_dao_cached(db_session: AsyncSession, mock_redis: FakeRedis) -> WoodTypeDAO:
    # Ensure mock_redis is flushed before each test using this DAO
    await mock_redis.flushall()
    return WoodTypeDAO(session=db_session, redis_client=mock_redis)

@pytest.fixture
async def product_dao_cached(db_session: AsyncSession, mock_redis: FakeRedis) -> ProductDAO:
    # Ensure mock_redis is flushed before each test using this DAO
    await mock_redis.flushall()
    return ProductDAO(session=db_session, redis_client=mock_redis)

# Helper to create a WoodType instance in DB (similar to factories if they exist)
async def create_test_wood_type(wood_type_dao: WoodTypeDAO, name: str = "Test Wood") -> WoodTypeDTO:
    input_dto = WoodTypeInputDTO(name=name, description="A test wood type")
    # The DAO's create method returns a Model instance, not DTO.
    # BaseDAO.out_dto is WoodTypeDTO, so get_by_id will return WoodTypeDTO
    # For consistency in tests, let's fetch it back via get_by_id after creation if we need the DTO
    # However, the create method itself does not return DTO.
    # For simplicity, we'll just create and assume it's there for subsequent tests.
    # The actual created model object is needed for its ID.
    created_model = await wood_type_dao.create(input_dto)
    await wood_type_dao.session.commit() # Commit to make it available for subsequent queries in the same test
    # To get the DTO, we'd typically call get_by_id, which also tests caching.
    # For now, let's return the model and tests can fetch DTO if needed.
    # Or, more simply, fetch the DTO representation directly
    # wood_type_dto = WoodTypeDTO.model_validate(created_model)
    # return wood_type_dto
    # Let's use get_by_id which uses the out_dto
    # This also populates the cache for the created item if get_by_id is called.
    # For creating test data, we might not want to immediately cache.
    # So, returning model instance and its ID is fine.
    return created_model # This is a Model instance

async def create_test_product(
    product_dao: ProductDAO,
    wood_type_id: uuid4,
    seller_id: uuid4, # Assuming seller_id is UUID for simplicity in tests
    title: str = "Test Product"
) -> Product:
    input_dto = ProductInputDTO(
        title=title,
        description="A test product",
        wood_type_id=wood_type_id,
        seller_id=seller_id, # This needs to exist or be mocked if FKs are checked
        price=100.0,
        volume=1.0,
        board_height=10.0,
        board_length=100.0,
    )
    created_model = await product_dao.create(input_dto)
    await product_dao.session.commit()
    return created_model

# --- Tests for BaseDAO.get_by_id ---
@pytest.mark.asyncio
async def test_get_by_id_cache_miss_then_hit(
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    # Create item in DB
    wood_type_model = await create_test_wood_type(wood_type_dao_cached, name="CacheMissHitWood")
    item_id = wood_type_model.id

    # 1. Cache Miss
    # Ensure cache is empty for this item
    assert await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}") is None

    # Call get_by_id for the first time
    # This is WoodTypeDTO because wood_type_dao_cached.out_dto is WoodTypeDTO
    fetched_item_dto = await wood_type_dao_cached.get_by_id(item_id)
    assert fetched_item_dto is not None
    assert fetched_item_dto.id == item_id
    assert fetched_item_dto.name == "CacheMissHitWood"

    # Assert data is in Redis (serialized DTO)
    cached_value_bytes = await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}")
    assert cached_value_bytes is not None
    # Compare with the DTO that should have been cached
    expected_cached_dto = WoodTypeDTO.model_validate(wood_type_model) # Create DTO from original model
    assert WoodTypeDTO.model_validate_json(cached_value_bytes) == expected_cached_dto

    # (Optional: Mock DB session execute to check it was called once)
    # For simplicity, we're relying on cache content checks.

    # 2. Cache Hit
    # Call get_by_id again
    fetched_item_dto_again = await wood_type_dao_cached.get_by_id(item_id)
    assert fetched_item_dto_again is not None
    assert fetched_item_dto_again == fetched_item_dto # Should be identical to the first fetch

    # (Optional: Assert DB session execute was NOT called again)
    # Assert that the cached value is still the same (not strictly necessary here, but good for sanity)
    cached_value_bytes_again = await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}")
    assert cached_value_bytes_again == cached_value_bytes

@pytest.mark.asyncio
async def test_get_by_id_cache_invalidation_on_update(
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    # Create item & populate cache
    wood_type_model = await create_test_wood_type(wood_type_dao_cached, name="UpdateInvalidationWood")
    item_id = wood_type_model.id
    await wood_type_dao_cached.get_by_id(item_id) # Populates cache
    assert await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}") is not None

    # Update item
    update_dto = WoodTypeUpdateDTO(name="Updated Wood Name")
    await wood_type_dao_cached.update(item_id, update_dto)
    await wood_type_dao_cached.session.commit()


    # Assert cache is invalidated
    assert await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}") is None

    # Fetch again, should be a cache miss and repopulate
    fetched_item_dto = await wood_type_dao_cached.get_by_id(item_id)
    assert fetched_item_dto is not None
    assert fetched_item_dto.name == "Updated Wood Name"
    assert await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}") is not None

@pytest.mark.asyncio
async def test_get_by_id_cache_invalidation_on_delete(
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    # Create item & populate cache
    wood_type_model = await create_test_wood_type(wood_type_dao_cached, name="DeleteInvalidationWood")
    item_id = wood_type_model.id
    await wood_type_dao_cached.get_by_id(item_id) # Populates cache
    assert await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}") is not None

    # Delete item
    await wood_type_dao_cached.delete_by_id(item_id)
    await wood_type_dao_cached.session.commit()

    # Assert cache is invalidated
    assert await mock_redis.get(f"BaseDAO:WoodType:id:{item_id}") is None

# --- Tests for BaseDAO.get_offset_results (using WoodTypeDAO) ---
@pytest.mark.asyncio
async def test_get_offset_results_cache_miss_then_hit(
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    # Create a few items
    await create_test_wood_type(wood_type_dao_cached, name="Wood A")
    await create_test_wood_type(wood_type_dao_cached, name="Wood B")

    pagination = PaginationParams(limit=10, offset=0)
    # BaseDAO uses default sort 'created_at' asc if not specified by PaginationParamsSortBy
    # The cache key in BaseDAO get_offset_results includes sort_info = "" if not PaginationParamsSortBy
    # Let's use PaginationParamsSortBy for a more complete key test
    pagination_sorted = PaginationParamsSortBy(limit=10, offset=0, sort_by="name", sort_order="asc")

    cache_key = f"BaseDAO:WoodType:all_paginated:limit:{pagination_sorted.limit}:offset:{pagination_sorted.offset}:sort_by:name:sort_order:asc"

    # 1. Cache Miss
    assert await mock_redis.get(cache_key) is None
    results_miss = await wood_type_dao_cached.get_offset_results(pagination_sorted)
    assert len(results_miss.data) >= 2 # Could be more if other tests ran without flushing DB state fully

    cached_value_offset = await mock_redis.get(cache_key)
    assert cached_value_offset is not None
    # We can validate the content if needed by parsing JSON, like in get_by_id test

    # 2. Cache Hit
    results_hit = await wood_type_dao_cached.get_offset_results(pagination_sorted)
    assert results_hit == results_miss # Pydantic models should compare equal

    # Ensure it's still in cache
    assert await mock_redis.get(cache_key) is not None


@pytest.mark.asyncio
async def test_get_offset_results_cache_invalidation_on_create(
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    # Default pagination used in BaseDAO for invalidation
    default_limit = 10
    default_offset = 0
    # Default sort determined by BaseDAO._apply_sort logic if not specified
    # which is 'created_at' then 'id', and default order 'asc'
    # The invalidation key in BaseDAO.create uses:
    # default_sort_by = 'created_at' if hasattr(self.model, 'created_at') else 'id'
    # default_sort_order = 'asc'
    # So, we need to know if WoodType has 'created_at'
    # Assuming WoodType has 'created_at' (it's common in Base model)
    default_sort_by = "created_at" # Based on BaseDAO invalidation logic
    default_sort_order = "asc"

    # This is the specific key BaseDAO attempts to invalidate on create/update/delete
    cache_key_to_invalidate = f"BaseDAO:WoodType:all_paginated:limit:{default_limit}:offset:{default_offset}:sort_by:{default_sort_by}:sort_order:{default_sort_order}"

    # Populate this specific cache entry
    # Need to ensure WoodType model has 'created_at' for this sort to be valid, or adjust sort_by
    # For the test, we can use a sort order that is definitely present, e.g. by 'name' or 'id'
    # However, we want to test the *actual invalidation key used by BaseDAO*.
    # Let's assume 'created_at' exists for WoodType.
    pagination_for_setup = PaginationParamsSortBy(
        limit=default_limit, offset=default_offset, sort_by=default_sort_by, sort_order=default_sort_order
    )
    await wood_type_dao_cached.get_offset_results(pagination_for_setup)
    assert await mock_redis.get(cache_key_to_invalidate) is not None

    # Create a new item
    await create_test_wood_type(wood_type_dao_cached, name="Wood C for Invalidation")

    # Assert that the specific default cache key was invalidated
    assert await mock_redis.get(cache_key_to_invalidate) is None


# --- Tests for ProductDAO.get_filtered_results ---
@pytest.mark.asyncio
async def test_get_filtered_results_cache_miss_then_hit(
    product_dao_cached: ProductDAO,
    wood_type_dao_cached: WoodTypeDAO, # For creating a prerequisite WoodType
    mock_redis: FakeRedis
):
    # Prerequisite: Create a WoodType
    test_wood_type = await create_test_wood_type(wood_type_dao_cached, name="FILTER_WOOD")
    test_seller_id = uuid4()

    # Create a product
    await create_test_product(
        product_dao_cached,
        wood_type_id=test_wood_type.id,
        seller_id=test_seller_id,
        title="Filtered Product A"
    )

    filters = ProductFilterDTO(wood_type_ids=[test_wood_type.id])
    pagination = PaginationParamsSortBy(limit=5, offset=0, sort_by="title", sort_order="asc")

    filters_json = filters.model_dump_json(exclude_defaults=True)
    sort_info = f":sort_by:{pagination.sort_by}:sort_order:{pagination.sort_order}"
    cache_key = f"ProductDAO:filtered:filters:{filters_json}:pagination:{pagination.limit}:{pagination.offset}{sort_info}"

    # 1. Cache Miss
    assert await mock_redis.get(cache_key) is None
    results_miss = await product_dao_cached.get_filtered_results(pagination, filters)
    assert len(results_miss.data) >= 1
    assert results_miss.data[0].title == "Filtered Product A"

    assert await mock_redis.get(cache_key) is not None

    # 2. Cache Hit
    results_hit = await product_dao_cached.get_filtered_results(pagination, filters)
    assert results_hit == results_miss


def get_product_dao_default_filtered_cache_key(product_dao: ProductDAO) -> str:
    """Helper to construct the cache key ProductDAO invalidates for default filtered results."""
    default_filters = ProductFilterDTO()
    filters_json = default_filters.model_dump_json(exclude_defaults=True)
    default_limit = 10
    default_offset = 0
    default_sort_by = "created_at" # Must match _invalidate_default_filtered_cache in ProductDAO
    default_sort_order = "desc"  # Must match _invalidate_default_filtered_cache in ProductDAO
    default_sort_info = f":sort_by:{default_sort_by}:sort_order:{default_sort_order}"
    return f"ProductDAO:filtered:filters:{filters_json}:pagination:{default_limit}:{default_offset}{default_sort_info}"

@pytest.mark.asyncio
async def test_get_filtered_results_cache_invalidation_on_create(
    product_dao_cached: ProductDAO,
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    test_wood_type = await create_test_wood_type(wood_type_dao_cached, name="FILTER_CREATE_WOOD")
    test_seller_id = uuid4()

    # Define default filters and pagination to match what _invalidate_default_filtered_cache uses
    default_filters_dto = ProductFilterDTO()
    default_pagination = PaginationParamsSortBy(limit=10, offset=0, sort_by="created_at", sort_order="desc")

    # Populate this default cache
    await product_dao_cached.get_filtered_results(default_pagination, default_filters_dto)
    default_cache_key = get_product_dao_default_filtered_cache_key(product_dao_cached)
    assert await mock_redis.get(default_cache_key) is not None

    # Create a new product
    await create_test_product(
        product_dao_cached,
        wood_type_id=test_wood_type.id,
        seller_id=test_seller_id,
        title="Product For Filter Invalidation Create"
    )

    # Assert the default filtered cache was invalidated
    assert await mock_redis.get(default_cache_key) is None

@pytest.mark.asyncio
async def test_get_filtered_results_cache_invalidation_on_update(
    product_dao_cached: ProductDAO,
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    test_wood_type = await create_test_wood_type(wood_type_dao_cached, name="FILTER_UPDATE_WOOD")
    test_seller_id = uuid4()
    product_to_update = await create_test_product(
        product_dao_cached,
        wood_type_id=test_wood_type.id,
        seller_id=test_seller_id,
        title="Product Before Update Filter Invalidation"
    )

    default_filters_dto = ProductFilterDTO()
    default_pagination = PaginationParamsSortBy(limit=10, offset=0, sort_by="created_at", sort_order="desc")
    await product_dao_cached.get_filtered_results(default_pagination, default_filters_dto)
    default_cache_key = get_product_dao_default_filtered_cache_key(product_dao_cached)
    assert await mock_redis.get(default_cache_key) is not None

    # Update the product
    update_dto = ProductUpdateDTO(title="Product After Update Filter Invalidation")
    await product_dao_cached.update(product_to_update.id, update_dto)
    await product_dao_cached.session.commit()

    assert await mock_redis.get(default_cache_key) is None

@pytest.mark.asyncio
async def test_get_filtered_results_cache_invalidation_on_delete(
    product_dao_cached: ProductDAO,
    wood_type_dao_cached: WoodTypeDAO,
    mock_redis: FakeRedis
):
    test_wood_type = await create_test_wood_type(wood_type_dao_cached, name="FILTER_DELETE_WOOD")
    test_seller_id = uuid4()
    product_to_delete = await create_test_product(
        product_dao_cached,
        wood_type_id=test_wood_type.id,
        seller_id=test_seller_id,
        title="Product Before Delete Filter Invalidation"
    )

    default_filters_dto = ProductFilterDTO()
    default_pagination = PaginationParamsSortBy(limit=10, offset=0, sort_by="created_at", sort_order="desc")
    await product_dao_cached.get_filtered_results(default_pagination, default_filters_dto)
    default_cache_key = get_product_dao_default_filtered_cache_key(product_dao_cached)
    assert await mock_redis.get(default_cache_key) is not None

    # Delete the product
    await product_dao_cached.delete_by_id(product_to_delete.id)
    await product_dao_cached.session.commit()

    assert await mock_redis.get(default_cache_key) is None
