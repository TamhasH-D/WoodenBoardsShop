// Mock the axios module. The factory creates the instance structure with jest.fn().
jest.mock('axios', () => {
  // This object and its methods are created ONCE when Jest processes this mock factory.
  // This is the actual object that api.js will receive when it calls axios.create().
  const MOCKED_INSTANCE = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn(success => success, error => Promise.reject(error)) },
      response: { use: jest.fn(success => success, error => Promise.reject(error)) },
    },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => MOCKED_INSTANCE),
      isCancel: jest.requireActual('axios').isCancel,
    },
    create: jest.fn(() => MOCKED_INSTANCE),
  };
});

import { apiService } from '../api';
import axios from 'axios'; // Import the mocked axios (default export)

// Polyfills
if (typeof FormData === 'undefined') {
  global.FormData = class FormData {
    constructor() { this.entriesArray = []; }
    append(key, value) { this.entriesArray.push([key, value]); }
    get(key) { const entry = this.entriesArray.find(e => e[0] === key); return entry ? entry[1] : null; }
    has(key) { return this.entriesArray.some(e => e[0] === key); }
    *entries() { for (const entry of this.entriesArray) { yield entry; } }
  };
}
if (typeof File === 'undefined') {
  global.File = class File {
    constructor(bits, name, options) { this.bits = bits; this.name = name; this.options = options || {}; this.size = (bits[0] && bits[0].length) || 0; this.type = this.options.type || ''; }
  };
}

