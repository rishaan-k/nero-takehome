interface EqualizerProps {
  isActive?: boolean;
  size?: 'sm' | 'md';
}

export function Equalizer({ isActive = true, size = 'md' }: EqualizerProps) {
  const barClass = size === 'sm' 
    ? 'equalizer-bar w-0.5 h-1 mx-px' 
    : 'equalizer-bar';
  
  return (
    <div className={`flex items-end ${isActive ? '' : 'opacity-50'}`}>
      <div className={barClass} style={{ animationPlayState: isActive ? 'running' : 'paused' }} />
      <div className={barClass} style={{ animationPlayState: isActive ? 'running' : 'paused' }} />
      <div className={barClass} style={{ animationPlayState: isActive ? 'running' : 'paused' }} />
      <div className={barClass} style={{ animationPlayState: isActive ? 'running' : 'paused' }} />
    </div>
  );
}