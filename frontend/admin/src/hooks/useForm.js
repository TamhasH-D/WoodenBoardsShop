import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm as useReactHookForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useUIStore } from '../stores/uiStore';
import { useApiMutation } from './useApi';

/**
 * Enterprise-grade form hook with validation and auto-save
 */
export function useForm(options = {}) {
  const {
    schema,
    defaultValues = {},
    mode = 'onChange',
    reValidateMode = 'onChange',
    shouldFocusError = true,
    delayError = 0,
    criteriaMode = 'firstError',
    shouldUseNativeValidation = false,
    shouldUnregister = false,
    formId,
    autoSave = false,
    autoSaveDelay = 2000,
    onSubmit,
    onError,
    onAutoSave,
    persistState = false,
    ...formOptions
  } = options;

  const { setFormState, getFormState } = useUIStore();
  const autoSaveTimeoutRef = useRef();

  // Get persisted state
  const persistedState = persistState && formId ? getFormState(formId) : {};

  // Initialize form with react-hook-form
  const form = useReactHookForm({
    defaultValues: persistedState.values || defaultValues,
    mode,
    reValidateMode,
    shouldFocusError,
    delayError,
    criteriaMode,
    shouldUseNativeValidation,
    shouldUnregister,
    resolver: schema ? yupResolver(schema) : undefined,
    ...formOptions,
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid, touchedFields, dirtyFields },
    watch,
    reset,
    setValue,
    getValues,
    trigger,
    clearErrors,
    setError,
  } = form;

  // Form state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Watch all form values for auto-save
  const watchedValues = watch();

  // Persist form state
  useEffect(() => {
    if (persistState && formId) {
      setFormState(formId, {
        values: watchedValues,
        isDirty,
        hasUnsavedChanges,
        lastSaved,
      });
    }
  }, [persistState, formId, watchedValues, isDirty, hasUnsavedChanges, lastSaved, setFormState]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !isDirty || !isValid) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (onAutoSave) {
        setIsAutoSaving(true);
        try {
          await onAutoSave(getValues());
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave, isDirty, isValid, autoSaveDelay, onAutoSave, getValues]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(isDirty && !isAutoSaving);
  }, [isDirty, isAutoSaving]);

  // Enhanced submit handler
  const handleFormSubmit = useCallback(
    (data) => {
      return handleSubmit(async (formData) => {
        try {
          const result = await onSubmit?.(formData);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
          return result;
        } catch (error) {
          onError?.(error);
          throw error;
        }
      })(data);
    },
    [handleSubmit, onSubmit, onError]
  );

  // Field helpers
  const getFieldError = useCallback((fieldName) => {
    const error = errors[fieldName];
    return error?.message || null;
  }, [errors]);

  const hasFieldError = useCallback((fieldName) => {
    return !!errors[fieldName];
  }, [errors]);

  const isFieldTouched = useCallback((fieldName) => {
    return !!touchedFields[fieldName];
  }, [touchedFields]);

  const isFieldDirty = useCallback((fieldName) => {
    return !!dirtyFields[fieldName];
  }, [dirtyFields]);

  // Validation helpers
  const validateField = useCallback(async (fieldName) => {
    return await trigger(fieldName);
  }, [trigger]);

  const validateForm = useCallback(async () => {
    return await trigger();
  }, [trigger]);

  // Value helpers
  const getFieldValue = useCallback((fieldName) => {
    return getValues(fieldName);
  }, [getValues]);

  const setFieldValue = useCallback((fieldName, value, options = {}) => {
    setValue(fieldName, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
      ...options,
    });
  }, [setValue]);

  const setMultipleValues = useCallback((values, options = {}) => {
    Object.entries(values).forEach(([fieldName, value]) => {
      setValue(fieldName, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
        ...options,
      });
    });
  }, [setValue]);

  // Error helpers
  const setFieldError = useCallback((fieldName, error) => {
    setError(fieldName, {
      type: 'manual',
      message: error,
    });
  }, [setError]);

  const setMultipleErrors = useCallback((errors) => {
    Object.entries(errors).forEach(([fieldName, error]) => {
      setError(fieldName, {
        type: 'manual',
        message: error,
      });
    });
  }, [setError]);

  const clearFieldError = useCallback((fieldName) => {
    clearErrors(fieldName);
  }, [clearErrors]);

  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);

  // Reset helpers
  const resetForm = useCallback((values = defaultValues, options = {}) => {
    reset(values, options);
    setHasUnsavedChanges(false);
    setLastSaved(null);
  }, [reset, defaultValues]);

  const resetField = useCallback((fieldName, value) => {
    setValue(fieldName, value, {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [setValue]);

  // Utility functions
  const getFormData = useCallback(() => {
    return getValues();
  }, [getValues]);

  const getChangedFields = useCallback(() => {
    const values = getValues();
    const changed = {};
    
    Object.keys(dirtyFields).forEach((fieldName) => {
      changed[fieldName] = values[fieldName];
    });
    
    return changed;
  }, [getValues, dirtyFields]);

  const hasErrors = Object.keys(errors).length > 0;
  const errorCount = Object.keys(errors).length;
  const touchedCount = Object.keys(touchedFields).length;
  const dirtyCount = Object.keys(dirtyFields).length;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // React Hook Form instance
    form,

    // Form state
    errors,
    isSubmitting,
    isDirty,
    isValid,
    touchedFields,
    dirtyFields,
    hasErrors,
    errorCount,
    touchedCount,
    dirtyCount,

    // Auto-save state
    isAutoSaving,
    lastSaved,
    hasUnsavedChanges,

    // Handlers
    handleSubmit: handleFormSubmit,
    reset: resetForm,

    // Field helpers
    getFieldError,
    hasFieldError,
    isFieldTouched,
    isFieldDirty,
    getFieldValue,
    setFieldValue,
    setMultipleValues,
    resetField,

    // Validation helpers
    validateField,
    validateForm,

    // Error helpers
    setFieldError,
    setMultipleErrors,
    clearFieldError,
    clearAllErrors,

    // Utility functions
    getFormData,
    getChangedFields,
    watch,
    setValue,
    getValues,
    trigger,
    clearErrors,
    setError,
  };
}

/**
 * Hook for form with API integration
 */
export function useApiForm(endpoint, options = {}) {
  const {
    method = 'POST',
    successMessage = 'Form submitted successfully',
    errorMessage = 'Form submission failed',
    onSuccess,
    onError,
    invalidateQueries = [],
    ...formOptions
  } = options;

  const mutation = useApiMutation(endpoint, {
    method,
    successMessage,
    errorMessage,
    invalidateQueries,
    onSuccess,
    onError,
  });

  const form = useForm({
    ...formOptions,
    onSubmit: async (data) => {
      return await mutation.mutateAsync(data);
    },
    onError: (error) => {
      // Handle validation errors from API
      if (error.status === 422 && error.data?.errors) {
        form.setMultipleErrors(error.data.errors);
      }
      onError?.(error);
    },
  });

  return {
    ...form,
    mutation,
    isSubmitting: form.isSubmitting || mutation.isPending,
  };
}
