import asyncio
import inspect
from typing import Any

import factory
from sqlalchemy.ext.asyncio import (
    AsyncSession,
)

from backend.db import Base
from backend.models.buyer_models import Buyer
from backend.models.chat_message_models import ChatMessage
from backend.models.chat_thread_models import ChatThread
from backend.models.image_models import Image
from backend.models.product_models import Product
from backend.models.seller_models import Seller
from backend.models.wood_type_models import WoodType
from backend.models.wood_type_price_models import WoodTypePrice
from backend.models.wooden_board_models import WoodenBoard


class BaseFactory[Model: Base](factory.Factory):
    """
    This is the base factory class for all factories.

    Inherit from this class to create a new factory that provides a way to create
    new instances of a specific model, used for testing purposes.

    Example:
    >>> class UserFactory(BaseFactory[User]):
    >>>     ...
    >>>     class Meta:
    >>>         model = User

    """

    session: AsyncSession

    class Meta:
        abstract = True

    @classmethod
    async def create(cls, *args: Any, **kwargs: Any) -> Model:
        """Create and commit a new instance of the model."""
        instance = await super().create(*args, **kwargs)
        await cls.session.commit()
        return instance

    @classmethod
    async def create_batch(cls, size: int, *args: Any, **kwargs: Any) -> list[Model]:
        """Create a batch of new instances of the model."""
        return [await cls.create(*args, **kwargs) for _ in range(size)]

    @classmethod
    def _create(
        cls,
        model_class: type["BaseFactory[Model]"],
        *args: Any,
        **kwargs: Any,
    ) -> asyncio.Task["BaseFactory[Model]"]:
        async def maker_coroutine() -> "BaseFactory[Model]":
            for key, value in kwargs.items():
                if inspect.isawaitable(value):
                    kwargs[key] = await value
            return await cls._create_model(model_class, *args, **kwargs)

        return asyncio.create_task(maker_coroutine())

    @classmethod
    async def _create_model(
        cls,
        model_class: type["BaseFactory[Model]"],
        *args: Any,
        **kwargs: Any,
    ) -> "BaseFactory[Model]":
        """Create a new instance of the model."""
        model = model_class(*args, **kwargs)
        cls.session.add(model)
        return model


###################
# Factory classes #
###################


class BuyerFactory(BaseFactory[Buyer]):
    """buyer factory."""

    class Meta:
        model = Buyer

    created_at = factory.Faker("date_time")
    updated_at = factory.Faker("date_time")
    is_online = factory.Faker("boolean")


class SellerFactory(BaseFactory[Seller]):
    """seller factory."""

    class Meta:
        model = Seller

    created_at = factory.Faker("date_time")
    updated_at = factory.Faker("date_time")
    is_online = factory.Faker("boolean")


class WoodTypeFactory(BaseFactory[WoodType]):
    """wood_type factory."""

    class Meta:
        model = WoodType

    neme = factory.Faker("text")
    description = factory.Faker("text")


class WoodTypePriceFactory(BaseFactory[WoodTypePrice]):
    """wood_type_price factory."""

    class Meta:
        model = WoodTypePrice

    created_at = factory.Faker("date_time")
    price_per_m3 = factory.Faker("pyfloat", positive=True, min_value=0.1, max_value=100)

    @classmethod
    async def _create_model(
        cls, model_class: type[BaseFactory[WoodTypePrice]], *args: Any, **kwargs: Any
    ) -> BaseFactory[WoodTypePrice]:
        """Create a new instance of the model."""
        if "wood_type" not in kwargs:
            kwargs["wood_type"] = await WoodTypePriceFactory.create()
        return await super()._create_model(model_class, *args, **kwargs)


class ProductFactory(BaseFactory[Product]):
    """product factory."""

    class Meta:
        model = Product

    volume = factory.Faker("pyfloat", positive=True, min_value=0.1, max_value=100)
    price = factory.Faker("pyfloat", positive=True, min_value=0.1, max_value=100)
    title = factory.Faker("text")
    descrioption = factory.Faker("text")
    delivery_possible = factory.Faker("boolean")
    pickup_location = factory.Faker("text")
    created_at = factory.Faker("date_time")
    updated_at = factory.Faker("date_time")

    @classmethod
    async def _create_model(
        cls, model_class: type[BaseFactory[Product]], *args: Any, **kwargs: Any
    ) -> BaseFactory[Product]:
        """Create a new instance of the model."""
        if "seller" not in kwargs:
            kwargs["seller"] = await SellerFactory.create()
        if "wood_type" not in kwargs:
            kwargs["wood_type"] = await WoodTypeFactory.create()
        return await super()._create_model(model_class, *args, **kwargs)


class WoodenBoardFactory(BaseFactory[WoodenBoard]):
    """wooden_board factory."""

    class Meta:
        model = WoodenBoard

    height = factory.Faker("pyfloat", positive=True, min_value=0.1, max_value=100)
    width = factory.Faker("pyfloat", positive=True, min_value=0.1, max_value=100)
    lenght = factory.Faker("pyfloat", positive=True, min_value=0.1, max_value=100)

    @classmethod
    async def _create_model(
        cls, model_class: type[BaseFactory[WoodenBoard]], *args: Any, **kwargs: Any
    ) -> BaseFactory[WoodenBoard]:
        """Create a new instance of the model."""
        if "image" not in kwargs:
            kwargs["image"] = await ImageFactory.create()
        return await super()._create_model(model_class, *args, **kwargs)


class ImageFactory(BaseFactory[Image]):
    """image factory."""

    class Meta:
        model = Image

    image_path = factory.Faker("text")

    @classmethod
    async def _create_model(
        cls, model_class: type[BaseFactory[Image]], *args: Any, **kwargs: Any
    ) -> BaseFactory[Image]:
        """Create a new instance of the model."""
        if "product" not in kwargs:
            kwargs["product"] = await ProductFactory.create()
        return await super()._create_model(model_class, *args, **kwargs)


class ChatThreadFactory(BaseFactory[ChatThread]):
    """chat_thread factory."""

    class Meta:
        model = ChatThread

    created_at = factory.Faker("date_time")

    @classmethod
    async def _create_model(
        cls, model_class: type[BaseFactory[ChatThread]], *args: Any, **kwargs: Any
    ) -> BaseFactory[ChatThread]:
        """Create a new instance of the model."""
        if "buyer" not in kwargs:
            kwargs["buyer"] = await BuyerFactory.create()
        if "seller" not in kwargs:
            kwargs["seller"] = await SellerFactory.create()
        return await super()._create_model(model_class, *args, **kwargs)


class ChatMessageFactory(BaseFactory[ChatMessage]):
    """chat_message factory."""

    class Meta:
        model = ChatMessage

    message = factory.Faker("text")
    is_read_by_buyer = factory.Faker("boolean")
    is_read_by_seller = factory.Faker("boolean")
    created_at = factory.Faker("date_time")

    @classmethod
    async def _create_model(
        cls, model_class: type[BaseFactory[ChatMessage]], *args: Any, **kwargs: Any
    ) -> BaseFactory[ChatMessage]:
        """Create a new instance of the model."""
        if "thread" not in kwargs:
            kwargs["thread"] = await ChatThreadFactory.create()
        if "buyer" not in kwargs:
            kwargs["buyer"] = await BuyerFactory.create()
        if "seller" not in kwargs:
            kwargs["seller"] = await SellerFactory.create()
        return await super()._create_model(model_class, *args, **kwargs)
