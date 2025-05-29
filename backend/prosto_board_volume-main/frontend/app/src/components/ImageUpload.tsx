import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onAnalyze: (file: File, height: number, length: number) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onAnalyze }) => {
  const [heightMm, setHeightMm] = useState<string>('50'); // 50mm default
  const [lengthMm, setLengthMm] = useState<string>('1000'); // 1000mm default
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleInputChange = (value: string, setter: (value: string) => void) => {
    // Allow empty string for better UX while typing
    if (value === '') {
      setter('');
      return;
    }

    // Replace comma with dot and remove any non-numeric characters except dot
    const sanitizedValue = value.replace(',', '.').replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    if (parts.length > 2) {
      return;
    }

    setter(sanitizedValue);
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    const height = parseFloat(heightMm);
    const length = parseFloat(lengthMm);

    if (isNaN(height) || height <= 0) {
      setError('Please enter a valid height');
      return;
    }

    if (isNaN(length) || length <= 0) {
      setError('Please enter a valid length');
      return;
    }

    // Convert mm to meters before sending
    onAnalyze(selectedFile, height / 1000, length / 1000);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Step 1: Enter Board Height (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={heightMm}
              onChange={(e) => handleInputChange(e.target.value, setHeightMm)}
              className="w-full rounded-lg border border-gray-300 shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-3 text-gray-700 placeholder-gray-400"
              placeholder="e.g., 50"
            />
            <div className="mt-2 bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500 shadow-sm">
              <p className="text-sm text-indigo-700">Enter the average height of the boards in millimeters. This helps calculate the volume accurately.</p>
            </div>
          </div>
          
          <div className="relative flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">Step 2: Enter Board Length (mm)</label>
            <input
              type="text"
              inputMode="decimal"
              value={lengthMm}
              onChange={(e) => handleInputChange(e.target.value, setLengthMm)}
              className="w-full rounded-lg border border-gray-300 shadow-md focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-3 text-gray-700 placeholder-gray-400"
              placeholder="e.g., 1000"
            />
            <div className="mt-2 bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500 shadow-sm">
              <p className="text-sm text-indigo-700">Enter the average length of the boards in millimeters. This ensures precise calculations.</p>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">Step 3: Upload Board Image</label>
          <div 
            className={`relative border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-300
            ${error ? 'border-red-500' : ''}
              ${selectedFile 
                ? 'border-indigo-500 bg-indigo-50/30' 
                : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/10'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50/10');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!selectedFile) {
                e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50/10');
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                handleFile(file);
              } else {
                setError('Please drop an image file');
              }
            }}
          >
            {preview ? (
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.02]"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-transform duration-200 hover:scale-110"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Upload className="mx-auto h-12 w-12 text-indigo-400" />
                <p className="mt-2 text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <div className="mt-2 bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500 shadow-sm">
            <p className="text-sm text-indigo-700">Upload a clear image of the boards. Ensure all edges are visible for accurate analysis.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border-l-4 border-red-500 shadow-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300
            ${selectedFile 
              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
              : 'bg-gray-400 cursor-not-allowed'}
          `}
          disabled={!selectedFile}
        >
          Start Analysis
        </button>
      </div>
    </div>
  );
};
