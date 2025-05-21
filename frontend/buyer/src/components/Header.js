import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`bg-gray-900 text-gray-300 p-5 shadow-lg sticky top-0 z-50 border-b border-gray-700 transition-all duration-300 ${isScrolled ? 'py-3 shadow-xl' : 'py-5'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-3xl font-extrabold text-white hover:text-amber-400 transition duration-300">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            WoodCraft
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link to="/products" className="text-lg hover:text-amber-400 transition duration-300 relative group">
                Товары
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-lg hover:text-amber-400 transition duration-300 relative group">
                О нас
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-lg hover:text-amber-400 transition duration-300 relative group">
                Контакты
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400 transform scale-x-0 origin-left transition-transform group-hover:scale-x-100"></span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden focus:outline-none text-white" onClick={toggleMenu}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.3 }}
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            ></motion.path>
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20, height: 0 }}
        animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -20, height: isOpen ? 'auto' : 0 }}
        transition={{ duration: 0.3 }}
        className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-gray-800 mt-4 overflow-hidden`}
      >
        <ul className="flex flex-col items-center space-y-4 py-4">
          <li><Link to="/products" className="block text-center text-lg hover:text-amber-400 transition duration-300" onClick={toggleMenu}>Товары</Link></li>
          <li><Link to="/about" className="block text-center text-lg hover:text-amber-400 transition duration-300" onClick={toggleMenu}>О нас</Link></li>
          <li><Link to="/contact" className="block text-center text-lg hover:text-amber-400 transition duration-300" onClick={toggleMenu}>Контакты</Link></li>
        </ul>
      </motion.nav>
    </header>
  );
};

export default Header;