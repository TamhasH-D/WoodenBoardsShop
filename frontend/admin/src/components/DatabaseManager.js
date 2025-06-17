import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { useToastContext } from '../hooks/useToast';
import { apiService } from '../services/api';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Database Manager Component
 * Handles database import and export functionality
 */
const DatabaseManager = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importStats, setImportStats] = useState(null);
  const { addToast } = useToastContext();

  // Export database
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get the JSON data using API service
      const data = await apiService.exportDatabase();

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Экспорт завершен',
        message: 'База данных успешно экспортирована'
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        type: 'error',
        title: 'Ошибка экспорта',
        message: error.userMessage || error.message || 'Произошла ошибка при экспорте базы данных'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'application/json') {
        addToast({
          type: 'error',
          title: 'Неверный формат файла',
          message: 'Пожалуйста, выберите JSON файл'
        });
        return;
      }
      setImportFile(file);
      setShowImportConfirm(true);
    }
  };

  // Import database
  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    setShowImportConfirm(false);

    try {
      const result = await apiService.importDatabase(importFile);

      setImportStats(result.statistics);
      addToast({
        type: 'success',
        title: 'Импорт завершен',
        message: 'База данных успешно импортирована'
      });
    } catch (error) {
      console.error('Import error:', error);
      addToast({
        type: 'error',
        title: 'Ошибка импорта',
        message: error.userMessage || error.message || 'Произошла ошибка при импорте базы данных'
      });
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <ArrowDownTrayIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Экспорт базы данных
            </h3>
            <p className="text-gray-600 mb-4">
              Создать резервную копию всей базы данных в формате JSON. 
              Включает все таблицы: пользователи, товары, чаты, изображения и другие данные.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <InformationCircleIcon className="h-4 w-4" />
              <span>Файл будет загружен в папку Downloads</span>
            </div>
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="primary"
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Экспортируем...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Экспортировать БД
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <ArrowUpTrayIcon className="h-8 w-8 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Импорт базы данных
            </h3>
            <p className="text-gray-600 mb-4">
              Восстановить базу данных из JSON файла. 
              Эта операция заменит все существующие данные.
            </p>
            
            {/* Warning */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800 mb-1">
                    Внимание! Опасная операция
                  </h4>
                  <p className="text-sm text-red-700">
                    Импорт удалит все существующие данные и заменит их данными из файла. 
                    Эта операция необратима. Убедитесь, что у вас есть резервная копия.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выберите JSON файл для импорта
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </div>
              
              {importFile && (
                <div className="text-sm text-gray-600">
                  Выбран файл: <span className="font-medium">{importFile.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Import Confirmation Modal */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4 p-6">
            <div className="flex items-start gap-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Подтвердите импорт
                </h3>
                <p className="text-gray-600 mb-4">
                  Вы уверены, что хотите импортировать данные из файла{' '}
                  <span className="font-medium">{importFile?.name}</span>?
                </p>
                <p className="text-sm text-red-600 mb-6">
                  Все существующие данные будут удалены и заменены данными из файла.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleImport}
                    disabled={isImporting}
                    variant="error"
                    className="flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Импортируем...
                      </>
                    ) : (
                      'Да, импортировать'
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowImportConfirm(false);
                      setImportFile(null);
                    }}
                    variant="secondary"
                    disabled={isImporting}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Import Statistics */}
      {importStats && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <CheckCircleIcon className="h-8 w-8 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Результаты импорта
              </h3>
              
              {/* Success stats */}
              {importStats.imported && Object.keys(importStats.imported).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Импортировано:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(importStats.imported).map(([key, count]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium text-green-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {importStats.errors && importStats.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 mb-2">
                    Ошибки ({importStats.errors.length}):
                  </h4>
                  <div className="max-h-32 overflow-y-auto text-xs text-red-600 bg-red-50 p-2 rounded">
                    {importStats.errors.map((error, index) => (
                      <div key={index} className="mb-1">{error}</div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => setImportStats(null)}
                variant="secondary"
                className="mt-4"
              >
                Закрыть
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DatabaseManager;
