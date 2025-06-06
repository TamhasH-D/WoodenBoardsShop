"""Keep-alive routes for maintaining user online status and session activity."""

from datetime import datetime, UTC
from typing import Dict, Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, Header, Depends
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.db_dependencies import get_db_session
from backend.models.seller_models import Seller
from backend.models.buyer_models import Buyer

router = APIRouter()


@router.post("/keep-alive")
async def keep_alive(
    user_type: str = Header(..., alias="X-User-Type"),  # "seller" or "buyer"
    user_id: str = Header(..., alias="X-User-ID"),
    session: AsyncSession = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Keep-alive endpoint to maintain user online status and refresh session.
    
    This endpoint should be called every 5 minutes by the frontend to:
    1. Update the user's last_activity timestamp
    2. Set the user's is_online status to True
    3. Keep the session active
    
    Headers required:
    - X-User-Type: "seller" or "buyer"
    - X-User-ID: UUID of the user
    """
    try:
        # Validate user_type
        if user_type not in ["seller", "buyer"]:
            raise HTTPException(
                status_code=400, 
                detail="Invalid user type. Must be 'seller' or 'buyer'"
            )
        
        # Validate user_id format
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID format. Must be a valid UUID"
            )
        
        now = datetime.now(UTC)
        
        if user_type == "seller":
            # Check if seller exists
            result = await session.execute(
                select(Seller).where(Seller.id == user_uuid)
            )
            seller = result.scalar_one_or_none()
            
            if not seller:
                raise HTTPException(status_code=404, detail="Seller not found")
            
            # Update seller activity
            await session.execute(
                update(Seller)
                .where(Seller.id == user_uuid)
                .values(
                    last_activity=now,
                    is_online=True,
                    updated_at=now
                )
            )
            
            user_info = {
                "id": str(seller.id),
                "type": "seller",
                "is_online": True,
                "last_activity": now.isoformat()
            }
            
        elif user_type == "buyer":
            # Check if buyer exists
            result = await session.execute(
                select(Buyer).where(Buyer.id == user_uuid)
            )
            buyer = result.scalar_one_or_none()
            
            if not buyer:
                raise HTTPException(status_code=404, detail="Buyer not found")
            
            # Update buyer activity
            await session.execute(
                update(Buyer)
                .where(Buyer.id == user_uuid)
                .values(
                    last_activity=now,
                    is_online=True,
                    updated_at=now
                )
            )
            
            user_info = {
                "id": str(buyer.id),
                "type": "buyer", 
                "is_online": True,
                "last_activity": now.isoformat()
            }
        
        await session.commit()
        
        return {
            "status": "success",
            "message": "Keep-alive successful",
            "user": user_info,
            "timestamp": now.isoformat(),
            "next_keep_alive_in_seconds": 300  # 5 minutes
        }
        
    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process keep-alive request: {str(e)}"
        )


@router.get("/keep-alive/status")
async def get_keep_alive_status(
    user_type: str = Header(..., alias="X-User-Type"),
    user_id: str = Header(..., alias="X-User-ID"),
    session: AsyncSession = Depends(get_db_session)
) -> Dict[str, Any]:
    """
    Get the current online status and last activity for a user.
    
    This endpoint can be used to check if the keep-alive system is working properly.
    """
    try:
        # Validate inputs
        if user_type not in ["seller", "buyer"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid user type. Must be 'seller' or 'buyer'"
            )
        
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid user ID format. Must be a valid UUID"
            )
        
        if user_type == "seller":
            result = await session.execute(
                select(Seller.id, Seller.is_online, Seller.last_activity)
                .where(Seller.id == user_uuid)
            )
            user_data = result.first()
            
        elif user_type == "buyer":
            result = await session.execute(
                select(Buyer.id, Buyer.is_online, Buyer.last_activity)
                .where(Buyer.id == user_uuid)
            )
            user_data = result.first()
        
        if not user_data:
            raise HTTPException(status_code=404, detail=f"{user_type.title()} not found")
        
        # Calculate time since last activity
        now = datetime.now(UTC)
        time_since_activity = now - user_data.last_activity
        
        return {
            "user_id": str(user_data.id),
            "user_type": user_type,
            "is_online": user_data.is_online,
            "last_activity": user_data.last_activity.isoformat(),
            "seconds_since_last_activity": int(time_since_activity.total_seconds()),
            "should_be_offline_in_seconds": max(0, 300 - int(time_since_activity.total_seconds())),
            "timestamp": now.isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get keep-alive status: {str(e)}"
        )
