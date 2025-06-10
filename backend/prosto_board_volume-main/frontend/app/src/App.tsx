import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Header } from './components/Header';
import { Instructions } from './components/Instructions';
import { ImageUpload } from './components/ImageUpload';
import { ResultDisplay } from './components/ResultDisplay';
import type { AnalysisResponse } from './types';
import { api } from './services/api';

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && !loading && resultRef.current) {
      const yOffset = -window.innerHeight * 0.35; // 35% of viewport height as offset
      const element = resultRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [result, loading]);

  const handleAnalyze = async (file: File, height: number, length: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);

      const response = await api.analyzeBoardImage(file, height, length);
      const data: AnalysisResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Header />
        <Instructions />
        
        <div className="space-y-8">
          <ImageUpload onAnalyze={handleAnalyze} />
          
          {loading && (
            <div className="text-center p-8 bg-white rounded-xl shadow-md">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-700 font-medium">Analyzing image...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {imageUrl && result && (
            <div ref={resultRef}>
              <ResultDisplay imageUrl={imageUrl} result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
