import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  tooltip: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function IconButton({ 
  icon: Icon, 
  tooltip, 
  onClick, 
  className = '', 
  disabled = false 
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative p-2 transition-colors duration-[0.2s] ease-out disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <Icon className="w-5 h-5 text-text-secondary group-hover:text-accent-green transition-colors duration-[0.2s] ease-out" strokeWidth={1.5} />
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-[0.2s] ease-out pointer-events-none">
        <div className="bg-bg-elevated text-text-primary px-2 py-1 rounded-md whitespace-nowrap" style={{
          fontSize: '11px',
          fontFamily: 'var(--font-sans)',
          borderRadius: '6px'
        }}>
          {tooltip}
        </div>
      </div>
    </button>
  );
}