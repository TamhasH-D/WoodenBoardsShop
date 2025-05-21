import React, { useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { motion } from 'framer-motion';
import SellerLayout from './components/SellerLayout';
import SellerDashboard from './components/SellerDashboard';
import SellerProducts from './components/SellerProducts';
import SellerOrders from './components/SellerOrders';
import SellerSettings from './components/SellerSettings'; // Import SellerSettings

// Dynamic background with particles

import { particleOptions } from './config/particlesConfig';

import Header from './components/Header/Header';

import HeroSection from './components/HeroSection/HeroSection';

import ProductSection from './components/ProductSection/ProductSection';

import Footer from './components/Footer/Footer';

import HomePageLayout from './components/HomePageLayout/HomePageLayout';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<SellerLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<SellerProducts />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="settings" element={<SellerSettings />} /> {/* Add settings route */}
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;