import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PriceCalculator = ({ woodTypes = [], loading = false }) => {
  const [selectedWoodType, setSelectedWoodType] = useState('');
  const [calculationType, setCalculationType] = useState('volume'); // 'volume' or 'dimensions'
  const [volume, setVolume] = useState(1);
  const [dimensions, setDimensions] = useState({ length: 1, width: 0.1, height: 0.1 });
  const [price, setPrice] = useState(0);
  const [pricePerM3, setPricePerM3] = useState(0);
  const [orderDetails, setOrderDetails] = useState('');
  const [showOrderForm, setShowOrderForm] = useState(false);

  // Find the selected wood type price when it changes
  useEffect(() => {
    if (selectedWoodType && woodTypes.length > 0) {
      const selectedType = woodTypes.find(type => type.id === selectedWoodType);
      if (selectedType) {
        setPricePerM3(selectedType.pricePerM3);
      }
    } else {
      setPricePerM3(0);
    }
  }, [selectedWoodType, woodTypes]);

  // Calculate price when inputs change
  useEffect(() => {
    let calculatedVolume;

    if (calculationType === 'volume') {
      calculatedVolume = volume;
    } else {
      // Convert dimensions from meters to cubic meters
      calculatedVolume = dimensions.length * dimensions.width * dimensions.height;
    }

    setPrice(calculatedVolume * pricePerM3);

    // Update order details
    if (selectedWoodType) {
      const selectedType = woodTypes.find(type => type.id === selectedWoodType);
      const woodTypeName = selectedType ? selectedType.name : 'Неизвестный тип';

      let details = `Тип древесины: ${woodTypeName}\n`;
      details += `Цена за м³: ${pricePerM3.toLocaleString('ru-RU')} ₽\n`;

      if (calculationType === 'volume') {
        details += `Объем: ${volume} м³\n`;
      } else {
        details += `Размеры: ${dimensions.length}м × ${dimensions.width}м × ${dimensions.height}м\n`;
        details += `Расчетный объем: ${(dimensions.length * dimensions.width * dimensions.height).toFixed(3)} м³\n`;
      }

      details += `Итоговая стоимость: ${price.toLocaleString('ru-RU')} ₽`;

      setOrderDetails(details);
    }
  }, [calculationType, volume, dimensions, pricePerM3, selectedWoodType, woodTypes, price]);

  const handleWoodTypeChange = (e) => {
    setSelectedWoodType(e.target.value);
  };

  const handleCalculationTypeChange = (type) => {
    setCalculationType(type);
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value) || 0);
  };

  const handleDimensionChange = (dimension, value) => {
    setDimensions(prev => ({
      ...prev,
      [dimension]: parseFloat(value) || 0
    }));
  };

  const handleOrderClick = () => {
    setShowOrderForm(true);
  };

  const handleSaveCalculation = () => {
    // Here we would save the calculation to the user's account
    // For now, just show an alert
    alert('Расчет сохранен!');
  };

  // Show loading state
  if (loading) {
    return (
      <Card className="max-w-lg mx-auto animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/2 mb-6"></div>

        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>

        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-12 bg-gray-300 rounded w-full"></div>
        </div>

        <div className="mb-6">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>

        <div className="h-20 bg-gray-300 rounded w-full mb-6"></div>

        <div className="flex space-x-4">
          <div className="h-12 bg-gray-300 rounded w-full"></div>
          <div className="h-12 bg-gray-300 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  // Show order form if requested
  if (showOrderForm) {
    return (
      <Card className="max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-wood-text mb-6">Оформление заказа</h2>

        <div className="mb-6">
          <label className="block text-wood-text font-medium mb-2">Детали заказа</label>
          <textarea
            value={orderDetails}
            readOnly
            className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50 h-40"
          />
        </div>

        <div className="mb-6">
          <label className="block text-wood-text font-medium mb-2">Имя</label>
          <input
            type="text"
            className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            placeholder="Введите ваше имя"
          />
        </div>

        <div className="mb-6">
          <label className="block text-wood-text font-medium mb-2">Телефон</label>
          <input
            type="tel"
            className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            placeholder="+7 (___) ___-__-__"
          />
        </div>

        <div className="mb-6">
          <label className="block text-wood-text font-medium mb-2">Адрес доставки</label>
          <textarea
            className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            placeholder="Введите адрес доставки"
            rows={3}
          />
        </div>

        <div className="flex space-x-4">
          <Button variant="primary" fullWidth>
            Отправить заказ
          </Button>
          <Button variant="outline" fullWidth onClick={() => setShowOrderForm(false)}>
            Вернуться к расчету
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <h2 className="text-xl font-semibold text-wood-text mb-6">Калькулятор стоимости</h2>

      {/* Wood Type Selection */}
      <div className="mb-6">
        <label className="block text-wood-text font-medium mb-2">Тип древесины</label>
        <select
          value={selectedWoodType}
          onChange={handleWoodTypeChange}
          className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
        >
          <option value="">Выберите тип древесины</option>
          {woodTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name} - {type.pricePerM3.toLocaleString('ru-RU')} ₽/м³
            </option>
          ))}
        </select>
      </div>

      {/* Calculation Type Toggle */}
      <div className="mb-6">
        <label className="block text-wood-text font-medium mb-2">Способ расчета</label>
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          <button
            type="button"
            className={`flex-1 py-2 px-4 text-center ${
              calculationType === 'volume'
                ? 'bg-wood-accent text-white'
                : 'bg-white text-wood-text hover:bg-gray-100'
            }`}
            onClick={() => handleCalculationTypeChange('volume')}
          >
            По объему
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-4 text-center ${
              calculationType === 'dimensions'
                ? 'bg-wood-accent text-white'
                : 'bg-white text-wood-text hover:bg-gray-100'
            }`}
            onClick={() => handleCalculationTypeChange('dimensions')}
          >
            По размерам
          </button>
        </div>
      </div>

      {/* Volume Input */}
      {calculationType === 'volume' && (
        <div className="mb-6">
          <label className="block text-wood-text font-medium mb-2">Объем (м³)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
          />
        </div>
      )}

      {/* Dimensions Input */}
      {calculationType === 'dimensions' && (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-wood-text font-medium mb-2">Длина (м)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={dimensions.length}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-wood-text font-medium mb-2">Ширина (м)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-wood-text font-medium mb-2">Высота (м)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
            />
          </div>
          <div className="pt-2">
            <p className="text-wood-text">
              Расчетный объем: <span className="font-semibold">{(dimensions.length * dimensions.width * dimensions.height).toFixed(3)} м³</span>
            </p>
          </div>
        </div>
      )}

      {/* Price Display */}
      <div className="bg-wood-light bg-opacity-30 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-wood-text font-medium">Стоимость:</span>
          <span className="text-2xl font-bold text-wood-dark">
            {price.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽
          </span>
        </div>
        {selectedWoodType && (
          <div className="text-sm text-gray-600 mt-1">
            Цена за м³: {pricePerM3.toLocaleString('ru-RU')} ₽
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button variant="primary" fullWidth onClick={handleOrderClick} disabled={!selectedWoodType}>
          Заказать
        </Button>
        <Button variant="outline" fullWidth onClick={handleSaveCalculation} disabled={!selectedWoodType}>
          Сохранить расчет
        </Button>
      </div>
    </Card>
  );
};

export default PriceCalculator;
