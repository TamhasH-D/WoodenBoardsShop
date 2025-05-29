import React from 'react';
import { Ruler, CheckCircle, BarChart3 } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-indigo-100 p-3 rounded-full">
          <Ruler className="h-12 w-12 text-indigo-600" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-5 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800 leading-tight px-4 py-2 break-words">
        Wooden Boards Analyzer
      </h1>
      <div className="bg-white border border-indigo-100 rounded-xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
        <p className="text-xl text-gray-800 mb-8 leading-relaxed">
          Professional tool for wood industry specialists to accurately measure and analyze wooden boards through image processing
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <CheckCircle className="h-8 w-8 text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">Instant measurements</p>
          </div>
          <div className="flex flex-col items-center">
            <Ruler className="h-8 w-8 text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">High accuracy</p>
          </div>
          <div className="flex flex-col items-center">
            <BarChart3 className="h-8 w-8 text-indigo-600 mb-2" />
            <p className="text-sm font-medium text-gray-700">Volume calculation</p>
          </div>
        </div>
      </div>
    </div>
  );
};
