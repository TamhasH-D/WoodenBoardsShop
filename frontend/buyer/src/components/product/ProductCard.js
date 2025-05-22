import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ProductCard = ({
  id,
  title,
  price,
  volume,
  woodType,
  imageSrc,
  deliveryPossible,
  pickupLocation,
  description
}) => {
  // Format price with thousand separators
  const formattedPrice = price ? price.toLocaleString('ru-RU') : '0';

  return (
    <Card hover={true} padding={false} className="flex flex-col h-full transition-transform duration-300 hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageSrc || `https://via.placeholder.com/300x200?text=${encodeURIComponent(title || 'Товар')}`}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(title || 'Товар')}`;
          }}
        />
        {deliveryPossible && (
          <div className="absolute top-2 right-2 bg-wood-accent text-white text-xs px-2 py-1 rounded-full">
            Доставка
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-sm text-wood-medium">{woodType}</span>
        </div>
        <h3 className="text-lg font-semibold text-wood-text mb-2 line-clamp-2">{title}</h3>

        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div>
            <p className="text-xl font-bold text-wood-dark">{formattedPrice} ₽</p>
            <p className="text-sm text-gray-500">Объем: {volume} м³</p>
          </div>
          <Link to={`/product/${id}`}>
            <Button variant="outline" size="sm">
              Подробнее
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

// Default props
ProductCard.defaultProps = {
  title: 'Товар без названия',
  price: 0,
  volume: 0,
  woodType: 'Неизвестный тип',
  deliveryPossible: false,
  imageSrc: null
};

export default ProductCard;
