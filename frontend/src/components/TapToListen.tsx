import { Volume2 } from 'lucide-react';

interface TapToListenProps {
  onTap: () => void;
}

export function TapToListen({ onTap }: TapToListenProps) {
  return (
    <div className="glass-panel rounded-lg p-6 text-center">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-accent-green-bg rounded-full flex items-center justify-center mb-3">
          <Volume2 className="w-8 h-8 text-accent-green" />
        </div>
        <h3 className="text-lg font-medium text-text-primary mb-2">Ready to Listen?</h3>
        <p className="text-sm text-text-secondary mb-4">
          Tap below to enable synchronized audio playback
        </p>
      </div>
      
      <button
        onClick={onTap}
        className="bg-accent-green text-white px-6 py-3 rounded-pill text-md font-medium hover:bg-green-600 transition-colors duration-fast flex items-center gap-2 mx-auto"
      >
        <Volume2 className="w-4 h-4" />
        Tap to Listen
      </button>
    </div>
  );
}