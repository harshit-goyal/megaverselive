/** Tailwind config mirroring the former inline CDN config in public/index.html */
module.exports = {
  content: ['./public/**/*.html'],
  safelist: ['text-brand-600', 'text-slate-500', 'shadow-soft'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc',
          500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87',
        },
        accent: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981',
        },
        neon: { blue: '#3b82f6', cyan: '#06b6d4', pink: '#ec4899', orange: '#f97316' },
      },
      boxShadow: {
        soft: '0 10px 40px rgba(0,0,0,0.08)',
        glow: '0 0 50px rgba(168,85,247,0.25)',
        'glow-lg': '0 0 80px rgba(168,85,247,0.3)',
        neon: '0 0 20px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.1)',
        card: '0 4px 30px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out 1s infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(30px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        gradientShift: { '0%, 100%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' } },
        pulseGlow: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
        bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
    },
  },
  plugins: [],
};
