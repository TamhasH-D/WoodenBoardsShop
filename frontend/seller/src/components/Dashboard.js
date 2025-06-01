import React from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

// Mock seller ID - in real app this would come from authentication
const MOCK_SELLER_ID = '123e4567-e89b-12d3-a456-426614174000';

const Dashboard = React.memo(() => {
  const { data: healthData, loading: healthLoading, error: healthError } = useApi(() => apiService.healthCheck());
  const { data: products, loading: productsLoading, error: productsError } = useApi(() =>
    apiService.getSellerProducts(MOCK_SELLER_ID, 0, 5)
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">Overview of your business performance and system status</p>
      </div>

      {/* System Status */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">System Status</h2>
        </div>
        {healthLoading && <div className="loading">Checking system status...</div>}
        {healthError && (
          <div className="error">
            <strong>System Error:</strong> Unable to connect to backend services
          </div>
        )}
        {healthData && (
          <div className="success">
            <strong>System Online:</strong> All services are operational
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="flex gap-4">
          <a href="/products" className="btn btn-primary">Add Product</a>
          <a href="/chats" className="btn btn-secondary">View Messages</a>
          <a href="/wood-types" className="btn btn-secondary">Manage Wood Types</a>
        </div>
      </div>

      {/* Recent Products */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">Recent Products</h2>
        </div>
        {productsLoading && <div className="loading">Loading products...</div>}
        {productsError && (
          <div className="error">
            <strong>Error:</strong> {productsError}
          </div>
        )}
        {products?.data && products.data.length > 0 ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Wood Type</th>
                  <th>Dimensions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.data.slice(0, 5).map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.wood_type}</td>
                    <td>{product.length}×{product.width}×{product.height} cm</td>
                    <td>
                      <span className="status status-success">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
              <a href="/products" className="btn btn-secondary">View All Products</a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>No products found. <a href="/products" className="btn btn-primary">Add your first product</a></p>
          </div>
        )}
      </div>

      {/* Getting Started */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Getting Started</h2>
        </div>
        <p className="mb-4">Welcome to your seller dashboard! Use the navigation above to:</p>
        <ul>
          <li>Manage your wood product inventory</li>
          <li>Communicate with potential buyers</li>
          <li>Set wood types and pricing</li>
          <li>Update your seller profile</li>
        </ul>
      </div>
    </div>
  );
});

export default Dashboard;
