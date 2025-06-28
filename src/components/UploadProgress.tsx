import React from 'react';
import { Upload, X } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  fileName: string;
  onCancel?: () => void;
  isComplete?: boolean;
  error?: string;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  fileName,
  onCancel,
  isComplete = false,
  error
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Upload className={`h-5 w-5 ${error ? 'text-red-400' : isComplete ? 'text-green-400' : 'text-electric'}`} />
          <div>
            <p className="text-white font-rajdhani font-medium truncate max-w-xs">{fileName}</p>
            {error && (
              <p className="text-red-400 font-rajdhani text-sm">{error}</p>
            )}
          </div>
        </div>
        {onCancel && !isComplete && !error && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="w-full bg-white/10 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            error 
              ? 'bg-red-500' 
              : isComplete 
                ? 'bg-green-500' 
                : 'bg-gradient-to-r from-electric to-neon'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-rajdhani text-gray-300">
          {error ? 'Failed' : isComplete ? 'Complete' : 'Uploading...'}
        </span>
        <span className="text-sm font-rajdhani text-gray-300">
          {progress}%
        </span>
      </div>
    </div>
  );
};

export default UploadProgress;