
import React, { useEffect } from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const Modal: React.FC<ModalProps> = ({ onClose, children, title }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-modal-backdrop flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-xl w-full max-w-xl mx-4 border border-border-color"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-lg font-semibold text-text-main">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-main">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
