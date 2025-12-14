import React from 'react';
import { useNotification } from '../../context/NotificationContext';

const Toast: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-primary-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-secondary-500 text-neutral-900';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${getStyles(notification.type)} animate-slide-in`}
        >
          <div className="flex-shrink-0">{getIcon(notification.type)}</div>
          <p className="flex-1 text-sm font-medium">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
