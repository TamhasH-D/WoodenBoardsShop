import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { generateUUID, isValidUUID } from '../../utils/uuid';
import { ADMIN_TEXTS } from '../../utils/localization';

/**
 * Интерактивное поле для UUID с возможностью ручного ввода
 * По умолчанию отображается как текст "ID: будет сгенерирован автоматически"
 * При клике превращается в input для ручного ввода UUID
 */
const UUIDField = ({ 
  value, 
  onChange, 
  label = ADMIN_TEXTS.ID,
  placeholder = ADMIN_TEXTS.UUID_FIELD_PLACEHOLDER,
  required = false,
  disabled = false,
  className = '',
  style = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [validationError, setValidationError] = useState('');

  // Синхронизируем внутреннее состояние с внешним значением
  useEffect(() => {
    setInputValue(value || '');
    setValidationError('');
  }, [value]);

  // Валидация UUID
  const validateUUID = (uuid) => {
    if (!uuid.trim()) {
      return ''; // Пустое значение допустимо - будет автогенерация
    }
    if (!isValidUUID(uuid)) {
      return ADMIN_TEXTS.UUID_INVALID_FORMAT;
    }
    return '';
  };

  // Обработка начала редактирования
  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setInputValue(value || '');
    setValidationError('');
  };

  // Обработка отмены редактирования
  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(value || '');
    setValidationError('');
  };

  // Обработка подтверждения редактирования
  const handleConfirm = () => {
    const error = validateUUID(inputValue);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsEditing(false);
    setValidationError('');
    onChange(inputValue.trim());
  };

  // Обработка изменения значения в input
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Валидация в реальном времени
    const error = validateUUID(newValue);
    setValidationError(error);
  };

  // Генерация нового UUID
  const handleGenerateNew = () => {
    const newUUID = generateUUID();
    setInputValue(newUUID);
    setValidationError('');
    onChange(newUUID);
    setIsEditing(false);
  };

  // Обработка нажатия Enter/Escape
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !validationError) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`uuid-field ${className}`} style={style}>
      {/* Label */}
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}

      {/* Поле UUID */}
      <div className="uuid-field-container">
        {!isEditing ? (
          // Режим просмотра - кликабельный текст
          <div 
            className={`uuid-display ${disabled ? 'disabled' : 'clickable'}`}
            onClick={handleStartEdit}
            title={disabled ? '' : ADMIN_TEXTS.UUID_CLICK_TO_EDIT}
          >
            <span className="uuid-label">{ADMIN_TEXTS.ID}:</span>
            <span className="uuid-value">
              {value ? (
                <code className="uuid-code">{value}</code>
              ) : (
                <em className="uuid-auto">{ADMIN_TEXTS.UUID_AUTO_GENERATE}</em>
              )}
            </span>
            {!disabled && (
              <span className="uuid-edit-hint">✏️</span>
            )}
          </div>
        ) : (
          // Режим редактирования - input с кнопками
          <div className="uuid-edit-container">
            <div className="uuid-input-group">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className={`form-input uuid-input ${validationError ? 'error' : ''}`}
                autoFocus
              />
              <div className="uuid-buttons">
                <button
                  type="button"
                  onClick={handleGenerateNew}
                  className="btn btn-secondary uuid-btn"
                  title={ADMIN_TEXTS.UUID_GENERATE_NEW}
                >
                  🎲
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="btn btn-primary uuid-btn"
                  disabled={!!validationError}
                  title={ADMIN_TEXTS.UUID_CONFIRM_EDIT}
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary uuid-btn"
                  title={ADMIN_TEXTS.UUID_CANCEL_EDIT}
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Ошибка валидации */}
            {validationError && (
              <div className="uuid-error">
                {validationError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

UUIDField.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

export default UUIDField;
