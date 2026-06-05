import { Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { IconButton } from './IconButton';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinCode: string;
}

export function ShareModal({ isOpen, onClose, joinCode }: ShareModalProps) {
  if (!isOpen) return null;

  const getShareableLink = () => {
    return `${window.location.origin}/party/${joinCode}`;
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(joinCode);
    toast.success('Join code copied!');
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(getShareableLink());
    toast.success('Link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Scrim */}
      <div 
        className="absolute inset-0 bg-[var(--modal-scrim)]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative glass-panel rounded-2xl p-6 w-full max-w-md mx-4">
        {/* Close Button */}
        <div className="absolute top-4 right-4">
          <IconButton
            icon={X}
            tooltip="close"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="pr-8">
          <h2 className="text-lg font-medium text-text-primary mb-4">Share this party</h2>
          
          <div className="space-y-4">
            {/* Join Code */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">Join Code</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-center">
                  <span className="text-lg font-medium text-text-primary tracking-wider">
                    {joinCode}
                  </span>
                </div>
                <IconButton
                  icon={Copy}
                  tooltip="copy code"
                  onClick={copyJoinCode}
                />
              </div>
            </div>

            {/* Shareable Link */}
            <div>
              <label className="block text-sm text-text-secondary mb-2">Shareable Link</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-bg-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary font-mono text-center">
                  {getShareableLink()}
                </div>
                <IconButton
                  icon={Copy}
                  tooltip="copy link"
                  onClick={copyShareableLink}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}