import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BUYER_TEXTS } from '../../utils/localization';

/**
 * Премиум поисковая строка с автодополнением
 * Glassmorphism дизайн с анимациями
 */
const SearchBar = ({ onFocus, onBlur, className = '' }) => {
  const { searchQuery, setSearchQuery } = useApp();
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Обработка фокуса
  const handleFocus = () => {
    setFocused(true);
    onFocus?.();
  };

  // Обработка потери фокуса
  const handleBlur = (e) => {
    // Проверяем, не кликнули ли на предложение
    if (suggestionsRef.current && suggestionsRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    setFocused(false);
    setShowSuggestions(false);
    onBlur?.();
  };

  // Обработка изменения текста
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Показываем предложения если есть текст
    if (value.trim()) {
      // Здесь можно добавить логику получения предложений с сервера
      const mockSuggestions = [
        'Сосна обрезная',
        'Дуб массив',
        'Береза фанера',
        'Лиственница брус'
      ].filter(item => 
        item.toLowerCase().includes(value.toLowerCase())
      );
      
      setSuggestions(mockSuggestions);
      setShowSuggestions(mockSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  // Обработка выбора предложения
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // Обработка нажатия Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      inputRef.current?.blur();
      // Здесь можно добавить логику поиска
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Закрытие предложений при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-bar ${focused ? 'focused' : ''} ${className}`}>
      {/* Основной контейнер поиска */}
      <div className="search-container">
        {/* Иконка поиска */}
        <div className="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Поле ввода */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={BUYER_TEXTS.SEARCH_PLACEHOLDER}
          className="search-input"
          autoComplete="off"
        />

        {/* Кнопка очистки */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setShowSuggestions(false);
              inputRef.current?.focus();
            }}
            className="search-clear"
            aria-label="Очистить поиск"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Кнопка поиска */}
        <button
          type="submit"
          className="search-submit"
          aria-label="Найти"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Предложения поиска */}
      {showSuggestions && (
        <div ref={suggestionsRef} className="search-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              <div className="suggestion-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21L16.514 16.506M19 10.5C19 15.194 15.194 19 10.5 19S2 15.194 2 10.5 5.806 2 10.5 2 19 5.806 19 10.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="suggestion-text">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
