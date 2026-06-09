/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'nero-bg': '#141414',
        'nero-surface': '#1c1c1c',
        'nero-elevated': '#222222',
        'nero-border': '#2e2e2e',
        'nero-text': '#f0f0f0',
        'nero-muted': '#888888',
        'nero-dim': '#555555',
        'nero-green': '#22c55e',
        'nero-green-bg': '#166534',
      },
      fontFamily: {
        aileron: ['Aileron', 'DM Sans', 'sans-serif'],
      },
      borderRadius: {
        pill: '9999px',
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
    },
  },
  plugins: [],
};
