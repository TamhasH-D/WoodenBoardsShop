import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside search and user menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close search when clicking outside
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }

      // Close user menu when clicking outside
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search for:', searchQuery);
    // Implement search functionality
    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    setIsSearchFocused(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className={`sticky top-0 z-50 w-full bg-white shadow-md transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-wood-dark">WoodCraft</span>
          </Link>

          {/* Search Bar - Hidden on mobile, visible on medium screens and up */}
          <div className="hidden md:block flex-grow max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative" ref={searchRef}>
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                className={`w-full py-2 px-4 pr-10 rounded-lg border ${
                  isSearchFocused ? 'border-wood-accent' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-wood-accent transition-all duration-300`}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-wood-accent transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Search suggestions */}
              {isSearchFocused && searchQuery.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  <ul className="py-2">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Сосна</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Дуб</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Берёза</li>
                  </ul>
                </div>
              )}
            </form>
          </div>

          {/* Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/products" className="text-wood-text hover:text-wood-accent transition duration-300">
              Товары
            </Link>
            <Link to="/wood-types" className="text-wood-text hover:text-wood-accent transition duration-300">
              Типы древесины
            </Link>
            <Link to="/calculator" className="text-wood-text hover:text-wood-accent transition duration-300">
              Калькулятор
            </Link>

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-wood-text hover:text-wood-accent transition duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-wood-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated() ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 text-wood-text hover:text-wood-accent transition duration-300"
                >
                  <span>{currentUser?.name || 'Пользователь'}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-wood-text hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Личный кабинет
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-wood-text hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Мои заказы
                    </Link>
                    <Link
                      to="/favorites"
                      className="block px-4 py-2 text-wood-text hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Избранное
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-wood-text hover:bg-gray-100"
                    >
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-wood-accent text-white rounded-lg hover:bg-wood-accent-light transition duration-300">
                Войти
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            {/* Search button on mobile */}
            <button
              className="p-2 mr-2 text-wood-text hover:text-wood-accent"
              onClick={() => setIsSearchFocused(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <button
              onClick={toggleMobileMenu}
              className="p-2 text-wood-text hover:text-wood-accent focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Search - Visible when search is focused */}
        {isSearchFocused && (
          <div className="md:hidden mt-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full py-2 px-4 pr-10 rounded-lg border border-wood-accent focus:outline-none focus:ring-2 focus:ring-wood-accent transition-all duration-300"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-wood-accent transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/products"
                className="text-wood-text hover:text-wood-accent transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Товары
              </Link>
              <Link
                to="/wood-types"
                className="text-wood-text hover:text-wood-accent transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Типы древесины
              </Link>
              <Link
                to="/calculator"
                className="text-wood-text hover:text-wood-accent transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Калькулятор
              </Link>

              <Link
                to="/cart"
                className="text-wood-text hover:text-wood-accent transition duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Корзина {cartCount > 0 && `(${cartCount})`}
              </Link>

              {isAuthenticated() ? (
                <>
                  <Link
                    to="/profile"
                    className="text-wood-text hover:text-wood-accent transition duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Личный кабинет
                  </Link>
                  <Link
                    to="/orders"
                    className="text-wood-text hover:text-wood-accent transition duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Мои заказы
                  </Link>
                  <Link
                    to="/favorites"
                    className="text-wood-text hover:text-wood-accent transition duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Избранное
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-wood-text hover:text-wood-accent transition duration-300 text-left"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 bg-wood-accent text-white rounded-lg hover:bg-wood-accent-light transition duration-300 inline-block w-max"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Войти
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
