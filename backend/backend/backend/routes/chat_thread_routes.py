from uuid import UUID

from fastapi import APIRouter, HTTPException

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
) -> DataResponse[ChatThreadDTO]:
    """Start a new chat thread with a seller (buyer initiates)."""
    chat_service = ChatService(daos)
    try:
        thread = await chat_service.start_chat_with_seller(start_chat_dto)
        return DataResponse(data=ChatThreadDTO.model_validate(thread))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/by-buyer/{buyer_id}")
async def get_buyer_chats(
    buyer_id: UUID,
    daos: GetDAOs,
) -> ListDataResponse[ChatThreadWithLastMessageDTO]:
    """Get all chat threads for a buyer with last message info."""
    chat_service = ChatService(daos)
    threads = await chat_service.get_buyer_chats(buyer_id)
    return ListDataResponse(data=threads)


@router.get("/by-seller/{seller_id}")
async def get_seller_chats(
    seller_id: UUID,
    daos: GetDAOs,
) -> ListDataResponse[ChatThreadWithLastMessageDTO]:
    """Get all chat threads for a seller with last message info."""
    chat_service = ChatService(daos)
    threads = await chat_service.get_seller_chats(seller_id)
    return ListDataResponse(data=threads)


@router.get("/{chat_thread_id}")
async def get_chat_thread(
    chat_thread_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ChatThreadDTO]:
    """Get a ChatThread by id."""
    chat_thread = await daos.chat_thread.filter_first(id=chat_thread_id)
    return DataResponse(data=ChatThreadDTO.model_validate(chat_thread))
