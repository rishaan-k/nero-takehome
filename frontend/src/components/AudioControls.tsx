import { Volume2, VolumeX } from 'lucide-react';
import { IconButton } from './IconButton';

interface AudioControlsProps {
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

export function AudioControls({ isMuted, volume, onToggleMute, onVolumeChange }: AudioControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <IconButton
        icon={isMuted ? VolumeX : Volume2}
        tooltip={isMuted ? 'unmute' : 'mute'}
        onClick={onToggleMute}
      />
      
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-16 h-1 bg-border rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
            [&::-webkit-slider-thumb]:bg-accent-green [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-accent-green 
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none"
        />
        <span className="text-xs text-text-tertiary w-8 text-right">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
}