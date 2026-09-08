/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Windows 11 Fluent UI Dark Palette
        w11: {
          bg:         '#181818',
          surface:    '#202020',
          card:       '#2a2a2a',
          border:     'rgba(255,255,255,0.08)',
          accent:     '#0078d4',
          'accent-hover': '#1a86dc',
          'accent-light': '#4da3e0',
          text:       '#e8e8e8',
          'text-muted': '#9d9d9d',
          'text-dim': '#6b6b6b',
          danger:     '#c42b1c',
          warning:    '#f7630c',
          success:    '#0f7b0f',
          amber:      '#f5c542',
        },
      },
      fontFamily: {
        'segoe': ['"Segoe UI Variable"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'w11': '8px',
        'w11-lg': '12px',
        'w11-xl': '16px',
      },
      boxShadow: {
        'w11': '0 4px 16px rgba(0,0,0,0.4)',
        'w11-modal': '0 8px 32px rgba(0,0,0,0.6)',
        'w11-glow': '0 0 0 1px rgba(0,120,212,0.4)',
      },
      backdropBlur: {
        'mica': '40px',
        'acrylic': '20px',
      },
      keyframes: {
        'slide-in-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-in-up':    { from: { transform: 'translateY(20px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        'fade-in':        { from: { opacity: 0 }, to: { opacity: 1 } },
        'pulse-dot':      { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
      animation: {
        'slide-in-right': 'slide-in-right 0.25s cubic-bezier(0.4,0,0.2,1)',
        'slide-in-up':    'slide-in-up 0.2s cubic-bezier(0.4,0,0.2,1)',
        'fade-in':        'fade-in 0.15s ease',
        'pulse-dot':      'pulse-dot 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
