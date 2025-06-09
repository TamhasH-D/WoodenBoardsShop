import React, { useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';
import { SELLER_TEXTS } from '../utils/localization';
import { MOCK_IDS } from '../utils/constants';

// Use shared mock seller ID
const MOCK_SELLER_ID = MOCK_IDS.SELLER_ID;

const Dashboard = React.memo(() => {
  // Create stable API functions to prevent infinite loops
  const healthApiFunction = useMemo(() => () => apiService.healthCheck(), []);
  const productsApiFunction = useMemo(() => () => apiService.getSellerProducts(MOCK_SELLER_ID, 0, 5), []);

  const { data: healthData, loading: healthLoading, error: healthError } = useApi(healthApiFunction, []);
  const { data: products, loading: productsLoading, error: productsError } = useApi(productsApiFunction, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{SELLER_TEXTS.DASHBOARD}</h1>
        <p className="page-description">{SELLER_TEXTS.BUSINESS_OVERVIEW}</p>
      </div>

      {/* System Status */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">{SELLER_TEXTS.SYSTEM_STATUS}</h2>
        </div>
        {healthLoading && <div className="loading">{SELLER_TEXTS.CHECKING_SYSTEM_STATUS}</div>}
        {healthError && (
          <div className="error">
            <strong>{SELLER_TEXTS.SYSTEM_ERROR}:</strong> {SELLER_TEXTS.UNABLE_CONNECT_BACKEND}
          </div>
        )}
        {healthData && (
          <div className="success">
            <strong>{SELLER_TEXTS.SYSTEM_ONLINE}:</strong> {SELLER_TEXTS.ALL_SERVICES_OPERATIONAL}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">{SELLER_TEXTS.QUICK_ACTIONS}</h2>
        </div>
        <div className="flex gap-4">
          <a href="/products" className="btn btn-primary">{SELLER_TEXTS.ADD_PRODUCT}</a>
          <a href="/chats" className="btn btn-secondary">{SELLER_TEXTS.VIEW_MESSAGES}</a>
          <a href="/wood-types" className="btn btn-secondary">{SELLER_TEXTS.MANAGE_WOOD_TYPES}</a>
        </div>
      </div>

      {/* Recent Products */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="card-title">{SELLER_TEXTS.RECENT_PRODUCTS}</h2>
        </div>
        {productsLoading && <div className="loading">{SELLER_TEXTS.LOADING_PRODUCTS}</div>}
        {productsError && (
          <div className="error">
            <strong>{SELLER_TEXTS.OPERATION_FAILED}:</strong> {productsError}
          </div>
        )}
        {products?.data && products.data.length > 0 ? (
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th>{SELLER_TEXTS.PRODUCT_NAME}</th>
                  <th>{SELLER_TEXTS.WOOD_TYPE}</th>
                  <th>{SELLER_TEXTS.DIMENSIONS}</th>
                  <th>{SELLER_TEXTS.STATUS}</th>
                </tr>
              </thead>
              <tbody>
                {products.data.slice(0, 5).map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.wood_type}</td>
                    <td>{product.length}×{product.width}×{product.height} см</td>
                    <td>
                      <span className="status status-success">{SELLER_TEXTS.ACTIVE}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4">
              <a href="/products" className="btn btn-secondary">{SELLER_TEXTS.VIEW_ALL_PRODUCTS}</a>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>{SELLER_TEXTS.NO_PRODUCTS_FOUND}. <a href="/products" className="btn btn-primary">{SELLER_TEXTS.ADD_FIRST_PRODUCT}</a></p>
          </div>
        )}
      </div>

      {/* Getting Started */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">{SELLER_TEXTS.GETTING_STARTED}</h2>
        </div>
        <p className="mb-4">{SELLER_TEXTS.WELCOME_SELLER_DASHBOARD}</p>
        <ul>
          <li>{SELLER_TEXTS.MANAGE_INVENTORY}</li>
          <li>{SELLER_TEXTS.COMMUNICATE_BUYERS}</li>
          <li>{SELLER_TEXTS.SET_WOOD_TYPES_PRICING}</li>
          <li>{SELLER_TEXTS.UPDATE_SELLER_PROFILE}</li>
        </ul>
      </div>
    </div>
  );
});

export default Dashboard;
