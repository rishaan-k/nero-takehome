export function WaveBackground() {
  return (
    <div 
      className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ 
        zIndex: -1,
        backgroundColor: 'transparent' 
      }}
    >
      {/* Simple, guaranteed visible wave pattern */}
      <svg 
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 1 }}
      >
        {/* Horizontal sea-like waves only - much more visible for glassmorphism */}
        <path
          d="M0,200 Q480,100 960,200 T1920,200"
          stroke="var(--wave-primary)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,400 Q480,300 960,400 T1920,400"
          stroke="var(--wave-secondary)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0,600 Q480,500 960,600 T1920,600"
          stroke="var(--wave-tertiary)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M0,800 Q480,700 960,800 T1920,800"
          stroke="var(--wave-quaternary)"
          strokeWidth="1.5"
          fill="none"
        />
        
        {/* Additional wave layers for more texture */}
        <path
          d="M0,300 Q600,150 1200,300 T2400,300"
          stroke="var(--wave-light-1)"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M0,500 Q400,350 800,500 T1600,500"
          stroke="var(--wave-light-2)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
}