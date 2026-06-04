/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background colors
        bg: 'var(--bg)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-nav': 'var(--bg-nav)',
        
        // Border colors
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        
        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        
        // Accent colors
        'accent-green': 'var(--accent-green)',
        'accent-green-bg': 'var(--accent-green-bg)',
        'accent-green-text': 'var(--accent-green-text)',
        'accent-red': 'var(--accent-red)',
        'accent-red-bg': 'var(--accent-red-bg)',
        'accent-red-text': 'var(--accent-red-text)',
        
        // Badge colors
        'skip-badge-bg': 'var(--skip-badge-bg)',
        'skip-badge-text': 'var(--skip-badge-text)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        serif: 'var(--font-serif)',
      },
      borderRadius: {
        pill: 'var(--radius-pill)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xs: 'var(--radius-xs)',
      },
      spacing: {
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        12: 'var(--space-12)',
      },
      maxWidth: {
        'content': 'var(--content-width)',
      },
      height: {
        nav: 'var(--nav-height)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        medium: 'var(--transition-medium)',
      },
      fontSize: {
        'xs': ['10px', { lineHeight: '1' }],      // Badge text
        'sm': ['12px', { lineHeight: '1.4' }],    // Artist/submitter, caption
        'base': ['13px', { lineHeight: '1.4' }],  // Nav links, body, labels
        'md': ['14px', { lineHeight: '1.4' }],    // Song title, button text
        'lg': ['16px', { lineHeight: '1.2' }],    // Session title, modal title
        'xl': ['18px', { lineHeight: '1.2' }],    // Logo wordmark
        '2xl': ['28px', { lineHeight: '1.2' }],   // Page H1
        '3xl': ['32px', { lineHeight: '1.2' }],   // Page H1 large
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
    },
  },
  plugins: [],
};