describe('apiService', () => {
  let instanceUsedByApiService;
  let postToAssertOn;

  beforeAll(() => {
    // axios.create() is called when api.js is first imported.
    // This call happens BEFORE any test or beforeEach runs.
    // We retrieve the instance created at that time.
    // This assumes api.js uses `import axios from 'axios'; axios.create()`.
    // `axios` imported here is the default export of our mock.
    const createMock = axios.create; // This is the jest.fn() from our mock's default export
    if (createMock.mock.calls.length > 0) {
      instanceUsedByApiService = createMock.mock.results[0].value;
    } else {
      // Fallback if the named export was used by api.js (less likely)
      const actualMockedModule = require('axios'); // Gets the full module from the mock
      if (actualMockedModule.create.mock.calls.length > 0) {
        instanceUsedByApiService = actualMockedModule.create.mock.results[0].value;
      } else {
        throw new Error("Test setup critical error: axios.create() was not called during api.js import as expected. Cannot get the API instance.");
      }
    }
  });

  beforeEach(() => {
    // Now, reset and re-configure methods on this persistent instance for the current test.
    if (!instanceUsedByApiService) { // Should not happen if beforeAll succeeded
        throw new Error("Test setup failed: instanceUsedByApiService is not defined.");
    }
    instanceUsedByApiService.post.mockReset().mockResolvedValue({ data: { message: 'Test Success' } });
    instanceUsedByApiService.get.mockReset().mockResolvedValue({ data: {} });
    instanceUsedByApiService.patch.mockReset().mockResolvedValue({ data: {} });
    instanceUsedByApiService.delete.mockReset().mockResolvedValue({ data: {} });

    if (instanceUsedByApiService.interceptors) {
        instanceUsedByApiService.interceptors.request.use.mockClear();
        instanceUsedByApiService.interceptors.response.use.mockClear();
    }

    postToAssertOn = instanceUsedByApiService.post;
  });

  // No afterEach(jest.clearAllMocks) to preserve mock.calls on axios.create itself if needed for other tests,
  // and because beforeEach is now responsible for resetting the instance methods.

  describe('createProductWithAnalysis', () => {
    const baseProductData = {
      keycloak_id: 'test-keycloak-id', title: 'Test Product', wood_type_id: 'wood-type-uuid-123',
      board_height: 50, board_length: 1000, volume: 0.5, price: 100.99, delivery_possible: true,
    };
    const imageFile = new File(['dummy image content'], 'test-image.jpg', { type: 'image/jpeg' });

    it('should call /api/v1/products/with-image with correct FormData for a full product', async () => {
      const fullProductData = { ...baseProductData, description: 'This is a detailed description.', pickup_location: 'Warehouse A'};
      await apiService.createProductWithAnalysis(fullProductData, imageFile);

      expect(postToAssertOn).toHaveBeenCalledTimes(1);
      expect(postToAssertOn).toHaveBeenCalledWith(
        '/api/v1/products/with-image', expect.any(FormData),
        expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' }, timeout: 60000 })
      );
      const formData = postToAssertOn.mock.calls[0][1];
      expect(formData.get('keycloak_id')).toBe(fullProductData.keycloak_id);
      expect(formData.get('title')).toBe(fullProductData.title);
      // ... (rest of assertions) ...
      expect(formData.get('description')).toBe(fullProductData.description);
      expect(formData.get('wood_type_id')).toBe(fullProductData.wood_type_id);
      expect(formData.get('board_height')).toBe(String(fullProductData.board_height));
      expect(formData.get('board_length')).toBe(String(fullProductData.board_length));
      expect(formData.get('volume')).toBe(String(fullProductData.volume));
      expect(formData.get('price')).toBe(String(fullProductData.price));
      expect(formData.get('delivery_possible')).toBe(String(fullProductData.delivery_possible));
      expect(formData.get('pickup_location')).toBe(fullProductData.pickup_location);
      expect(formData.get('image')).toBe(imageFile);
    });

    it('should not append description if empty string', async () => {
      const productData = { ...baseProductData, description: '', pickup_location: 'Warehouse B' };
      await apiService.createProductWithAnalysis(productData, imageFile);
      const formData = postToAssertOn.mock.calls[0][1];
      expect(formData.has('description')).toBe(false);
      expect(formData.get('pickup_location')).toBe(productData.pickup_location);
    });

    it('should not append description if null', async () => {
      const productData = { ...baseProductData, description: null, pickup_location: 'Warehouse C' };
      await apiService.createProductWithAnalysis(productData, imageFile);
      const formData = postToAssertOn.mock.calls[0][1];
      expect(formData.has('description')).toBe(false);
    });

    it('should not append pickup_location if empty string', async () => {
      const productData = { ...baseProductData, description: 'A valid desc', pickup_location: '' };
      await apiService.createProductWithAnalysis(productData, imageFile);
      const formData = postToAssertOn.mock.calls[0][1];
      expect(formData.has('pickup_location')).toBe(false);
      expect(formData.get('description')).toBe(productData.description);
    });

    it('should not append pickup_location if null', async () => {
      const productData = { ...baseProductData, description: 'Another valid desc', pickup_location: null };
      await apiService.createProductWithAnalysis(productData, imageFile);
      const formData = postToAssertOn.mock.calls[0][1];
      expect(formData.has('pickup_location')).toBe(false);
    });

    it('should throw if imageFile is null or undefined', async () => {
      const productData = { ...baseProductData };
      await expect(apiService.createProductWithAnalysis(productData, null))
        .rejects.toThrow('Image file is required to create a product with an image.');
      await expect(apiService.createProductWithAnalysis(productData, undefined))
        .rejects.toThrow('Image file is required to create a product with an image.');
      expect(postToAssertOn).not.toHaveBeenCalled();
    });

    it('should clear caches on successful product creation', async () => {
      const productData = { ...baseProductData, description: 'Cache test' };
      const sellerCacheSpy = jest.spyOn(apiService, 'clearSellerProductsCache');
      sellerCacheSpy.mockImplementation(() => {});

      await apiService.createProductWithAnalysis(productData, imageFile);

      expect(postToAssertOn).toHaveBeenCalledTimes(1);
      expect(sellerCacheSpy).toHaveBeenCalledTimes(1);
      sellerCacheSpy.mockRestore();
    });
  });
});
