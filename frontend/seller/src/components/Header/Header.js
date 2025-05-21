import React from 'react';
import { motion } from 'framer-motion';

export function Header() {
  return (
    <header className="bg-brand-primary shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <a href="#" className="text-white font-heading text-2xl font-bold">WoodPallet Co.</a>
        <div>
          <a href="#products" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-sans">Продукция</a>
          <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-sans">О нас</a>
          <a href="#contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-sans">Контакты</a>
        </div>
      </nav>
    </header>
  );
}

export default Header;