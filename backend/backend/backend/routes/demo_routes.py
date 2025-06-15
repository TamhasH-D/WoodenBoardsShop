import json
from typing import Any
from uuid import UUID

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse

from backend import exceptions
from backend.daos import GetDAOs
from backend.services.redis import GetRedis

router = APIRouter(prefix="/demo")


@router.post("/set-redis")
async def set_redis_value(
    key: str,
    value: str,
    redis: GetRedis,
) -> None:
    await redis.set(key, value)


@router.get("/get-redis")
async def get_redis_value(
    key: str,
    redis: GetRedis,
) -> dict[str, Any]:
    value = await redis.get(key)
    if value is None:
        raise exceptions.Http404(detail="Key not found in Redis")
    return {"key": key, "value": value}


@router.get("/export-database")
async def export_database(
    daos: GetDAOs,
) -> JSONResponse:
    """
    Export entire database to JSON format.

    Returns all data from all tables in a structured JSON format
    that can be used for backup or migration purposes.
    """
    try:
        # Export all entities
        export_data = {
            "buyers": [],
            "sellers": [],
            "products": [],
            "wood_types": [],
            "wood_type_prices": [],
            "images": [],
            "wooden_boards": [],
            "chat_threads": [],
            "chat_messages": [],
        }

        # Get all buyers
        buyers = await daos.buyer.filter()
        export_data["buyers"] = [
            {
                "id": str(buyer.id),
                "keycloak_uuid": str(buyer.keycloak_uuid),
                "is_online": buyer.is_online,
                "created_at": buyer.created_at.isoformat(),
                "updated_at": buyer.updated_at.isoformat(),
            }
            for buyer in buyers
        ]

        # Get all sellers
        sellers = await daos.seller.filter()
        export_data["sellers"] = [
            {
                "id": str(seller.id),
                "keycloak_uuid": str(seller.keycloak_uuid),
                "is_online": seller.is_online,
                "created_at": seller.created_at.isoformat(),
                "updated_at": seller.updated_at.isoformat(),
            }
            for seller in sellers
        ]

        # Get all wood types
        wood_types = await daos.wood_type.filter()
        export_data["wood_types"] = [
            {
                "id": str(wood_type.id),
                "name": wood_type.neme,  # Backend uses 'neme' field
                "description": wood_type.description,
            }
            for wood_type in wood_types
        ]

        # Get all wood type prices
        wood_type_prices = await daos.wood_type_price.filter()
        export_data["wood_type_prices"] = [
            {
                "id": str(price.id),
                "wood_type_id": str(price.wood_type_id),
                "price_per_m3": float(price.price_per_m3),
                "created_at": price.created_at.isoformat(),
            }
            for price in wood_type_prices
        ]

        # Get all products
        products = await daos.product.filter()
        export_data["products"] = [
            {
                "id": str(product.id),
                "volume": float(product.volume),
                "price": float(product.price),
                "title": product.title,
                "descrioption": product.descrioption,
                "delivery_possible": product.delivery_possible,
                "pickup_location": product.pickup_location,
                "seller_id": str(product.seller_id),
                "wood_type_id": str(product.wood_type_id),
                "created_at": product.created_at.isoformat(),
                "updated_at": product.updated_at.isoformat(),
            }
            for product in products
        ]

        # Get all images
        images = await daos.image.filter()
        export_data["images"] = [
            {
                "id": str(image.id),
                "image_path": image.image_path,
                "product_id": str(image.product_id),
            }
            for image in images
        ]

        # Get all wooden boards
        wooden_boards = await daos.wooden_board.filter()
        export_data["wooden_boards"] = [
            {
                "id": str(board.id),
                "width": float(board.width),
                "height": float(board.height),
                "lenght": float(board.lenght),
                "image_id": str(board.image_id),
            }
            for board in wooden_boards
        ]

        # Get all chat threads
        chat_threads = await daos.chat_thread.filter()
        export_data["chat_threads"] = [
            {
                "id": str(thread.id),
                "buyer_id": str(thread.buyer_id),
                "seller_id": str(thread.seller_id),
                "created_at": thread.created_at.isoformat(),
            }
            for thread in chat_threads
        ]

        # Get all chat messages
        chat_messages = await daos.chat_message.filter()
        export_data["chat_messages"] = [
            {
                "id": str(message.id),
                "message": message.message,
                "buyer_id": str(message.buyer_id) if message.buyer_id else None,
                "seller_id": str(message.seller_id) if message.seller_id else None,
                "thread_id": str(message.thread_id),
                "is_read_by_buyer": message.is_read_by_buyer,
                "is_read_by_seller": message.is_read_by_seller,
                "created_at": message.created_at.isoformat(),
            }
            for message in chat_messages
        ]

        return JSONResponse(
            content=export_data,
            headers={
                "Content-Disposition": "attachment; filename=database_export.json"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка экспорта базы данных: {str(e)}"
        )


@router.post("/import-database")
async def import_database(
    daos: GetDAOs,
    file: UploadFile = File(...),
) -> dict[str, Any]:
    """
    Import database from JSON file.

    Accepts a JSON file with the same structure as export_database endpoint.
    This will clear existing data and import new data.

    WARNING: This operation will delete all existing data!
    """
    try:
        # Read and parse JSON file
        content = await file.read()
        try:
            import_data = json.loads(content.decode('utf-8'))
        except json.JSONDecodeError as e:
            raise HTTPException(
                status_code=400,
                detail=f"Неверный формат JSON файла: {str(e)}"
            )

        # Validate required keys
        required_keys = [
            "buyers", "sellers", "products", "wood_types", "wood_type_prices",
            "images", "wooden_boards", "chat_threads", "chat_messages"
        ]

        for key in required_keys:
            if key not in import_data:
                raise HTTPException(
                    status_code=400,
                    detail=f"Отсутствует обязательный ключ в JSON: {key}"
                )

        # Import statistics
        stats = {
            "imported": {},
            "errors": []
        }

        # Import wood types first (referenced by products and prices)
        for wood_type_data in import_data["wood_types"]:
            try:
                from backend.dtos.wood_type_dtos import WoodTypeInputDTO
                from datetime import datetime

                wood_type_dto = WoodTypeInputDTO(
                    id=UUID(wood_type_data["id"]),
                    neme=wood_type_data["name"],  # Backend uses 'neme' field
                    description=wood_type_data.get("description"),
                )
                await daos.wood_type.create(wood_type_dto)
                stats["imported"]["wood_types"] = stats["imported"].get("wood_types", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Wood type {wood_type_data.get('id', 'unknown')}: {str(e)}")

        # Import buyers
        for buyer_data in import_data["buyers"]:
            try:
                from backend.dtos.buyer_dtos import BuyerInputDTO

                buyer_dto = BuyerInputDTO(
                    id=UUID(buyer_data["id"]),
                    keycloak_uuid=UUID(buyer_data["keycloak_uuid"]),
                    is_online=buyer_data.get("is_online", False),
                )
                await daos.buyer.create(buyer_dto)
                stats["imported"]["buyers"] = stats["imported"].get("buyers", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Buyer {buyer_data.get('id', 'unknown')}: {str(e)}")

        # Import sellers
        for seller_data in import_data["sellers"]:
            try:
                from backend.dtos.seller_dtos import SellerInputDTO

                seller_dto = SellerInputDTO(
                    id=UUID(seller_data["id"]),
                    keycloak_uuid=UUID(seller_data["keycloak_uuid"]),
                    is_online=seller_data.get("is_online", False),
                )
                await daos.seller.create(seller_dto)
                stats["imported"]["sellers"] = stats["imported"].get("sellers", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Seller {seller_data.get('id', 'unknown')}: {str(e)}")

        # Import wood type prices
        for price_data in import_data["wood_type_prices"]:
            try:
                from backend.dtos.wood_type_price_dtos import WoodTypePriceInputDTO
                from datetime import datetime

                price_dto = WoodTypePriceInputDTO(
                    id=UUID(price_data["id"]),
                    wood_type_id=UUID(price_data["wood_type_id"]),
                    price_per_m3=float(price_data.get("price_per_m3", price_data.get("price_per_cubic_meter", 0))),
                )
                await daos.wood_type_price.create(price_dto)
                stats["imported"]["wood_type_prices"] = stats["imported"].get("wood_type_prices", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Wood type price {price_data.get('id', 'unknown')}: {str(e)}")

        # Import products
        for product_data in import_data["products"]:
            try:
                from backend.dtos.product_dtos import ProductInputDTO

                product_dto = ProductInputDTO(
                    id=UUID(product_data["id"]),
                    volume=float(product_data["volume"]),
                    price=float(product_data["price"]),
                    title=product_data["title"],
                    descrioption=product_data.get("descrioption"),
                    delivery_possible=product_data.get("delivery_possible", False),
                    pickup_location=product_data.get("pickup_location"),
                    seller_id=UUID(product_data["seller_id"]),
                    wood_type_id=UUID(product_data["wood_type_id"]),
                )
                await daos.product.create(product_dto)
                stats["imported"]["products"] = stats["imported"].get("products", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Product {product_data.get('id', 'unknown')}: {str(e)}")

        # Import images
        for image_data in import_data["images"]:
            try:
                from backend.dtos.image_dtos import ImageInputDTO

                image_dto = ImageInputDTO(
                    id=UUID(image_data["id"]),
                    image_path=image_data["image_path"],
                    product_id=UUID(image_data["product_id"]),
                )
                await daos.image.create(image_dto)
                stats["imported"]["images"] = stats["imported"].get("images", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Image {image_data.get('id', 'unknown')}: {str(e)}")

        # Import wooden boards
        for board_data in import_data["wooden_boards"]:
            try:
                from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO

                board_dto = WoodenBoardInputDTO(
                    id=UUID(board_data["id"]),
                    width=float(board_data["width"]),
                    height=float(board_data["height"]),
                    lenght=float(board_data.get("lenght", board_data.get("length", 0))),
                    image_id=UUID(board_data["image_id"]),
                )
                await daos.wooden_board.create(board_dto)
                stats["imported"]["wooden_boards"] = stats["imported"].get("wooden_boards", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Wooden board {board_data.get('id', 'unknown')}: {str(e)}")

        # Import chat threads
        for thread_data in import_data["chat_threads"]:
            try:
                from backend.dtos.chat_thread_dtos import ChatThreadInputDTO

                thread_dto = ChatThreadInputDTO(
                    id=UUID(thread_data["id"]),
                    buyer_id=UUID(thread_data["buyer_id"]),
                    seller_id=UUID(thread_data["seller_id"]),
                )
                await daos.chat_thread.create(thread_dto)
                stats["imported"]["chat_threads"] = stats["imported"].get("chat_threads", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Chat thread {thread_data.get('id', 'unknown')}: {str(e)}")

        # Import chat messages
        for message_data in import_data["chat_messages"]:
            try:
                from backend.dtos.chat_message_dtos import ChatMessageInputDTO

                message_dto = ChatMessageInputDTO(
                    id=UUID(message_data["id"]),
                    message=message_data.get("message", message_data.get("content", "")),
                    buyer_id=UUID(message_data["buyer_id"]) if message_data["buyer_id"] else None,
                    seller_id=UUID(message_data["seller_id"]) if message_data["seller_id"] else None,
                    thread_id=UUID(message_data["thread_id"]),
                    is_read_by_buyer=message_data.get("is_read_by_buyer", False),
                    is_read_by_seller=message_data.get("is_read_by_seller", False),
                )
                await daos.chat_message.create(message_dto)
                stats["imported"]["chat_messages"] = stats["imported"].get("chat_messages", 0) + 1
            except Exception as e:
                stats["errors"].append(f"Chat message {message_data.get('id', 'unknown')}: {str(e)}")

        return {
            "message": "Импорт базы данных завершен",
            "statistics": stats
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка импорта базы данных: {str(e)}"
        )
