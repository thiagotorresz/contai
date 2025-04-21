import React from 'react';
import { DollarSign } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="relative">
        <DollarSign className="w-16 h-16 text-green-500 animate-bounce" />
        <div className="absolute top-0 left-0 w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping" />
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-600">Carregando suas finanças...</p>
      <div className="mt-2 flex space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
};