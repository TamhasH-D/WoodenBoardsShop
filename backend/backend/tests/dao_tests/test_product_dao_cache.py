import pytest
import json
from uuid_extensions import uuid7, Uuid # type: ignore
from unittest.mock import AsyncMock, MagicMock, patch, call

from backend.daos.product_daos import ProductDAO
from backend.dtos.product_dtos import ProductOutDTO, ProductUpdateDTO, ProductFilterDTO, ProductInputDTO
from backend.dtos import OffsetPaginationMetadata, OffsetResults, PaginationParams, PaginationParamsSortBy
from backend.models.product_models import Product
from backend.models.seller_models import Seller
from backend.models.wood_type_models import WoodType

# Fixtures

@pytest.fixture
def db_session_mock():
    session = MagicMock(spec=AsyncMock)
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
    # Simplified for brevity, ensure all non-Optional fields are present
    return Seller(id=uuid7(), user_id=uuid7(), company_name="Test Seller Inc.")

@pytest.fixture
def wood_type_fixture() -> WoodType:
    # Ensure 'name' is used, not 'neme'
    return WoodType(id=uuid7(), name="Test Oak", description="A test wood.")

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
        seller=seller_fixture, # For model_validate if needed
        wood_type=wood_type_fixture, # For model_validate if needed
    )

@pytest.fixture
def product_out_dto_fixture(product_fixture: Product) -> ProductOutDTO:
    return ProductOutDTO.model_validate(product_fixture)

@pytest.fixture
def product_input_dto_fixture() -> ProductInputDTO:
    return ProductInputDTO(
        title="New Test Product",
        description="Brand new product for testing.",
        price=99.99,
        volume=1.0,
        wood_type_id=uuid7(),
        seller_id=uuid7(),
        delivery_possible=True,
        pickup_location="Test Pickup Spot"
    )

# Tests for get_by_id caching (BaseDAO via ProductDAO)

@pytest.mark.asyncio
async def test_get_product_by_id_first_call_caches_result(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    product_id = product_fixture.id
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    db_session_mock.execute.return_value.scalar_one_or_none.return_value = product_fixture
    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = f"Product:{product_id}"

    result_dto = await product_dao.get_by_id(product_id, out_dto_class=ProductOutDTO)

    mock_cache_get.assert_called_once_with(expected_cache_key, ProductOutDTO)
    db_session_mock.execute.assert_called_once()
    mock_cache_set.assert_called_once_with(expected_cache_key, product_out_dto_fixture)
    assert result_dto == product_out_dto_fixture

@pytest.mark.asyncio
async def test_get_product_by_id_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    product_id = product_fixture.id
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=product_out_dto_fixture)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = f"Product:{product_id}"

    retrieved_product = await product_dao.get_by_id(product_id, out_dto_class=ProductOutDTO)

    mock_cache_get.assert_called_once_with(expected_cache_key, ProductOutDTO)
    db_session_mock.execute.assert_not_called()
    mock_cache_set.assert_not_called()
    assert retrieved_product == product_out_dto_fixture


# CUD tests check all expected cache invalidations

