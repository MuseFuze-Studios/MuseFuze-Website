import React from 'react';
import { Zap } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Zap className="h-16 w-16 text-electric mx-auto animate-pulse" />
          <div className="absolute inset-0 h-16 w-16 border-4 border-electric/20 border-t-electric rounded-full animate-spin mx-auto"></div>
        </div>
        <p className="mt-4 text-gray-300 font-rajdhani text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;