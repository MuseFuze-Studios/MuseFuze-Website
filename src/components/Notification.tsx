import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseTime?: number;
}

const Notification: React.FC<NotificationProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  autoCloseTime = 5000,
}) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-500/30',
          icon: <CheckCircle className="h-5 w-5 text-green-400" />,
          text: 'text-green-400'
        };
      case 'error':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-500/30',
          icon: <AlertCircle className="h-5 w-5 text-red-400" />,
          text: 'text-red-400'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-500/30',
          icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
          text: 'text-yellow-400'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-900/30',
          border: 'border-blue-500/30',
          icon: <AlertCircle className="h-5 w-5 text-blue-400" />,
          text: 'text-blue-400'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md animate-fade-in-out ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 flex items-start`}>
      <div className="mr-3 mt-0.5">
        {styles.icon}
      </div>
      <div className="flex-1">
        <p className={`${styles.text} font-rajdhani`}>{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="ml-3 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Notification;