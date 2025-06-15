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
from backend.dtos.chat_message_dtos import (
    ChatMessageDTO,
    ChatMessageInputDTO,
    ChatMessageUpdateDTO,
    ChatMessageMarkReadDTO,
)
from backend.services.chat_service import ChatService

router = APIRouter(prefix="/chat-messages")


@router.post("/", status_code=201)
async def create_chat_message(
    input_dto: ChatMessageInputDTO,
    daos: GetDAOs,
) -> DataResponse[ChatMessageDTO]:
    """Create a new ChatMessage."""
    chat_service = ChatService(daos)
    try:
        created_obj = await chat_service.send_message(input_dto)
        return DataResponse(data=ChatMessageDTO.model_validate(created_obj))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{chat_message_id}")
async def update_chat_message(
    chat_message_id: UUID,
    update_dto: ChatMessageUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update ChatMessage."""
    await daos.chat_message.update(chat_message_id, update_dto)
    return EmptyResponse()


@router.delete("/{chat_message_id}")
async def delete_chat_message(
    chat_message_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a ChatMessage by id."""
    await daos.chat_message.delete(id=chat_message_id)
    return EmptyResponse()


@router.get("/")
async def get_chat_message_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[ChatMessageDTO]:
    """Get all ChatMessages paginated."""
    return await daos.chat_message.get_offset_results(
        out_dto=ChatMessageDTO,
        pagination=pagination,
    )


@router.get("/by-thread/{thread_id}")
async def get_thread_messages(
    thread_id: UUID,
    daos: GetDAOs,
    limit: int = 50,
) -> ListDataResponse[ChatMessageDTO]:
    """Get messages for a specific thread."""
    chat_service = ChatService(daos)
    messages = await chat_service.get_thread_messages(thread_id, limit)
    return ListDataResponse(data=[ChatMessageDTO.model_validate(msg) for msg in messages])


@router.patch("/{thread_id}/mark-read")
async def mark_messages_as_read(
    thread_id: UUID,
    user_id: UUID,
    user_type: str,  # 'buyer' or 'seller'
    daos: GetDAOs,
) -> EmptyResponse:
    """Mark messages in thread as read for a user."""
    if user_type not in ["buyer", "seller"]:
        raise HTTPException(status_code=400, detail="Invalid user type")

    chat_service = ChatService(daos)
    try:
        await chat_service.mark_messages_as_read(thread_id, user_id, user_type)
        return EmptyResponse()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/unread-count/{user_id}")
async def get_unread_count(
    user_id: UUID,
    user_type: str,  # 'buyer' or 'seller'
    daos: GetDAOs,
    thread_id: UUID | None = None,
) -> DataResponse[int]:
    """Get unread message count for a user."""
    if user_type not in ["buyer", "seller"]:
        raise HTTPException(status_code=400, detail="Invalid user type")

    chat_service = ChatService(daos)
    try:
        count = await chat_service.get_unread_count(user_id, user_type, thread_id)
        return DataResponse(data=count)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{chat_message_id}")
async def get_chat_message(
    chat_message_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ChatMessageDTO]:
    """Get a ChatMessage by id."""
    chat_message = await daos.chat_message.filter_first(id=chat_message_id)
    return DataResponse(data=ChatMessageDTO.model_validate(chat_message))
