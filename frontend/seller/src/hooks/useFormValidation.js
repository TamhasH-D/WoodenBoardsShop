import { useState, useCallback } from 'react';

/**
 * Хук для управления валидацией форм с отслеживанием взаимодействия пользователя
 * Предотвращает показ ошибок валидации до того, как пользователь начал взаимодействовать с полем
 */
export const useFormValidation = () => {
  const [touchedFields, setTouchedFields] = useState(new Set());

  // Отмечает поле как "тронутое" пользователем
  const markFieldAsTouched = useCallback((fieldName) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  }, []);

  // Проверяет, было ли поле "тронуто" пользователем
  const isFieldTouched = useCallback((fieldName) => {
    return touchedFields.has(fieldName);
  }, [touchedFields]);

  // Возвращает CSS класс для поля с учетом состояния "тронуто"
  const getFieldClassName = useCallback((fieldName, baseClassName = 'form-input') => {
    const classes = [baseClassName];
    if (isFieldTouched(fieldName)) {
      classes.push('touched');
    }
    return classes.join(' ');
  }, [isFieldTouched]);

  // Обработчик для события blur (потеря фокуса)
  const handleFieldBlur = useCallback((fieldName) => {
    markFieldAsTouched(fieldName);
  }, [markFieldAsTouched]);

  // Обработчик для события change с автоматическим отслеживанием
  const handleFieldChange = useCallback((fieldName, onChange) => {
    return (e) => {
      markFieldAsTouched(fieldName);
      if (onChange) {
        onChange(e);
      }
    };
  }, [markFieldAsTouched]);

  // Сброс состояния всех полей
  const resetTouchedFields = useCallback(() => {
    setTouchedFields(new Set());
  }, []);

  return {
    markFieldAsTouched,
    isFieldTouched,
    getFieldClassName,
    handleFieldBlur,
    handleFieldChange,
    resetTouchedFields
  };
};
