/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Instrument Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: '#07090D',
        surface: {
          1: '#0C1018',
          2: '#111820',
          3: '#16202C',
        },
        border: {
          DEFAULT: '#1C2A3A',
          2: '#243040',
        },
        accent: {
          green: '#00E5A0',
          green2: '#00B87A',
          blue: '#3B82F6',
          blue2: '#60A5FA',
          amber: '#F59E0B',
          red: '#EF4444',
          purple: '#A78BFA',
        },
        text: {
          DEFAULT: '#ECF0F5',
          soft: '#7A90A8',
          muted: '#3D5068',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease',
        'slide-up': 'slideUp 0.3s ease',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(4px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
