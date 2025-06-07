from fastapi import APIRouter

from backend.routes.buyer_routes import router as buyer_router
from backend.routes.chat_message_routes import router as chat_message_router
from backend.routes.chat_thread_routes import router as chat_thread_router
from backend.routes.demo_routes import router as demo_router
from backend.routes.health_routes import router as health_router
from backend.routes.image_routes import router as image_router
from backend.routes.product_routes import router as product_router
from backend.routes.seller_routes import router as seller_router
from backend.routes.wood_type_price_routes import router as wood_type_price_router
from backend.routes.wood_type_routes import router as wood_type_router
from backend.routes.wooden_board_routes import router as wooden_board_router

base_router = APIRouter(prefix="/api/v1")

base_router.include_router(health_router, tags=["health"])
base_router.include_router(demo_router, tags=["demo"])
base_router.include_router(buyer_router, tags=["buyer"])
base_router.include_router(seller_router, tags=["seller"])
base_router.include_router(wood_type_router, tags=["wood_type"])
base_router.include_router(wood_type_price_router, tags=["wood_type_price"])
base_router.include_router(product_router, tags=["product"])
base_router.include_router(wooden_board_router, tags=["wooden_board"])
base_router.include_router(image_router, tags=["image"])
base_router.include_router(chat_thread_router, tags=["chat_thread"])
base_router.include_router(chat_message_router, tags=["chat_message"])
