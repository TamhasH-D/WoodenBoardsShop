import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
      className="bg-gray-900 text-gray-400 py-10 mt-12 shadow-inner border-t border-gray-700"
    >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Company Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
          className="flex flex-col items-center md:items-start"
        >
          <Link to="/" className="text-2xl font-extrabold text-white hover:text-amber-400 transition duration-300 mb-4">WoodCraft</Link>
          <p className="text-center md:text-left">Высококачественные деревянные изделия для вашего дома и бизнеса.</p>
          <p className="mt-2 text-sm">&copy; 2023 WoodCraft. Все права защищены.</p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.8 }}
          className="flex flex-col items-center md:items-start"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Быстрые ссылки</h3>
          <ul className="space-y-2">
            <li><Link to="/products" className="hover:text-amber-400 transition duration-300">Товары</Link></li>
            <li><Link to="/about" className="hover:text-amber-400 transition duration-300">О нас</Link></li>
            <li><Link to="/contact" className="hover:text-amber-400 transition duration-300">Контакты</Link></li>
            {/* Add more links as needed */}
          </ul>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 1 }}
          className="flex flex-col items-center md:items-start"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Контакты</h3>
          <p>Email: info@woodcraft.com</p>
          <p>Телефон: +1 234 567 890</p>
          <p>Адрес: 123 Wood St, Craft City, 54321</p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;