@pytest.mark.asyncio
async def test_create_product_invalidates_all_and_filter_caches(
    mocker, db_session_mock: MagicMock, product_input_dto_fixture: ProductInputDTO, product_fixture: Product
):
    # Arrange
    # BaseDAO.create will be called, it adds to session and flushes.
    # We don't need to mock session.add or the model instantiation if input_dto is okay.
    # The actual product_fixture is returned by BaseDAO.create after session.flush
    # (assuming ID is populated by DB upon flush, which is typical).
    # For this test, we make product_fixture the "result" of creation.
    # The DAO's create method returns the model instance.

    # No need to mock super().create. Let it run.
    # Ensure session.flush() works (it's an AsyncMock, so it runs)
    # Ensure the model instance is returned by the create method.
    # The actual product_fixture has an ID, this simulates it being set by the DB.

    mock_cache_delete = mocker.patch('backend.cache_manager.cache_manager.delete', new_callable=AsyncMock)
    mock_delete_pattern = mocker.patch('backend.cache_manager.cache_manager.delete_by_pattern', new_callable=AsyncMock)

    product_dao = ProductDAO(db_session_mock)

    # Act
    # The create method in BaseDAO adds the object and flushes.
    # We are returning product_fixture which has an ID.
    # The actual input_dto might result in a different object, but for testing the flow,
    # we assume the creation part works and returns a valid product object.
    # To make it more realistic, we could have BaseDAO's create return the passed input_dto as a model.
    # For now, we assume create works and returns a product model.
    # The `create` method of BaseDAO returns the created model instance.
    # Let's assume `product_fixture` is this instance.
    # The original `product_dao.create` calls `super().create` which returns a model instance.
    # We are testing the flow, so we don't need to mock the actual creation of the model instance itself,
    # but rather that the cache invalidation happens after it.

    # To properly test BaseDAO.create's effect:
    # We don't mock super().create. We let it execute.
    # The BaseDAO.create method itself calls: self.session.add(record); await self.session.flush()
    # then `await cache_manager.delete(f"{self.model.__name__}:all")`
    # Then ProductDAO's create calls `await cache_manager.delete_by_pattern("product_filter:*")`

    # We don't need to mock the product instance creation itself from input_dto,
    # as long as the `product_dao.create` method completes and returns a product.
    # The important part is the sequence of cache calls.

    # Let's simplify: assume `super().create` returns `product_fixture`
    # This means we have to patch `BaseDAO.create` to control its output for the test.
    # This is what I had before, and it means this test *only* tests ProductDAO's override,
    # not the full chain for BaseDAO's `Product:all` invalidation.

    # To test the full chain:
    # 1. `db_session_mock.add` and `db_session_mock.flush` will be called by BaseDAO.create.
    # 2. `cache_manager.delete` for "Product:all" will be called by BaseDAO.create.
    # 3. `cache_manager.delete_by_pattern` for "product_filter:*" will be called by ProductDAO.create.

    # Act
    await product_dao.create(input_dto=product_input_dto_fixture)

    # Assert
    mock_cache_delete.assert_called_once_with("Product:all") # From BaseDAO
    mock_delete_pattern.assert_called_once_with("product_filter:*") # From ProductDAO override


