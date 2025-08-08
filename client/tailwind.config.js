/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Orbitron', 'JetBrains Mono', 'Exo 2', 'sans-serif'],
        'body': ['JetBrains Mono', 'Poppins', 'Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace']
      },
      colors: {
        // Retro engineering palette
        'paper': '#F7F5EF',
        'bg-main': '#F7F5EF',
        'charcoal': '#1F2225',
        'neon-green': '#00ff41',
        'primary-green': '#00ff41',
        'deep-green-700': '#0B2F24',
        'deep-green-800': '#07251C',
        'primary-orange': '#FF8C1A',
        'accent-orange': '#FF7A00',
        'accent-green': '#14C38E',
        'text-subtle': '#6E7074',
        'warning': '#F2C94C',
        'success': '#00ff41',
        'error': '#FF4D4D',
        'yellow-bright': '#FFD60A'
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      boxShadow: {
        'card': '0 8px 0 rgba(31,34,37,0.2), 0 24px 32px rgba(0,0,0,0.15)',
        'card-hover': '0 10px 0 rgba(31,34,37,0.25), 0 28px 40px rgba(0,0,0,0.2)',
        'glow-green': '0 0 24px rgba(0, 255, 65, 0.35)',
        'glow-orange': '0 0 24px rgba(255, 140, 26, 0.4)',
        'bezel': 'inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -2px 0 rgba(0,0,0,0.15)'
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        'xlr': '1.25rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'timer-tick': 'timerTick 1s ease-in-out infinite',
        'led-blink': 'ledBlink 1.2s infinite',
        'scanline': 'scanline 6s linear infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 18px rgba(0,255,65,0.35)' },
          '50%': { boxShadow: '0 0 28px rgba(0,255,65,0.55)' },
        },
        timerTick: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        ledBlink: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 1 }
        },
        scanline: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 100%' }
        }
      },
    },
  },
  plugins: [],
}
