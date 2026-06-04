import { useEffect, useState } from 'react';

interface ProgressBarProps {
  startedAt: string | null;
  duration?: number; // in milliseconds, defaults to 30000
  className?: string;
}

export function ProgressBar({ startedAt, duration = 30000, className = '' }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!startedAt) {
      setProgress(0);
      return;
    }

    const startTime = new Date(startedAt).getTime();
    
    const updateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      setProgress(progressPercent);

      // Continue updating if not complete
      if (progressPercent < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    // Start the animation loop
    const animationFrame = requestAnimationFrame(updateProgress);
    
    // Cleanup function
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [startedAt, duration]);

  return (
    <div className={`w-full bg-bg-elevated rounded-full h-1 ${className}`}>
      <div 
        className="bg-accent-green h-full rounded-full transition-all duration-medium ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}