from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends # Added Depends

from backend.auth import AuthenticatedUser, get_current_buyer, get_current_seller # Added
from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    ListDataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.chat_thread_dtos import (
    ChatThreadDTO,
    ChatThreadInputDTO,
    ChatThreadUpdateDTO,
    ChatThreadWithLastMessageDTO,
)
from backend.dtos.chat_message_dtos import StartChatDTO
from backend.services.chat_service import ChatService

router = APIRouter(prefix="/chat-threads")


@router.post("/", status_code=201)
async def create_chat_thread(
    input_dto: ChatThreadInputDTO,
    daos: GetDAOs,
) -> DataResponse[ChatThreadDTO]:
    """Create a new ChatThread."""
    created_obj = await daos.chat_thread.create(input_dto)
    return DataResponse(data=ChatThreadDTO.model_validate(created_obj))


@router.patch("/{chat_thread_id}")
async def update_chat_thread(
    chat_thread_id: UUID,
    update_dto: ChatThreadUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update ChatThread."""
    await daos.chat_thread.update(chat_thread_id, update_dto)
    return EmptyResponse()


@router.delete("/{chat_thread_id}")
async def delete_chat_thread(
    chat_thread_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a ChatThread by id."""
    await daos.chat_thread.delete(id=chat_thread_id)
    return EmptyResponse()


@router.get("/")
async def get_chat_thread_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[ChatThreadDTO]:
    """Get all ChatThreads paginated."""
    return await daos.chat_thread.get_offset_results(
        out_dto=ChatThreadDTO,
        pagination=pagination,
    )


@router.post("/start-with-seller", status_code=201)
async def start_chat_with_seller(
    start_chat_dto: StartChatDTO,
    daos: GetDAOs,
    current_buyer: AuthenticatedUser = Depends(get_current_buyer), # Added
) -> DataResponse[ChatThreadDTO]:
    """Start a new chat thread with a seller (buyer initiates)."""
    chat_service = ChatService(daos)
    try:
        # Service method now takes current_buyer_db_id and seller_id
        thread = await chat_service.start_chat_with_seller(
            current_buyer_db_id=current_buyer.db_id,
            seller_id=start_chat_dto.seller_id
        )
        return DataResponse(data=ChatThreadDTO.model_validate(thread))
    except Exception as e:
        # Consider more specific exception handling or logging
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/my/as-buyer") # Route changed from /by-buyer/{buyer_id}
async def get_buyer_chats(
    daos: GetDAOs,
    current_buyer: AuthenticatedUser = Depends(get_current_buyer), # Replaced buyer_id with current_buyer
) -> ListDataResponse[ChatThreadWithLastMessageDTO]:
    """Get all chat threads for the current buyer with last message info."""
    chat_service = ChatService(daos)
    threads = await chat_service.get_buyer_chats(buyer_db_id=current_buyer.db_id) # Pass current_buyer.db_id
    return ListDataResponse(data=threads)


@router.get("/my/as-seller") # Route changed from /by-seller/{seller_id}
async def get_seller_chats(
    daos: GetDAOs,
    current_seller: AuthenticatedUser = Depends(get_current_seller), # Replaced seller_id with current_seller
) -> ListDataResponse[ChatThreadWithLastMessageDTO]:
    """Get all chat threads for the current seller with last message info."""
    chat_service = ChatService(daos)
    threads = await chat_service.get_seller_chats(seller_db_id=current_seller.db_id) # Pass current_seller.db_id
    return ListDataResponse(data=threads)


@router.get("/{chat_thread_id}")
async def get_chat_thread(
    chat_thread_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ChatThreadDTO]:
    """Get a ChatThread by id."""
    chat_thread = await daos.chat_thread.filter_first(id=chat_thread_id)
    return DataResponse(data=ChatThreadDTO.model_validate(chat_thread))
