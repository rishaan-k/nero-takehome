import { useState } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface JoinPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (joinCode: string) => void;
  loading: boolean;
}

export function JoinPartyModal({ isOpen, onClose, onSubmit, loading }: JoinPartyModalProps) {
  const [joinCode, setJoinCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    onSubmit(joinCode.trim().toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Scrim */}
      <div 
        className="absolute inset-0"
        style={{ background: 'var(--modal-scrim)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative glass-panel w-full max-w-md mx-4 animate-in fade-in zoom-in-95 duration-200"
        style={{ 
          borderRadius: '16px',
          padding: '24px'
        }}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <IconButton
            icon={X}
            tooltip="close"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="px-4 pr-12">
          <h2 className="text-lg font-medium text-text-primary mb-6">Join a Party</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="join-code" className="block text-base text-text-primary mb-2">
                Join Code
              </label>
              <input
                id="join-code"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="ABC123"
                className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none uppercase tracking-wider"
                required
                autoFocus
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !joinCode.trim()}
              className="w-full px-6 py-3 text-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast mt-6"
              style={{
                borderRadius: '9999px',
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)'
              }}
            >
              {loading ? 'Joining...' : 'Join Party'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}