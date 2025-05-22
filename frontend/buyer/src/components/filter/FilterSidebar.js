import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const FilterSidebar = ({ 
  woodTypes = [], 
  priceRange = { min: 0, max: 100000 },
  onFilterChange,
  className = ''
}) => {
  const [selectedWoodTypes, setSelectedWoodTypes] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([priceRange.min, priceRange.max]);
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleWoodTypeChange = (woodTypeId) => {
    setSelectedWoodTypes(prev => {
      if (prev.includes(woodTypeId)) {
        return prev.filter(id => id !== woodTypeId);
      } else {
        return [...prev, woodTypeId];
      }
    });
  };

  const handlePriceChange = (index, value) => {
    const newPriceRange = [...selectedPriceRange];
    newPriceRange[index] = Number(value);
    setSelectedPriceRange(newPriceRange);
  };

  const handleDeliveryChange = () => {
    setDeliveryOnly(!deliveryOnly);
  };

  const applyFilters = () => {
    onFilterChange({
      woodTypes: selectedWoodTypes,
      priceRange: selectedPriceRange,
      deliveryOnly
    });
  };

  const resetFilters = () => {
    setSelectedWoodTypes([]);
    setSelectedPriceRange([priceRange.min, priceRange.max]);
    setDeliveryOnly(false);
    onFilterChange({
      woodTypes: [],
      priceRange: [priceRange.min, priceRange.max],
      deliveryOnly: false
    });
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <Button 
          onClick={toggleFilter} 
          variant="outline" 
          fullWidth
          className="flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
          </svg>
          Фильтры
        </Button>
      </div>

      {/* Filter sidebar - hidden on mobile unless toggled */}
      <Card className={`${className} ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        <h2 className="text-xl font-semibold text-wood-text mb-6">Фильтры</h2>
        
        {/* Wood Types */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-wood-text mb-3">Тип древесины</h3>
          <div className="space-y-2">
            {woodTypes.map(type => (
              <label key={type.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-wood-accent rounded border-gray-300 focus:ring-wood-accent"
                  checked={selectedWoodTypes.includes(type.id)}
                  onChange={() => handleWoodTypeChange(type.id)}
                />
                <span className="ml-2 text-wood-text">{type.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-wood-text mb-3">Цена, ₽</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="form-input w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                placeholder="От"
                min={priceRange.min}
                max={selectedPriceRange[1]}
                value={selectedPriceRange[0]}
                onChange={(e) => handlePriceChange(0, e.target.value)}
              />
              <span className="text-gray-500">—</span>
              <input
                type="number"
                className="form-input w-full rounded-lg border-gray-300 focus:border-wood-accent focus:ring focus:ring-wood-accent focus:ring-opacity-50"
                placeholder="До"
                min={selectedPriceRange[0]}
                max={priceRange.max}
                value={selectedPriceRange[1]}
                onChange={(e) => handlePriceChange(1, e.target.value)}
              />
            </div>
            <input
              type="range"
              min={priceRange.min}
              max={priceRange.max}
              value={selectedPriceRange[1]}
              onChange={(e) => handlePriceChange(1, e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
        
        {/* Delivery Option */}
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-wood-accent rounded border-gray-300 focus:ring-wood-accent"
              checked={deliveryOnly}
              onChange={handleDeliveryChange}
            />
            <span className="ml-2 text-wood-text">Только с доставкой</span>
          </label>
        </div>
        
        {/* Filter Actions */}
        <div className="flex flex-col space-y-2">
          <Button onClick={applyFilters} fullWidth>
            Применить
          </Button>
          <Button onClick={resetFilters} variant="ghost" fullWidth>
            Сбросить
          </Button>
        </div>
      </Card>
    </>
  );
};

export default FilterSidebar;
