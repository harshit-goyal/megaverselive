/** Tailwind config — warm editorial rebrand (matches harshitgoyal.com) */
module.exports = {
  content: ['./public/**/*.html'],
  safelist: ['text-brand-600', 'text-slate-500', 'shadow-soft', 'font-script', 'font-display'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      colors: {
        // Terracotta / rust primary
        brand: {
          50: '#FBF0EA', 100: '#F6DACE', 200: '#EBB59F', 300: '#DD9270', 400: '#CF7350',
          500: '#C15B3F', 600: '#A8492F', 700: '#883A26', 800: '#6A2E20', 900: '#4C2117',
        },
        // Muted sage — reserved for the "live" indicator only
        accent: {
          50: '#eaf5ee', 100: '#cbe7d5', 200: '#9fd0b1', 300: '#6fb488', 400: '#4E9A6B', 500: '#3E8159',
        },
        cream: '#FBF8F3',
        paper: '#FFFFFF',
        blush: '#F8EBE6',
        ink: '#241C18',
        espresso: '#2A211D',
        muted: '#6B625C',
        neon: { blue: '#DD9270', cyan: '#CF7350', pink: '#C15B3F', orange: '#C89B6A' },
      },
      boxShadow: {
        soft: '0 10px 40px rgba(36,28,24,0.08)',
        glow: '0 0 50px rgba(193,91,63,0.22)',
        'glow-lg': '0 0 80px rgba(193,91,63,0.26)',
        neon: '0 12px 34px rgba(193,91,63,0.28)',
        card: '0 4px 30px rgba(36,28,24,0.06)',
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
