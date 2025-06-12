import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import ProductsPage from '../ProductsPage';
import { apiService } from '../../services/api';

// Mock API service
jest.mock('../../services/api', () => ({
  apiService: {
    getProducts: jest.fn(),
    searchProducts: jest.fn(),
    getWoodTypes: jest.fn(),
    getWoodTypePrices: jest.fn(),
    getSellers: jest.fn(),
    getProductImages: jest.fn(),
    getImageFileUrl: jest.fn()
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ProductsPage', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    apiService.getProducts.mockResolvedValue({
      data: [],
      total: 0
    });
    
    apiService.searchProducts.mockResolvedValue({
      data: [],
      total: 0
    });
    
    apiService.getWoodTypes.mockResolvedValue({
      data: [
        { id: '1', neme: 'Сосна' },
        { id: '2', neme: 'Дуб' }
      ],
      total: 2
    });
    
    apiService.getWoodTypePrices.mockResolvedValue({
      data: [
        { id: '1', wood_type_id: '1', price_per_cubic_meter: 15000 },
        { id: '2', wood_type_id: '2', price_per_cubic_meter: 25000 }
      ],
      total: 2
    });
    
    apiService.getSellers.mockResolvedValue({
      data: [
        { id: '1', neme: 'Продавец 1' },
        { id: '2', neme: 'Продавец 2' }
      ],
      total: 2
    });
    
    apiService.getProductImages.mockResolvedValue([]);
    apiService.getImageFileUrl.mockReturnValue('http://example.com/image.jpg');
  });

  test('renders products page with basic elements', async () => {
    render(
      <TestWrapper>
        <ProductsPage />
      </TestWrapper>
    );

    // Check if main elements are rendered (the title shows "Товары" not "Каталог товаров")
    expect(screen.getByText('Товары')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите название товара или описание...')).toBeInTheDocument();
    
    // Wait for filters to load
    await waitFor(() => {
      expect(screen.getByText('Тип древесины')).toBeInTheDocument();
      expect(screen.getByText('Продавец')).toBeInTheDocument();
      expect(screen.getByText('Сортировка')).toBeInTheDocument();
    });
  });

  test('search input is present and functional', async () => {
    render(
      <TestWrapper>
        <ProductsPage />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText('Введите название товара или описание...');
    expect(searchInput).toBeInTheDocument();
    
    // Type in search input
    fireEvent.change(searchInput, { target: { value: 'тест' } });
    expect(searchInput.value).toBe('тест');
  });

  test('filter elements are rendered', async () => {
    render(
      <TestWrapper>
        <ProductsPage />
      </TestWrapper>
    );

    // Wait for filters to load
    await waitFor(() => {
      expect(screen.getByText('Тип древесины')).toBeInTheDocument();
      expect(screen.getByText('Продавец')).toBeInTheDocument();
      expect(screen.getByText('Сортировка')).toBeInTheDocument();
      expect(screen.getByText('Цена, ₽')).toBeInTheDocument();
      expect(screen.getByText('Объем, м³')).toBeInTheDocument();
      expect(screen.getByText('Доставка')).toBeInTheDocument();
    });
  });

  test('reset filters button is present', async () => {
    render(
      <TestWrapper>
        <ProductsPage />
      </TestWrapper>
    );

    // Wait for page to load (there are multiple "Сбросить фильтры" buttons)
    await waitFor(() => {
      expect(screen.getAllByText('Сбросить фильтры')).toHaveLength(2);
    });
  });

  test('API calls are made on component mount', async () => {
    render(
      <TestWrapper>
        <ProductsPage />
      </TestWrapper>
    );

    // Wait for API calls
    await waitFor(() => {
      expect(apiService.getWoodTypes).toHaveBeenCalled();
      expect(apiService.getWoodTypePrices).toHaveBeenCalled();
      expect(apiService.getSellers).toHaveBeenCalled();
      expect(apiService.getProducts).toHaveBeenCalled();
    });
  });
});
