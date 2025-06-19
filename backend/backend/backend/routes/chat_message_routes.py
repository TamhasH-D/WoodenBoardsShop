from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends # Added Depends
# Query, Body, status might be needed for other routes, not removing them if present
# For now, only Depends is strictly necessary for these changes from the original file.

from backend.auth import AuthenticatedUser, get_current_user # Added
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
    ChatMessageInputDTO, # This DTO definition was modified (buyer_id, seller_id removed)
    ChatMessageUpdateDTO,
    # ChatMessageMarkReadDTO, # This DTO is not used in the functions being modified
)
from backend.services.chat_service import ChatService

router = APIRouter(prefix="/chat-messages")


@router.post("/", status_code=201)
async def create_chat_message(
    input_dto: ChatMessageInputDTO, # Client sends id, thread_id, message
    daos: GetDAOs,
    current_user: AuthenticatedUser = Depends(get_current_user), # Added
) -> DataResponse[ChatMessageDTO]:
    """Create a new ChatMessage."""
    chat_service = ChatService(daos)
    try:
        # Service send_message expects: thread_id, message_id, message_text, sender
        created_obj = await chat_service.send_message(
            thread_id=input_dto.thread_id,
            message_id=input_dto.id, # Assuming client provides a UUID for the message id
            message_text=input_dto.message,
            sender=current_user
        )
        return DataResponse(data=ChatMessageDTO.model_validate(created_obj))
    except ValueError as e: # Catching ValueError from service for specific errors
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Log generic exceptions if needed
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@router.patch("/{chat_message_id}")
async def update_chat_message(
    chat_message_id: UUID,
    update_dto: ChatMessageUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update ChatMessage."""
    # This route is not part of the current refactoring task for auth.
    await daos.chat_message.update(chat_message_id, update_dto)
    return EmptyResponse()


@router.delete("/{chat_message_id}")
async def delete_chat_message(
    chat_message_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a ChatMessage by id."""
    # This route is not part of the current refactoring task for auth.
    await daos.chat_message.delete(id=chat_message_id)
    return EmptyResponse()


@router.get("/")
async def get_chat_message_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[ChatMessageDTO]:
    """Get all ChatMessages paginated."""
    # This route is not part of the current refactoring task for auth.
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
    # This route is not part of the current refactoring task for auth with current user context,
    # as it fetches messages for a thread regardless of user.
    # Access control for thread visibility would be a separate concern.
    chat_service = ChatService(daos)
    messages = await chat_service.get_thread_messages(thread_id, limit)
    return ListDataResponse(data=[ChatMessageDTO.model_validate(msg) for msg in messages])


@router.patch("/{thread_id}/mark-read") # Route path remains the same
async def mark_messages_as_read(
    thread_id: UUID,
    daos: GetDAOs,
    current_user: AuthenticatedUser = Depends(get_current_user), # Added, removed user_id, user_type
) -> EmptyResponse:
    """Mark messages in thread as read for the current user."""
    chat_service = ChatService(daos)
    try:
        # Service mark_messages_as_read expects: thread_id, user (AuthenticatedUser)
        await chat_service.mark_messages_as_read(thread_id=thread_id, user=current_user)
        return EmptyResponse()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@router.get("/unread-count") # Route changed from /unread-count/{user_id}
async def get_unread_count(
    daos: GetDAOs,
    current_user: AuthenticatedUser = Depends(get_current_user), # Added, removed user_id, user_type path/query params
    thread_id: UUID | None = None, # thread_id remains an optional query parameter
) -> DataResponse[int]:
    """Get unread message count for the current user."""
    chat_service = ChatService(daos)
    try:
        # Service get_unread_count expects: user (AuthenticatedUser), thread_id (optional)
        count = await chat_service.get_unread_count(user=current_user, thread_id=thread_id)
        return DataResponse(data=count)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")


@router.get("/{chat_message_id}")
async def get_chat_message(
    chat_message_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ChatMessageDTO]:
    """Get a ChatMessage by id."""
    # This route is not part of the current refactoring task for auth.
    chat_message = await daos.chat_message.filter_first(id=chat_message_id)
    return DataResponse(data=ChatMessageDTO.model_validate(chat_message))
