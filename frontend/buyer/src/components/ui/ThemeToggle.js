import React from 'react';
import { useApp } from '../../contexts/AppContext';

/**
 * Переключатель темы
 */
const ThemeToggle = () => {
  const { theme, setTheme } = useApp();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Переключить тему"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggle;