@pytest.mark.asyncio
async def test_update_product_invalidates_item_all_and_filter_caches(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    product_id = product_fixture.id
    update_data = ProductUpdateDTO(title="Updated Title")

    # For BaseDAO.update, it does a SQL update and returns the DTO.
    # The execute method should be mocked to return an object that has scalar_one_or_none.
    db_session_mock.execute.return_value.scalar_one_or_none.return_value = product_fixture # Simulates DB returning updated row

    mock_cache_delete = mocker.patch('backend.cache_manager.cache_manager.delete', new_callable=AsyncMock)
    mock_delete_pattern = mocker.patch('backend.cache_manager.cache_manager.delete_by_pattern', new_callable=AsyncMock)

    product_dao = ProductDAO(db_session_mock)

    # Act
    await product_dao.update(item_id=product_id, update_dto=update_data, out_dto_class=ProductOutDTO)

    # Assert
    # BaseDAO.update invalidates Product:item_id and Product:all
    # ProductDAO.update override invalidates product_filter:*
    expected_item_key = f"Product:{product_id}"
    mock_cache_delete.assert_any_call(expected_item_key)
    mock_cache_delete.assert_any_call("Product:all")
    assert mock_cache_delete.call_count == 2 # Ensure both were called

    mock_delete_pattern.assert_called_once_with("product_filter:*")


@pytest.mark.asyncio
async def test_delete_product_invalidates_item_all_and_filter_caches(
    mocker, db_session_mock: MagicMock, product_fixture: Product
):
    product_id = product_fixture.id

    # For BaseDAO.delete, it does a SQL delete.
    # Mock rowcount to indicate successful deletion.
    db_session_mock.execute.return_value.rowcount = 1

    mock_cache_delete = mocker.patch('backend.cache_manager.cache_manager.delete', new_callable=AsyncMock)
    mock_delete_pattern = mocker.patch('backend.cache_manager.cache_manager.delete_by_pattern', new_callable=AsyncMock)

    product_dao = ProductDAO(db_session_mock)

    # Act
    await product_dao.delete(item_id=product_id)

    # Assert
    # BaseDAO.delete invalidates Product:item_id and Product:all
    # ProductDAO.delete override invalidates product_filter:*
    expected_item_key = f"Product:{product_id}"
    mock_cache_delete.assert_any_call(expected_item_key)
    mock_cache_delete.assert_any_call("Product:all")
    assert mock_cache_delete.call_count == 2

    mock_delete_pattern.assert_called_once_with("product_filter:*")


# Tests for get_all_cached (BaseDAO via ProductDAO)

@pytest.mark.asyncio
async def test_get_all_cached_first_call_caches_result(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    mock_cache_get_raw = mocker.patch('backend.cache_manager.cache_manager.get_raw', new_callable=AsyncMock, return_value=None)
    mock_cache_set_raw = mocker.patch('backend.cache_manager.cache_manager.set_raw', new_callable=AsyncMock)
    db_session_mock.execute.return_value.scalars.return_value.all.return_value = [product_fixture]
    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = "Product:all"
    expected_dto_list = [product_out_dto_fixture]
    expected_json_str = json.dumps([dto.model_dump() for dto in expected_dto_list])

    result_dtos = await product_dao.get_all_cached(out_dto_class=ProductOutDTO)

    mock_cache_get_raw.assert_called_once_with(expected_cache_key)
    db_session_mock.execute.assert_called_once()
    mock_cache_set_raw.assert_called_once_with(expected_cache_key, expected_json_str)
    assert result_dtos == expected_dto_list

@pytest.mark.asyncio
async def test_get_all_cached_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, product_out_dto_fixture: ProductOutDTO
):
    expected_dto_list = [product_out_dto_fixture]
    cached_json_str = json.dumps([dto.model_dump() for dto in expected_dto_list])
    mock_cache_get_raw = mocker.patch('backend.cache_manager.cache_manager.get_raw', new_callable=AsyncMock, return_value=cached_json_str)
    mock_cache_set_raw = mocker.patch('backend.cache_manager.cache_manager.set_raw', new_callable=AsyncMock)
    product_dao = ProductDAO(db_session_mock)
    expected_cache_key = "Product:all"

    result_dtos = await product_dao.get_all_cached(out_dto_class=ProductOutDTO)

    mock_cache_get_raw.assert_called_once_with(expected_cache_key)
    db_session_mock.execute.assert_not_called()
    mock_cache_set_raw.assert_not_called()
    assert result_dtos == expected_dto_list


# Tests for get_filtered_results (ProductDAO) - These should be mostly fine

@pytest.mark.asyncio
async def test_get_filtered_products_first_call_caches_result(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    filters = ProductFilterDTO(search_query="Test")
    pagination = PaginationParams(offset=0, limit=10)
    cache_key_payload = {
        "filters": filters.model_dump(exclude_none=True),
        "pagination": pagination.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }
    sorted_payload_str = json.dumps(cache_key_payload, sort_keys=True)
    expected_hash_value = 123456789
    mocker.patch('builtins.hash', return_value=expected_hash_value)
    expected_cache_key = f"product_filter:{expected_hash_value}"

    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=None)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    db_session_mock.execute.return_value.scalars.return_value = [product_fixture]
    mocker.patch.object(ProductDAO, '_compute_offset_pagination', new_callable=AsyncMock, return_value=OffsetPaginationMetadata(total=1))
    product_dao = ProductDAO(db_session_mock)
    expected_results_data = [product_out_dto_fixture]
    expected_offset_results = OffsetResults[ProductOutDTO](
        data=expected_results_data,
        pagination=OffsetPaginationMetadata(total=1)
    )

    results = await product_dao.get_filtered_results(
        out_dto_class=ProductOutDTO, pagination=pagination, filters=filters
    )

    mock_cache_get.assert_called_once_with(expected_cache_key, OffsetResults[ProductOutDTO])
    db_session_mock.execute.assert_called_once()
    ProductDAO._compute_offset_pagination.assert_called_once()
    mock_cache_set.assert_called_once_with(expected_cache_key, expected_offset_results)
    assert results == expected_offset_results

@pytest.mark.asyncio
async def test_get_filtered_products_second_call_uses_cache(
    mocker, db_session_mock: MagicMock, product_out_dto_fixture: ProductOutDTO
):
    filters = ProductFilterDTO(search_query="Test")
    pagination = PaginationParams(offset=0, limit=10)
    cache_key_payload = {
        "filters": filters.model_dump(exclude_none=True),
        "pagination": pagination.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }
    sorted_payload_str = json.dumps(cache_key_payload, sort_keys=True)
    expected_hash_value = 123456789
    mocker.patch('builtins.hash', return_value=expected_hash_value)
    expected_cache_key = f"product_filter:{expected_hash_value}"
    expected_offset_results = OffsetResults[ProductOutDTO](
        data=[product_out_dto_fixture],
        pagination=OffsetPaginationMetadata(total=1)
    )
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, return_value=expected_offset_results)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    mock_compute_pagination = mocker.patch.object(ProductDAO, '_compute_offset_pagination', new_callable=AsyncMock)
    product_dao = ProductDAO(db_session_mock)

    results = await product_dao.get_filtered_results(
        out_dto_class=ProductOutDTO, pagination=pagination, filters=filters
    )

    mock_cache_get.assert_called_once_with(expected_cache_key, OffsetResults[ProductOutDTO])
    db_session_mock.execute.assert_not_called()
    mock_compute_pagination.assert_not_called()
    mock_cache_set.assert_not_called()
    assert results == expected_offset_results

