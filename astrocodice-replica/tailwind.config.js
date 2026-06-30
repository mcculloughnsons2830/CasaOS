// © 2026 MsFitZ Society. All rights reserved. Proprietary — see LICENSE.
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // MsFitZ Society brand palette — fire & ice on black
        ink: {
          DEFAULT: '#07080c', // near-black base
          800: '#0b0e16',
          700: '#11151f',
          600: '#171c28',
        },
        ice: {
          DEFAULT: '#6fb1d6', // steel/ice blue (logo lettering)
          light: '#a9d5ee',
          soft: '#cfe7f5',
          dark: '#3f7ea3',
          deep: '#1f4a63',
        },
        ember: {
          DEFAULT: '#ff8a2b', // glowing amber (bear eyes / nebula)
          light: '#ffb066',
          hot: '#ff6a18',
          dark: '#e8590c',
        },
        bone: '#eef2f6', // cream-white text
        muted: '#8a99a8',
        line: 'rgba(170,213,238,0.12)',
      },
      fontFamily: {
        display: ['Oswald', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Crimson Pro"', 'Georgia', 'serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(255,138,43,0.45)',
        'glow-ice': '0 0 40px -8px rgba(111,177,214,0.45)',
        panel: '0 24px 60px -20px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(120deg, #a9d5ee 0%, #6fb1d6 35%, #ff8a2b 100%)',
        'ember-grad': 'linear-gradient(120deg, #ffb066 0%, #ff8a2b 50%, #e8590c 100%)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(38px)' },
          '50%': { opacity: '1', filter: 'blur(46px)' },
        },
        riseIn: {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        pulseGlow: 'pulseGlow 6s ease-in-out infinite',
        riseIn: 'riseIn 0.7s ease-out both',
      },
    },
  },
  plugins: [],
}
