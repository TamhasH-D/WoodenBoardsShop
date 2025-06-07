from uuid import UUID

from fastapi import APIRouter

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.chat_message_dtos import (
    ChatMessageDTO,
    ChatMessageInputDTO,
    ChatMessageUpdateDTO,
)

router = APIRouter(prefix="/chat-messages")


@router.post("/", status_code=201)
async def create_chat_message(
    input_dto: ChatMessageInputDTO,
    daos: GetDAOs,
) -> DataResponse[ChatMessageDTO]:
    """Create a new ChatMessage."""
    created_obj = await daos.chat_message.create(input_dto)
    return DataResponse(data=ChatMessageDTO.model_validate(created_obj))


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


@router.get("/{chat_message_id}")
async def get_chat_message(
    chat_message_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ChatMessageDTO]:
    """Get a ChatMessage by id."""
    chat_message = await daos.chat_message.filter_first(id=chat_message_id)
    return DataResponse(data=ChatMessageDTO.model_validate(chat_message))