@pytest.mark.asyncio
async def test_get_filtered_products_different_filters_miss_cache(
    mocker, db_session_mock: MagicMock, product_fixture: Product, product_out_dto_fixture: ProductOutDTO
):
    filters_A = ProductFilterDTO(search_query="TestA")
    pagination_A = PaginationParams(offset=0, limit=10)
    payload_A_str = json.dumps({
        "filters": filters_A.model_dump(exclude_none=True),
        "pagination": pagination_A.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }, sort_keys=True)
    hash_A = 11111; key_A = f"product_filter:{hash_A}"
    results_A = OffsetResults[ProductOutDTO](data=[product_out_dto_fixture], pagination=OffsetPaginationMetadata(total=1))

    filters_B = ProductFilterDTO(search_query="TestB")
    pagination_B = PaginationParams(offset=0, limit=10)
    payload_B_str = json.dumps({
        "filters": filters_B.model_dump(exclude_none=True),
        "pagination": pagination_B.model_dump(exclude_none=True),
        "out_dto_class": ProductOutDTO.__name__
    }, sort_keys=True)
    hash_B = 22222; key_B = f"product_filter:{hash_B}"

    def side_effect_hash(s):
        if s == payload_A_str: return hash_A
        if s == payload_B_str: return hash_B
        return hash(s) # Default for other calls if any
    mocker.patch('builtins.hash', side_effect=side_effect_hash)

    async def mock_cache_get_side_effect(key, model_class):
        if key == key_A: return results_A
        if key == key_B: return None
        return None
    mock_cache_get = mocker.patch('backend.cache_manager.cache_manager.get', new_callable=AsyncMock, side_effect=mock_cache_get_side_effect)
    mock_cache_set = mocker.patch('backend.cache_manager.cache_manager.set', new_callable=AsyncMock)
    db_session_mock.execute.return_value.scalars.return_value = [product_fixture]
    mocker.patch.object(ProductDAO, '_compute_offset_pagination', new_callable=AsyncMock, return_value=OffsetPaginationMetadata(total=1))
    product_dao = ProductDAO(db_session_mock)

    await product_dao.get_filtered_results(out_dto_class=ProductOutDTO, pagination=pagination_B, filters=filters_B)

    call_args_list_get = [call_args[0] for call_args in mock_cache_get.call_args_list]
    assert (key_B, OffsetResults[ProductOutDTO]) in call_args_list_get
    db_session_mock.execute.assert_called_once()
    ProductDAO._compute_offset_pagination.assert_called_once()
    call_args_list_set = [call_args[0] for call_args in mock_cache_set.call_args_list]
    expected_results_B = OffsetResults[ProductOutDTO](data=[product_out_dto_fixture], pagination=OffsetPaginationMetadata(total=1))
    assert (key_B, expected_results_B) in call_args_list_set
    assert mock_cache_set.call_count == 1
```
