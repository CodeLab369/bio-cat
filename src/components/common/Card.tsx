import React, { type ReactNode } from 'react';

interface CardProps {
  title: string;
  icon: ReactNode;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, onClick, className = '' }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-neutral-800 
        rounded-xl shadow-card hover:shadow-card-hover 
        transition-all duration-300 
        ${onClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
    >
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300">
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {title}
          </h3>
        </div>
        {children && (
          <div className="text-neutral-600 dark:text-neutral-300">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;
