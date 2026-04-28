import React from 'react';
import { User } from 'lucide-react';

interface GreyAvatarPlaceholderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24'
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12'
};

export const GreyAvatarPlaceholder: React.FC<GreyAvatarPlaceholderProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-700 flex items-center justify-center ${className}`}>
      <User className={`${iconSizes[size]} text-gray-400`} />
    </div>
  );
};

export default GreyAvatarPlaceholder;