interface EqualizerProps {
  isActive?: boolean;
  size?: 'sm' | 'md';
}

export function Equalizer({ isActive = true, size = 'md' }: EqualizerProps) {
  const barClass = size === 'sm' 
    ? 'w-0.5 h-1 mx-px' 
    : 'w-[3px] h-1 mx-px';
  
  const animationClass = isActive ? 'equalizer-bar' : '';
  
  return (
    <div className={`flex items-end ${isActive ? '' : 'opacity-50'}`}>
      <div className={`${barClass} ${animationClass} bg-accent-green rounded-sm`} />
      <div className={`${barClass} ${animationClass} bg-accent-green rounded-sm`} style={{ animationDelay: '0.2s' }} />
      <div className={`${barClass} ${animationClass} bg-accent-green rounded-sm`} style={{ animationDelay: '0.4s' }} />
      <div className={`${barClass} ${animationClass} bg-accent-green rounded-sm`} style={{ animationDelay: '0.1s' }} />
    </div>
  );
}