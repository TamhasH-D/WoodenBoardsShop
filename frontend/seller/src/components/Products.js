import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useApi, useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { SELLER_TEXTS, formatDateRu } from '../utils/localization';
import { testWoodenBoardsConnection, testImageAnalysisEndpoint, getWoodenBoardsConfig } from '../utils/testWoodenBoardsConnection';

// Mock seller ID - in real app this would come from authentication
const MOCK_SELLER_ID = '3ab0f210-ca78-4312-841b-8b1ae774adac';

function Products() {
  const [page, setPage] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    volume: '',
    price: '',
    delivery_possible: false,
    pickup_location: '',
    wood_type_id: '',
    seller_id: MOCK_SELLER_ID
  });
  const [editProduct, setEditProduct] = useState({
    title: '',
    description: '',
    volume: '',
    price: '',
    delivery_possible: false,
    pickup_location: '',
    wood_type_id: ''
  });

  // Image processing state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [boardHeight, setBoardHeight] = useState('50'); // mm
  const [boardLength, setBoardLength] = useState('1000'); // mm
  const [processingImage, setProcessingImage] = useState(false);
  const [imageProcessingError, setImageProcessingError] = useState(null);
  const [volumeCalculationResult, setVolumeCalculationResult] = useState(null);
  const [showVolumeDetails, setShowVolumeDetails] = useState(false);
  const fileInputRef = useRef(null);

  const { data, loading, error, refetch } = useApi(() => apiService.getSellerProducts(MOCK_SELLER_ID, page, 10), [page]);
  const { data: woodTypes, loading: woodTypesLoading, error: woodTypesError } = useApi(() => apiService.getAllWoodTypes(), []); // Fetch all wood types for dropdown
  const { data: woodTypePrices } = useApi(() => apiService.getAllWoodTypePrices(), []); // Fetch all wood type prices
  const { mutate, loading: mutating, error: mutationError, success } = useApiMutation();

  // Listen for auto-refresh events
  useEffect(() => {
    const handleAutoRefresh = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Products] Auto-refresh triggered, refetching data...');
      }
      refetch();
    };

    window.addEventListener('seller-auto-refresh', handleAutoRefresh);

    return () => {
      window.removeEventListener('seller-auto-refresh', handleAutoRefresh);
    };
  }, [refetch]);

  // Helper function to get wood type name by ID
  const getWoodTypeName = (woodTypeId) => {
    const woodType = woodTypes?.data?.find(type => type.id === woodTypeId);
    return woodType ? (woodType.neme || `Type ${woodType.id?.substring(0, 8)}`) : `Wood Type ${woodTypeId?.substring(0, 8)}...`;
  };

  // Helper function to get current price for a wood type (most recent by created_at)
  const getCurrentPrice = (woodTypeId) => {
    if (!woodTypePrices?.data || !woodTypeId) return null;

    const typePrices = woodTypePrices.data
      .filter(price => price.wood_type_id === woodTypeId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return typePrices[0] || null;
  };

  // Helper function to format price display
  const formatPrice = (price) => {
    if (!price) return SELLER_TEXTS.PRICE_NOT_SET || 'Цена не установлена';
    return `${price.price_per_m3} ₽/м³`;
  };

  // Image processing functions
  const handleImageSelect = useCallback((file) => {
    if (file.size > 10 * 1024 * 1024) {
      setImageProcessingError(SELLER_TEXTS.FILE_SIZE_ERROR);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setImageProcessingError(SELLER_TEXTS.INVALID_IMAGE_FILE);
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setImageProcessingError(null);
    setVolumeCalculationResult(null);
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  }, [handleImageSelect]);

  const handleDimensionInput = useCallback((value, setter) => {
    // Allow empty string for better UX while typing
    if (value === '') {
      setter('');
      return;
    }

    // Replace comma with dot and remove any non-numeric characters except dot
    const sanitizedValue = value.replace(',', '.').replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      return;
    }

    setter(sanitizedValue);
  }, []);

  const processImageForVolume = useCallback(async () => {
    if (!selectedImage) {
      setImageProcessingError(SELLER_TEXTS.SELECT_IMAGE_FIRST);
      return;
    }

    const height = parseFloat(boardHeight);
    const length = parseFloat(boardLength);

    if (isNaN(height) || height <= 0) {
      setImageProcessingError(SELLER_TEXTS.ENTER_VALID_HEIGHT);
      return;
    }

    if (isNaN(length) || length <= 0) {
      setImageProcessingError(SELLER_TEXTS.ENTER_VALID_LENGTH);
      return;
    }

    try {
      setProcessingImage(true);
      setImageProcessingError(null);

      // Call the image processing API
      const response = await apiService.analyzeBoardImage(selectedImage, height / 1000, length / 1000);
      const result = await response.json();

      setVolumeCalculationResult(result);
      setNewProduct(prev => ({
        ...prev,
        volume: result.total_volume.toFixed(4)
      }));
      setShowVolumeDetails(true);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Image processing failed:', err);
      }
      setImageProcessingError(err.message || SELLER_TEXTS.PROCESSING_FAILED);
    } finally {
      setProcessingImage(false);
    }
  }, [selectedImage, boardHeight, boardLength]);

  const clearImageData = useCallback(() => {
    setSelectedImage(null);
    setImagePreview(null);
    setVolumeCalculationResult(null);
    setImageProcessingError(null);
    setShowVolumeDetails(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!newProduct.title.trim()) {
      alert(SELLER_TEXTS.PRODUCT_TITLE_REQUIRED);
      return;
    }

    if (!newProduct.wood_type_id) {
      alert(SELLER_TEXTS.SELECT_WOOD_TYPE_REQUIRED);
      return;
    }

    const price = parseFloat(newProduct.price);

    if (isNaN(price) || price <= 0) {
      alert(SELLER_TEXTS.ENTER_VALID_PRICE);
      return;
    }

    try {
      // Check if we have image and volume calculation
      if (selectedImage && volumeCalculationResult) {
        // Use the new atomic transaction endpoint with image analysis
        const boardHeightMeters = parseFloat(boardHeight) / 1000; // Convert mm to meters
        const boardLengthMeters = parseFloat(boardLength) / 1000; // Convert mm to meters

        if (process.env.NODE_ENV === 'development') {
          console.log('Creating product with image analysis...');
        }
        const result = await mutate(() => apiService.createProductWithImage({
          title: newProduct.title.trim(),
          description: newProduct.description?.trim() || null,
          price: price,
          delivery_possible: newProduct.delivery_possible,
          pickup_location: newProduct.pickup_location?.trim() || null,
          seller_id: MOCK_SELLER_ID,
          wood_type_id: newProduct.wood_type_id
        }, selectedImage, boardHeightMeters, boardLengthMeters));

        if (process.env.NODE_ENV === 'development') {
          console.log('Product created with image analysis:', result);
        }
      } else {
        // Fallback to traditional product creation
        const volume = parseFloat(newProduct.volume);

        if (isNaN(volume) || volume <= 0) {
          alert(SELLER_TEXTS.ENTER_VALID_VOLUME);
          return;
        }

        await mutate(() => apiService.createProduct({
          title: newProduct.title.trim(),
          description: newProduct.description?.trim() || null,
          volume: volume,
          price: price,
          delivery_possible: newProduct.delivery_possible,
          pickup_location: newProduct.pickup_location?.trim() || null,
          seller_id: MOCK_SELLER_ID,
          wood_type_id: newProduct.wood_type_id
        }));
      }

      // Reset form
      setNewProduct({
        title: '',
        description: '',
        volume: '',
        price: '',
        delivery_possible: false,
        pickup_location: '',
        wood_type_id: '',
        seller_id: MOCK_SELLER_ID
      });
      clearImageData();
      setBoardHeight('50');
      setBoardLength('1000');
      setShowAddForm(false);
      refetch();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to add product:', err);
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm(SELLER_TEXTS.CONFIRM_DELETE_PRODUCT)) {
      try {
        await mutate(() => apiService.deleteProduct(productId));
        refetch();
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to delete product:', err);
        }
      }
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product.id);
    setEditProduct({
      title: product.title || '',
      description: product.descrioption || product.description || '',
      volume: product.volume?.toString() || '',
      price: product.price?.toString() || '',
      delivery_possible: product.delivery_possible || false,
      pickup_location: product.pickup_location || '',
      wood_type_id: product.wood_type_id || ''
    });
    setShowAddForm(false); // Close add form if open
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setEditProduct({
      title: '',
      description: '',
      volume: '',
      price: '',
      delivery_possible: false,
      pickup_location: '',
      wood_type_id: ''
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!editProduct.title.trim()) {
      alert(SELLER_TEXTS.PRODUCT_TITLE_REQUIRED);
      return;
    }

    if (!editProduct.wood_type_id) {
      alert(SELLER_TEXTS.SELECT_WOOD_TYPE_REQUIRED);
      return;
    }

    const volume = parseFloat(editProduct.volume);
    const price = parseFloat(editProduct.price);

    if (isNaN(volume) || volume <= 0) {
      alert(SELLER_TEXTS.ENTER_VALID_VOLUME);
      return;
    }

    if (isNaN(price) || price <= 0) {
      alert(SELLER_TEXTS.ENTER_VALID_PRICE);
      return;
    }

    try {
      await mutate(() => apiService.updateProduct(editingProduct, {
        title: editProduct.title.trim(),
        description: editProduct.description?.trim() || null,
        volume: volume,
        price: price,
        delivery_possible: editProduct.delivery_possible,
        pickup_location: editProduct.pickup_location?.trim() || null,
        wood_type_id: editProduct.wood_type_id
      }));

      handleCancelEdit();
      refetch();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to update product:', err);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{SELLER_TEXTS.PRODUCTS}</h1>
        <p className="page-description">{SELLER_TEXTS.MANAGE_INVENTORY_DESC}</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <p>{SELLER_TEXTS.TOTAL_PRODUCTS}: {data?.total || data?.data?.length || 0}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`btn ${showAddForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showAddForm ? SELLER_TEXTS.CANCEL : SELLER_TEXTS.ADD_PRODUCT}
          </button>
          <button
            onClick={refetch}
            className="btn btn-secondary"
            disabled={loading}
          >
            {loading ? SELLER_TEXTS.LOADING : SELLER_TEXTS.REFRESH}
          </button>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={async () => {
                if (process.env.NODE_ENV === 'development') {
                  console.log('=== Wooden Boards Connection Test ===');
                  console.log('Configuration:', getWoodenBoardsConfig());
                }

                const healthTest = await testWoodenBoardsConnection();
                if (process.env.NODE_ENV === 'development') {
                  console.log('Health Test Result:', healthTest);
                }

                const endpointTest = await testImageAnalysisEndpoint();
                if (process.env.NODE_ENV === 'development') {
                  console.log('Endpoint Test Result:', endpointTest);
                }

                alert(`Health: ${healthTest.success ? '✅' : '❌'}\nEndpoint: ${endpointTest.success ? '✅' : '❌'}\nCheck console for details`);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem' }}
            >
              🔧 Test AI Service
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error mb-4">
          <strong>Products Loading Issue:</strong> {error}
          <br />
          <small>This may occur if the seller doesn't exist in the database yet. Try refreshing or creating a product to initialize your seller account.</small>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={refetch} className="btn btn-secondary">
              Retry Loading Products
            </button>
          </div>
        </div>
      )}

      {mutationError && (
        <div className="error mb-4">
          <strong>Operation failed:</strong> {mutationError}
        </div>
      )}

      {success && (
        <div className="success mb-4">
          <strong>Success:</strong> Operation completed successfully!
        </div>
      )}

      {showAddForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">Add New Product</h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              Fill in the details below to add a new wood product to your inventory
            </p>
          </div>

          {/* Wood Types Loading/Error State */}
          {woodTypesError && (
            <div className="error mb-4">
              <strong>Wood Types Loading Error:</strong> {woodTypesError}
              <br />
              <small>
                Unable to load wood types. This may be due to server validation issues.
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    fontSize: 'var(--font-size-xs)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    cursor: 'pointer'
                  }}
                >
                  Refresh Page
                </button>
              </small>
            </div>
          )}

          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label className="form-label">Product Title *</label>
              <input
                type="text"
                className="form-input"
                value={newProduct.title}
                onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                placeholder="e.g., Premium Oak Boards, Pine Lumber Set"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-input"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                placeholder="Describe the wood quality, dimensions, condition, and any special features..."
                rows="4"
                maxLength={500}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                {newProduct.description.length}/500 characters (optional field)
              </small>
            </div>

            {/* Image Processing Section */}
            <div className="card mb-4" style={{ backgroundColor: 'var(--color-bg-light)', border: '1px solid var(--color-border)' }}>
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                  📸 Automated Volume Calculation
                </h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  Upload a photo of your wooden boards to automatically calculate volume using AI image processing
                </p>
              </div>

              {/* Image Upload */}
              <div className="form-group">
                <label className="form-label">Board Image</label>
                <div style={{
                  border: '2px dashed var(--color-border)',
                  borderRadius: 'var(--border-radius)',
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                  backgroundColor: selectedImage ? 'var(--color-bg)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageSelect(file);
                }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  {imagePreview ? (
                    <div>
                      <img
                        src={imagePreview}
                        alt="Board preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          borderRadius: 'var(--border-radius)',
                          marginBottom: 'var(--space-2)'
                        }}
                      />
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                        {selectedImage?.name} ({(selectedImage?.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImageData();
                        }}
                        className="btn btn-secondary"
                        style={{ fontSize: 'var(--font-size-xs)', padding: '0.25rem 0.5rem', marginTop: 'var(--space-2)' }}
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📷</div>
                      <div style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-1)' }}>
                        Click to upload or drag and drop
                      </div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                        Supports JPG, PNG, WebP (max 10MB)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dimension Inputs */}
              <div className="form-grid form-grid-2">
                <div className="form-group">
                  <label className="form-label">Board Height (mm) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={boardHeight}
                    onChange={(e) => handleDimensionInput(e.target.value, setBoardHeight)}
                    placeholder="50"
                    required
                  />
                  <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                    Thickness of the boards in millimeters
                  </small>
                </div>
                <div className="form-group">
                  <label className="form-label">Board Length (mm) *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={boardLength}
                    onChange={(e) => handleDimensionInput(e.target.value, setBoardLength)}
                    placeholder="1000"
                    required
                  />
                  <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                    Length of the boards in millimeters
                  </small>
                </div>
              </div>

              {/* Process Button */}
              <div className="form-group">
                <button
                  type="button"
                  onClick={processImageForVolume}
                  className="btn btn-primary"
                  disabled={!selectedImage || !boardHeight || !boardLength || processingImage}
                  style={{ width: '100%' }}
                >
                  {processingImage ? (
                    <>
                      <span style={{ marginRight: 'var(--space-2)' }}>🔄</span>
                      Processing Image...
                    </>
                  ) : (
                    <>
                      <span style={{ marginRight: 'var(--space-2)' }}>🤖</span>
                      Calculate Volume with AI
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {imageProcessingError && (
                <div className="error" style={{ marginTop: 'var(--space-2)' }}>
                  <strong>Processing Error:</strong> {imageProcessingError}
                </div>
              )}

              {/* Volume Calculation Results */}
              {volumeCalculationResult && (
                <div className="card" style={{
                  marginTop: 'var(--space-4)',
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-success)',
                  borderRadius: 'var(--border-radius)'
                }}>
                  <div className="card-header">
                    <h4 className="card-title" style={{
                      fontSize: 'var(--font-size-base)',
                      color: 'var(--color-success)',
                      marginBottom: 'var(--space-2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)'
                    }}>
                      ✅ Volume Calculation Complete
                    </h4>
                  </div>

                  {/* Summary */}
                  <div style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-bg-light)',
                    borderRadius: 'var(--border-radius)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    <div className="form-grid form-grid-2">
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                          Total Volume
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'var(--color-success)' }}>
                          {volumeCalculationResult.total_volume.toFixed(4)} m³
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                          Boards Detected
                        </div>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'var(--color-primary)' }}>
                          {volumeCalculationResult.total_count} boards
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Individual Board Details */}
                  {showVolumeDetails && volumeCalculationResult.wooden_boards && volumeCalculationResult.wooden_boards.length > 0 && (
                    <div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'var(--space-3)'
                      }}>
                        <h5 style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', margin: 0 }}>
                          Individual Board Analysis
                        </h5>
                        <button
                          type="button"
                          onClick={() => setShowVolumeDetails(false)}
                          className="btn btn-secondary"
                          style={{ fontSize: 'var(--font-size-xs)', padding: '0.25rem 0.5rem' }}
                        >
                          Hide Details
                        </button>
                      </div>

                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {volumeCalculationResult.wooden_boards.map((board, index) => (
                          <div key={index} style={{
                            padding: 'var(--space-3)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--border-radius)',
                            marginBottom: 'var(--space-2)',
                            backgroundColor: 'var(--color-bg)'
                          }}>
                            <div className="form-grid form-grid-3">
                              <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                                  Volume
                                </div>
                                <div style={{ fontWeight: '600' }}>
                                  {board.volume.toFixed(4)} m³
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                                  Width
                                </div>
                                <div style={{ fontWeight: '600' }}>
                                  {(board.width * 1000).toFixed(1)} mm
                                </div>
                              </div>
                              <div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)' }}>
                                  Confidence
                                </div>
                                <div style={{ fontWeight: '600', color: board.detection.confidence > 0.8 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                  {(board.detection.confidence * 100).toFixed(1)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Toggle Details Button */}
                  {!showVolumeDetails && volumeCalculationResult.wooden_boards && volumeCalculationResult.wooden_boards.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                      <button
                        type="button"
                        onClick={() => setShowVolumeDetails(true)}
                        className="btn btn-secondary"
                        style={{ fontSize: 'var(--font-size-sm)' }}
                      >
                        Show Individual Board Details
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">
                  Volume (m³) {volumeCalculationResult ? '' : '*'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000"
                  className="form-input"
                  value={volumeCalculationResult ? volumeCalculationResult.total_volume.toFixed(4) : newProduct.volume}
                  onChange={(e) => setNewProduct({...newProduct, volume: e.target.value})}
                  placeholder="0.00"
                  required={!volumeCalculationResult}
                  disabled={volumeCalculationResult}
                  style={{
                    backgroundColor: volumeCalculationResult ? 'var(--color-bg-light)' : 'var(--color-bg)',
                    borderColor: volumeCalculationResult ? 'var(--color-success)' : 'var(--color-border)',
                    cursor: volumeCalculationResult ? 'not-allowed' : 'text'
                  }}
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  {volumeCalculationResult
                    ? '✅ Volume calculated automatically from image processing'
                    : 'Total volume in cubic meters (can be calculated automatically with image upload)'}
                </small>
              </div>
              <div className="form-group">
                <label className="form-label">Цена (₽) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999"
                  className="form-input"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
                <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                  Price per cubic meter
                </small>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Wood Type *</label>
              {woodTypesLoading ? (
                <div className="form-input" style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-text-light)',
                  cursor: 'not-allowed',
                  backgroundColor: 'var(--color-bg-light)'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>🔄</span>
                  Loading wood types... (Fetching all available types)
                </div>
              ) : (
                <select
                  className="form-input"
                  value={newProduct.wood_type_id}
                  onChange={(e) => setNewProduct({...newProduct, wood_type_id: e.target.value})}
                  required
                  disabled={woodTypesError || !woodTypes?.data}
                >
                  <option value="">
                    {woodTypes?.data?.length > 0 ? 'Select wood type...' : 'No wood types available'}
                  </option>
                  {woodTypes?.data?.map((type) => {
                    const currentPrice = getCurrentPrice(type.id);
                    const typeName = type.neme || `Wood Type ${type.id?.substring(0, 8)}`;
                    const priceDisplay = currentPrice ? ` - ${formatPrice(currentPrice)}` : ' - Цена не установлена';
                    return (
                      <option key={type.id} value={type.id}>
                        {typeName}{priceDisplay}
                      </option>
                    );
                  })}
                </select>
              )}
              {woodTypes?.data?.length === 0 && !woodTypesLoading && !woodTypesError && (
                <small style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-xs)' }}>
                  No wood types found. Contact administrator to add wood types.
                </small>
              )}
              {woodTypes?.data?.length > 0 && !woodTypesLoading && !woodTypesError && (
                <small style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-xs)' }}>
                  ✅ {woodTypes.data.length} wood types loaded successfully
                </small>
              )}
              {newProduct.wood_type_id && (
                <div style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--color-bg-light)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                    💰 Текущая цена для выбранного типа древесины:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                    {formatPrice(getCurrentPrice(newProduct.wood_type_id))}
                  </div>
                  {getCurrentPrice(newProduct.wood_type_id) && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginTop: 'var(--space-1)' }}>
                      Обновлено: {new Date(getCurrentPrice(newProduct.wood_type_id).created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Location</label>
              <input
                type="text"
                className="form-input"
                value={newProduct.pickup_location}
                onChange={(e) => setNewProduct({...newProduct, pickup_location: e.target.value})}
                placeholder="e.g., 123 Main St, City, State or Warehouse A, Section 5"
                maxLength={200}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                Where buyers can pick up this product (optional)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={newProduct.delivery_possible}
                  onChange={(e) => setNewProduct({...newProduct, delivery_possible: e.target.checked})}
                />
                <span>Delivery Available</span>
              </label>
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)', marginLeft: '1.5rem' }}>
                Check if you can deliver this product to buyers
              </small>
            </div>

            <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mutating || woodTypesLoading || !woodTypes?.data?.length}
              >
                {mutating ? 'Adding Product...' : 'Add Product'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  clearImageData();
                  setBoardHeight('50');
                  setBoardLength('1000');
                  setShowAddForm(false);
                }}
                disabled={mutating}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Form */}
      {editingProduct && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="card-title">{SELLER_TEXTS.EDIT_PRODUCT}</h2>
            <p style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)' }}>
              {SELLER_TEXTS.UPDATE_PRODUCT_DETAILS}
            </p>
          </div>

          <form onSubmit={handleUpdateProduct}>
            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.PRODUCT_TITLE} *</label>
              <input
                type="text"
                className="form-input"
                value={editProduct.title}
                onChange={(e) => setEditProduct({...editProduct, title: e.target.value})}
                placeholder="e.g., Premium Oak Boards, Pine Lumber Set"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.DESCRIPTION} ({SELLER_TEXTS.OPTIONAL})</label>
              <textarea
                className="form-input"
                value={editProduct.description}
                onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                placeholder={SELLER_TEXTS.DESCRIPTION_PLACEHOLDER}
                rows="4"
                maxLength={500}
              />
              <small style={{ color: 'var(--color-text-light)', fontSize: 'var(--font-size-xs)' }}>
                {editProduct.description.length}/500 {SELLER_TEXTS.CHARACTERS} ({SELLER_TEXTS.OPTIONAL_FIELD})
              </small>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">{SELLER_TEXTS.VOLUME} (м³) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000"
                  className="form-input"
                  value={editProduct.volume}
                  onChange={(e) => setEditProduct({...editProduct, volume: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{SELLER_TEXTS.PRICE} (₽) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999"
                  className="form-input"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.WOOD_TYPE} *</label>
              {woodTypesLoading ? (
                <div className="form-input" style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--color-text-light)',
                  cursor: 'not-allowed',
                  backgroundColor: 'var(--color-bg-light)'
                }}>
                  <span style={{ marginRight: '0.5rem' }}>🔄</span>
                  {SELLER_TEXTS.LOADING_WOOD_TYPES}
                </div>
              ) : (
                <select
                  className="form-input"
                  value={editProduct.wood_type_id}
                  onChange={(e) => setEditProduct({...editProduct, wood_type_id: e.target.value})}
                  required
                  disabled={woodTypesError || !woodTypes?.data}
                >
                  <option value="">
                    {woodTypes?.data?.length > 0 ? SELLER_TEXTS.SELECT_WOOD_TYPE : SELLER_TEXTS.NO_WOOD_TYPES_AVAILABLE}
                  </option>
                  {woodTypes?.data?.map((type) => {
                    const currentPrice = getCurrentPrice(type.id);
                    const typeName = type.neme || `Wood Type ${type.id?.substring(0, 8)}`;
                    const priceDisplay = currentPrice ? ` - ${formatPrice(currentPrice)}` : ' - Цена не установлена';
                    return (
                      <option key={type.id} value={type.id}>
                        {typeName}{priceDisplay}
                      </option>
                    );
                  })}
                </select>
              )}
              {editProduct.wood_type_id && (
                <div style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-2)',
                  backgroundColor: 'var(--color-bg-light)',
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--color-border)'
                }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', marginBottom: 'var(--space-1)' }}>
                    💰 Текущая цена для выбранного типа древесины:
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>
                    {formatPrice(getCurrentPrice(editProduct.wood_type_id))}
                  </div>
                  {getCurrentPrice(editProduct.wood_type_id) && (
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-light)', marginTop: 'var(--space-1)' }}>
                      Обновлено: {new Date(getCurrentPrice(editProduct.wood_type_id).created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">{SELLER_TEXTS.PICKUP_LOCATION}</label>
              <input
                type="text"
                className="form-input"
                value={editProduct.pickup_location}
                onChange={(e) => setEditProduct({...editProduct, pickup_location: e.target.value})}
                placeholder={SELLER_TEXTS.PICKUP_LOCATION_PLACEHOLDER}
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={editProduct.delivery_possible}
                  onChange={(e) => setEditProduct({...editProduct, delivery_possible: e.target.checked})}
                />
                <span>{SELLER_TEXTS.DELIVERY_AVAILABLE}</span>
              </label>
            </div>

            <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={mutating || woodTypesLoading || !woodTypes?.data?.length}
              >
                {mutating ? SELLER_TEXTS.UPDATING_PRODUCT : SELLER_TEXTS.UPDATE_PRODUCT}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelEdit}
                disabled={mutating}
              >
                {SELLER_TEXTS.CANCEL}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="loading">{SELLER_TEXTS.LOADING_PRODUCTS}</div>
      )}

      {data && (
        <>
          {data.data && data.data.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Объем (м³)</th>
                  <th>Цена (₽)</th>
                  <th>Тип древесины</th>
                  <th>Доставка</th>
                  <th>Создано</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div>
                        <strong>{product.title}</strong>
                        {(product.descrioption || product.description) && (
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                            {((product.descrioption || product.description).length > 50)
                              ? `${(product.descrioption || product.description).substring(0, 50)}...`
                              : (product.descrioption || product.description)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{product.volume}</td>
                    <td>{product.price} ₽</td>
                    <td>{getWoodTypeName(product.wood_type_id)}</td>
                    <td>
                      <span className={`status ${product.delivery_possible ? 'status-success' : 'status-warning'}`}>
                        {product.delivery_possible ? SELLER_TEXTS.DELIVERY_AVAILABLE : SELLER_TEXTS.PICKUP_ONLY}
                      </span>
                    </td>
                    <td>{formatDateRu(product.created_at, 'SHORT')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="btn btn-primary"
                          disabled={mutating || editingProduct === product.id}
                          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                        >
                          {SELLER_TEXTS.EDIT}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="btn btn-secondary"
                          disabled={mutating}
                          style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
                        >
                          {mutating ? SELLER_TEXTS.DELETING : SELLER_TEXTS.DELETE}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center">
              <p>{SELLER_TEXTS.NO_PRODUCTS_FOUND}</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary mt-4"
              >
                {SELLER_TEXTS.ADD_FIRST_PRODUCT}
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0 || loading}
              className="btn btn-secondary"
            >
              {SELLER_TEXTS.PREVIOUS}
            </button>
            <span>{SELLER_TEXTS.PAGE} {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!data?.data || data.data.length < 10 || loading}
              className="btn btn-secondary"
            >
              {SELLER_TEXTS.NEXT}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Products;
