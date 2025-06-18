import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductDetailPage from '../ProductDetailPage';
import { apiService } from '../../services/api';
import { AppContext } from '../../contexts/AppContext';
import { NotificationContext } from '../../contexts/NotificationContext';

// Mock API service
jest.mock('../../services/api');

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useParams: jest.fn(),
  useNavigate: jest.fn(() => jest.fn()), // Mock navigate function
}));

const mockProduct = {
  id: 'test-product-id',
  title: 'Sample Product Title',
  neme: 'Sample Product Title', // Some data uses neme
  price: 15000,
  volume: 2.5,
  seller_id: 'seller-123',
  wood_type_id: 'wood-456',
  descrioption: 'This is a great sample product.',
  delivery_possible: true,
  has_pickup_location: true,
  pickup_location: '123 Sample St, Cityville',
  // image_url: 'https://via.placeholder.com/400', // Not directly tested for rendering
  // images: [{ id: 'img1', url: 'https://via.placeholder.com/400' }] // For ProductImageWithBoards
};

const mockSeller = {
  id: 'seller-123',
  neme: 'Super Seller Inc.', // Some data uses neme
  name: 'Super Seller Inc.',
  is_online: true,
  created_at: new Date().toISOString(),
};

const mockWoodType = {
  id: 'wood-456',
  neme: 'Oak', // Some data uses neme
  name: 'Oak',
};

const mockBoardsStats = {
  total_count: 123,
};

const mockAppContextValue = {
  setPageTitle: jest.fn(),
  // Add other context values if ProductDetailPage directly uses them
};

const mockNotificationContextValue = {
  showSuccess: jest.fn(),
  showError: jest.fn(),
};

// Helper function to render with providers
const renderWithProviders = (ui, { route = '/', path = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AppContext.Provider value={mockAppContextValue}>
        <NotificationContext.Provider value={mockNotificationContextValue}>
          <Routes>
            <Route path={path} element={ui} />
          </Routes>
        </NotificationContext.Provider>
      </AppContext.Provider>
    </MemoryRouter>
  );
};

describe('ProductDetailPage', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock useParams to return a product ID
    require('react-router-dom').useParams.mockReturnValue({ productId: 'test-product-id' });

    // Setup default successful API mocks
    apiService.getProduct.mockResolvedValue({ data: mockProduct });
    apiService.getSeller.mockResolvedValue({ data: mockSeller });
    apiService.getWoodType.mockResolvedValue({ data: mockWoodType });
    apiService.getProductBoardsStats.mockResolvedValue(mockBoardsStats); // Mocked with object, not {data: ...}
  });

  it('renders product details correctly, including board count', async () => {
    renderWithProviders(<ProductDetailPage />, {
      route: '/product/test-product-id',
      path: '/product/:productId',
    });

    // 1. Check for loading indicator (optional, but good practice)
    // Note: The loading state is very brief if APIs resolve immediately.
    // If it's too fast, we might not catch it reliably.
    // For this test, we'll focus on the content after loading.
    // expect(screen.getByText(/Загрузка товара.../i)).toBeInTheDocument();

    // 2. Wait for product title to appear (signals data has loaded)
    await waitFor(() => {
      expect(screen.getByText('Sample Product Title')).toBeInTheDocument();
    });

    // 3. Assertions for various product details
    expect(screen.getByText(/15000/)).toBeInTheDocument(); // Price (may need formatting adjustment)
    expect(screen.getByText(/2.5 м³/i)).toBeInTheDocument(); // Volume
    expect(screen.getByText('Oak')).toBeInTheDocument(); // Wood type
    expect(screen.getByText('Super Seller Inc.')).toBeInTheDocument(); // Seller name
    expect(screen.getByText('This is a great sample product.')).toBeInTheDocument(); // Description
    expect(screen.getByText('123 Sample St, Cityville')).toBeInTheDocument(); // Pickup location

    // 4. Crucially, check for the board count
    expect(screen.getByText('Количество досок')).toBeInTheDocument();
    expect(screen.getByText(String(mockBoardsStats.total_count))).toBeInTheDocument(); // '123'

    // 5. Check that delivery tag is present
    expect(screen.getByText('🚚 Доставка')).toBeInTheDocument();

    // 6. Check that page title was called (from AppContext)
    expect(mockAppContextValue.setPageTitle).toHaveBeenCalledWith('Sample Product Title');
  });

  it('shows loading state initially', () => {
    // Prevent API calls from resolving immediately
    apiService.getProduct.mockImplementation(() => new Promise(() => {})); // Pending promise

    renderWithProviders(<ProductDetailPage />, {
      route: '/product/test-product-id',
      path: '/product/:productId',
    });
    expect(screen.getByText(/Загрузка товара.../i)).toBeInTheDocument();
  });

  it('displays "Товар не найден" when getProduct fails', async () => {
    apiService.getProduct.mockRejectedValue(new Error('Product not found'));

    renderWithProviders(<ProductDetailPage />, {
      route: '/product/test-product-id-error',
      path: '/product/:productId',
    });

    await waitFor(() => {
      expect(screen.getByText('Товар не найден')).toBeInTheDocument();
    });
    expect(mockNotificationContextValue.showError).toHaveBeenCalledWith('Не удалось загрузить товар');
  });

  it('displays board count as 0 if getProductBoardsStats fails', async () => {
    apiService.getProductBoardsStats.mockRejectedValue(new Error('Failed to get stats'));

    renderWithProviders(<ProductDetailPage />, {
      route: '/product/test-product-id-board-error',
      path: '/product/:productId',
    });

    await waitFor(() => {
      expect(screen.getByText('Sample Product Title')).toBeInTheDocument(); // Wait for product to load
    });

    expect(screen.getByText('Количество досок')).toBeInTheDocument();
    // The component defaults to 0 on error in loadProductData
    expect(screen.getByText('0')).toBeInTheDocument();
  });

   it('displays board count as 0 if total_count is missing from stats', async () => {
    apiService.getProductBoardsStats.mockResolvedValue({}); // Missing total_count

    renderWithProviders(<ProductDetailPage />, {
      route: '/product/test-product-id-board-missing',
      path: '/product/:productId',
    });

    await waitFor(() => {
      expect(screen.getByText('Sample Product Title')).toBeInTheDocument();
    });

    expect(screen.getByText('Количество досок')).toBeInTheDocument();
    // The component defaults to 0 if total_count is falsy
    expect(screen.getByText('0')).toBeInTheDocument();
  });

});
