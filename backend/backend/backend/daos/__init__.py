from typing import Annotated

from fastapi import Depends

from backend.daos.buyer_daos import BuyerDAO
from backend.daos.chat_message_daos import ChatMessageDAO
from backend.daos.chat_thread_daos import ChatThreadDAO
from backend.daos.image_daos import ImageDAO
from backend.daos.product_daos import ProductDAO
from backend.daos.seller_daos import SellerDAO
from backend.daos.wood_type_daos import WoodTypeDAO
from backend.daos.wood_type_price_daos import WoodTypePriceDAO
from backend.daos.wooden_board_daos import WoodenBoardDAO
from backend.db.db_dependencies import GetDBSession


class AllDAOs:
    """
    A centralized container for all DAOs used in the application.
    This class provides an organized way to access different DAOs as properties.

    Example:
        To add a new DAO, define a property method that returns
        an instance of the desired DAO:

        >>> @property
        >>> def user(self) -> UserDAO:
        >>>     return UserDAO(self.session)

        This allows you to access the `UserDAO` like so:

        >>> @router.post("/myroute")
        >>> async def my_route(daos: GetDAOs) -> ...:
        >>>     await daos.user.create(...)

    """

    def __init__(self, session: GetDBSession):
        self.session = session

    @property
    def buyer(self) -> BuyerDAO:
        return BuyerDAO(self.session)

    @property
    def seller(self) -> SellerDAO:
        return SellerDAO(self.session)

    @property
    def wood_type(self) -> WoodTypeDAO:
        return WoodTypeDAO(self.session)

    @property
    def wood_type_price(self) -> WoodTypePriceDAO:
        return WoodTypePriceDAO(self.session)

    @property
    def product(self) -> ProductDAO:
        return ProductDAO(self.session)

    @property
    def wooden_board(self) -> WoodenBoardDAO:
        return WoodenBoardDAO(self.session)

    @property
    def image(self) -> ImageDAO:
        return ImageDAO(self.session)

    @property
    def chat_thread(self) -> ChatThreadDAO:
        return ChatThreadDAO(self.session)

    @property
    def chat_message(self) -> ChatMessageDAO:
        return ChatMessageDAO(self.session)


GetDAOs = Annotated[AllDAOs, Depends()]
