import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus first input when modal opens
      setTimeout(() => {
        const firstInput = document.querySelector('.modal-panel input');
        if (firstInput) firstInput.focus();
      }, 100);
    }
    
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      style={{ backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div 
        className="modal-panel w-full max-w-md relative"
        style={{
          background: 'rgba(28, 28, 28, 0.72)',
          backdropFilter: 'blur(32px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(32px) saturate(1.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          padding: '32px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium font-aileron text-nero-text">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-nero-muted hover:text-nero-text transition-colors duration-200 p-1"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
}