export function EqualizerAnimation({ isPlaying = true, size = 'sm' }) {
  const sizeClasses = {
    xs: { container: 'w-3 h-3', bar: 'w-0.5' },
    sm: { container: 'w-4 h-4', bar: 'w-0.5' },
    md: { container: 'w-5 h-5', bar: 'w-1' },
    lg: { container: 'w-6 h-6', bar: 'w-1' }
  };

  const { container, bar } = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className={`flex items-end justify-center gap-0.5 ${container}`}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={`${bar} bg-nero-green transition-all duration-150`}
          style={{
            height: '20%',
            animation: isPlaying 
              ? `equalizer-bar-${i} 0.8s ease-in-out infinite alternate`
              : 'none'
          }}
        />
      ))}
    </div>
  );
}