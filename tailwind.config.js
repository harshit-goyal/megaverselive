/** Tailwind config — warm editorial rebrand, tokens matched to harshitgoyal.com */
module.exports = {
  content: ['./public/**/*.html'],
  safelist: ['text-brand-600', 'text-stone-500', 'shadow-soft', 'font-script', 'font-display'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        script: ['"Dancing Script"', 'cursive'],
      },
      colors: {
        // Terracotta / rust — matched to harshitgoyal.com palette
        brand: {
          50: '#FCEFE9', 100: '#FCDED9', 200: '#E8C0B3', 300: '#D29B89', 400: '#C57C5C',
          500: '#BB5A3A', 600: '#A24E33', 700: '#7D3C27', 800: '#5C2C1D', 900: '#3E1E13',
        },
        // Muted sage — reserved for the "live" indicator only
        accent: {
          50: '#eaf5ee', 100: '#cbe7d5', 200: '#9fd0b1', 300: '#6fb488', 400: '#4E9A6B', 500: '#3E8159',
        },
        cream: '#FDF8F4',
        paper: '#FFFFFF',
        blush: '#FCDED9',
        ink: '#241612',
        espresso: '#3E1E13',
        muted: '#6B615B',
        neon: { blue: '#D29B89', cyan: '#D29B89', pink: '#BB5A3A', orange: '#C89B6A' },
      },
      boxShadow: {
        soft: '0 10px 40px rgba(62,30,19,0.08)',
        glow: '0 0 50px rgba(187,90,58,0.22)',
        'glow-lg': '0 0 80px rgba(187,90,58,0.26)',
        neon: '0 12px 34px rgba(187,90,58,0.26)',
        card: '0 4px 30px rgba(62,30,19,0.06)',
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
