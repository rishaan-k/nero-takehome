import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { IconButton } from './IconButton';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('nero:theme');
    const preferredTheme = savedTheme || 'dark';
    
    setIsDark(preferredTheme === 'dark');
    document.documentElement.setAttribute('data-theme', preferredTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('nero:theme', newTheme);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <IconButton
        icon={isDark ? Sun : Moon}
        tooltip={isDark ? 'light mode' : 'dark mode'}
        onClick={toggleTheme}
      />
    </div>
  );
}