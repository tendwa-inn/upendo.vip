import React from 'react';
import { Button } from '@tremor/react';
import Portal from '../Portal';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon,
}) => {
  if (!isOpen) return null;

  const iconColors = {
    danger: 'bg-red-500/20 border-red-500/30 text-red-400',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  const buttonColors = {
    danger: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/25',
    warning: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 shadow-lg shadow-yellow-500/25',
    info: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25',
  };

  const defaultIcon = (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
        <div className="bg-gradient-to-br from-[#1a0f14] to-[#2E0C13] p-6 rounded-2xl shadow-2xl z-50 text-white max-w-md w-full mx-4 border border-pink-500/30 relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center relative z-10">
            {/* Warning Icon with Animation */}
            <div className={`mx-auto mb-4 w-16 h-16 ${iconColors[type].split(' ')[0]} rounded-full flex items-center justify-center animate-in slide-in-from-top duration-500 border-2 ${iconColors[type].split(' ')[1]}`}>
              {icon || defaultIcon}
            </div>

            <h3 className="text-xl font-bold text-white mb-2 animate-in slide-in-from-top duration-600">
              {title}
            </h3>

            <p className="text-gray-300 mb-6 animate-in slide-in-from-bottom duration-500">
              {message}
            </p>

            <div className="flex gap-3 justify-center animate-in slide-in-from-bottom duration-600">
              <Button
                variant="light"
                color="gray"
                onClick={onClose}
                className="hover:bg-white/10 transition-all duration-200 transform hover:scale-105 bg-gray-700/50 border border-gray-600/50 text-gray-300 hover:text-white"
              >
                {cancelText}
              </Button>
              <Button
                color={type === 'danger' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}
                onClick={onConfirm}
                className={`${buttonColors[type]} text-white border-none transition-all duration-200 transform hover:scale-105`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ConfirmationModal;