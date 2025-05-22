import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout
import AdminLayout from './components/layout/AdminLayout';

// Pages
import AdminDashboard from './components/pages/Dashboard';
import LoginPage from './components/pages/Login';

// User Management
import BuyersList from './components/pages/buyers/BuyersList';
import BuyerDetails from './components/pages/buyers/BuyerDetails';
import BuyerForm from './components/pages/buyers/BuyerForm';

import SellersList from './components/pages/sellers/SellersList';
import SellerDetails from './components/pages/sellers/SellerDetails';
import SellerForm from './components/pages/sellers/SellerForm';

// Product Management
import ProductsList from './components/pages/products/ProductsList';
import ProductDetails from './components/pages/products/ProductDetails';
import ProductForm from './components/pages/products/ProductForm';

// Wood Types Management
import WoodTypesList from './components/pages/woodTypes/WoodTypesList';
import WoodTypeDetails from './components/pages/woodTypes/WoodTypeDetails';
import WoodTypeForm from './components/pages/woodTypes/WoodTypeForm';

// Wood Type Prices Management
import WoodTypePricesList from './components/pages/woodTypePrices/WoodTypePricesList';
import WoodTypePriceDetails from './components/pages/woodTypePrices/WoodTypePriceDetails';
import WoodTypePriceForm from './components/pages/woodTypePrices/WoodTypePriceForm';

// Wooden Boards Management
import WoodenBoardsList from './components/pages/woodenBoards/WoodenBoardsList';
import WoodenBoardDetails from './components/pages/woodenBoards/WoodenBoardDetails';
import WoodenBoardForm from './components/pages/woodenBoards/WoodenBoardForm';

// Images Management
import ImagesList from './components/pages/images/ImagesList';
import ImageDetails from './components/pages/images/ImageDetails';
import ImageForm from './components/pages/images/ImageForm';

// Chat Management
import ChatThreadsList from './components/pages/chat/ChatThreadsList';
import ChatThreadDetails from './components/pages/chat/ChatThreadDetails';
import ChatMessagesList from './components/pages/chat/ChatMessagesList';

// Settings
import AdminSettings from './components/pages/settings/Settings';
import SystemHealth from './components/pages/settings/SystemHealth';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Buyers Routes */}
            <Route path="buyers">
              <Route index element={<BuyersList />} />
              <Route path=":id" element={<BuyerDetails />} />
              <Route path="new" element={<BuyerForm />} />
              <Route path="edit/:id" element={<BuyerForm />} />
            </Route>

            {/* Sellers Routes */}
            <Route path="sellers">
              <Route index element={<SellersList />} />
              <Route path=":id" element={<SellerDetails />} />
              <Route path="new" element={<SellerForm />} />
              <Route path="edit/:id" element={<SellerForm />} />
            </Route>

            {/* Products Routes */}
            <Route path="products">
              <Route index element={<ProductsList />} />
              <Route path=":id" element={<ProductDetails />} />
              <Route path="new" element={<ProductForm />} />
              <Route path="edit/:id" element={<ProductForm />} />
            </Route>

            {/* Wood Types Routes */}
            <Route path="wood-types">
              <Route index element={<WoodTypesList />} />
              <Route path=":id" element={<WoodTypeDetails />} />
              <Route path="new" element={<WoodTypeForm />} />
              <Route path="edit/:id" element={<WoodTypeForm />} />
            </Route>

            {/* Wood Type Prices Routes */}
            <Route path="wood-type-prices">
              <Route index element={<WoodTypePricesList />} />
              <Route path=":id" element={<WoodTypePriceDetails />} />
              <Route path="new" element={<WoodTypePriceForm />} />
              <Route path="edit/:id" element={<WoodTypePriceForm />} />
            </Route>

            {/* Wooden Boards Routes */}
            <Route path="wooden-boards">
              <Route index element={<WoodenBoardsList />} />
              <Route path=":id" element={<WoodenBoardDetails />} />
              <Route path="new" element={<WoodenBoardForm />} />
              <Route path="edit/:id" element={<WoodenBoardForm />} />
            </Route>

            {/* Images Routes */}
            <Route path="images">
              <Route index element={<ImagesList />} />
              <Route path=":id" element={<ImageDetails />} />
              <Route path="new" element={<ImageForm />} />
              <Route path="edit/:id" element={<ImageForm />} />
            </Route>

            {/* Chat Routes */}
            <Route path="chat">
              <Route index element={<ChatThreadsList />} />
              <Route path="threads/:id" element={<ChatThreadDetails />} />
              <Route path="messages" element={<ChatMessagesList />} />
            </Route>

            {/* Settings Routes */}
            <Route path="settings" element={<AdminSettings />} />
            <Route path="system-health" element={<SystemHealth />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </QueryClientProvider>
  );
}

export default App;