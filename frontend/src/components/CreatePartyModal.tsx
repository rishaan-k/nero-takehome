import { useState } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

interface CreatePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    hostName: string;
    maxSongs?: number;
    maxDuration?: number;
  }) => void;
  loading: boolean;
}

export function CreatePartyModal({ isOpen, onClose, onSubmit, loading }: CreatePartyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    hostName: '',
    maxSongs: '',
    maxDuration: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.hostName.trim()) return;

    const data = {
      name: formData.name.trim(),
      hostName: formData.hostName.trim(),
      ...(formData.maxSongs && { maxSongs: parseInt(formData.maxSongs, 10) }),
      ...(formData.maxDuration && { maxDuration: parseInt(formData.maxDuration, 10) }),
    };

    onSubmit(data);
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
          <h2 className="text-lg font-medium text-text-primary mb-6">Create a Party</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="party-name" className="block text-base text-text-primary mb-2">
                Party Name
              </label>
              <input
                id="party-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Friday Night Vibes"
                className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="host-name" className="block text-base text-text-primary mb-2">
                Your Name
              </label>
              <input
                id="host-name"
                type="text"
                value={formData.hostName}
                onChange={(e) => setFormData(prev => ({ ...prev, hostName: e.target.value }))}
                placeholder="Alex"
                className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="max-songs" className="block text-base text-text-primary mb-2">
                  Max Songs (optional)
                </label>
                <input
                  id="max-songs"
                  type="number"
                  min="1"
                  value={formData.maxSongs}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxSongs: e.target.value }))}
                  placeholder="20"
                  className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="max-duration" className="block text-base text-text-primary mb-2">
                  Max Duration (min)
                </label>
                <input
                  id="max-duration"
                  type="number"
                  min="1"
                  value={formData.maxDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxDuration: e.target.value }))}
                  placeholder="60"
                  className="w-full bg-bg border border-border rounded-sm px-3 py-3 text-base text-text-primary placeholder:text-text-tertiary focus:border-accent-green focus:outline-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.name.trim() || !formData.hostName.trim()}
              className="w-full px-6 py-3 text-md font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast mt-6"
              style={{
                borderRadius: '9999px',
                backgroundColor: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)'
              }}
            >
              {loading ? 'Creating...' : 'Create Party'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}