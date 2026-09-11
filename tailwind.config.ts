import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1200px' },
    },
    extend: {
      colors: {
        bg: '#0D100F',
        surface: '#151A17',
        raised: '#1C231F',
        ink: '#F6F3EB',
        muted: '#ADB7B0',
        accent: {
          DEFAULT: '#C7FF4A',
          pressed: '#A8DC32',
        },
        success: '#70E1A3',
        warning: '#F4C45E',
        danger: '#FF776D',
        line: '#29322D',
        /* shadcn tokens mapped onto the GLoW palette */
        border: '#29322D',
        input: '#29322D',
        ring: '#C7FF4A',
        background: '#0D100F',
        foreground: '#F6F3EB',
        primary: { DEFAULT: '#C7FF4A', foreground: '#0D100F' },
        secondary: { DEFAULT: '#1C231F', foreground: '#F6F3EB' },
        destructive: { DEFAULT: '#FF776D', foreground: '#0D100F' },
        popover: { DEFAULT: '#151A17', foreground: '#F6F3EB' },
        card: { DEFAULT: '#151A17', foreground: '#F6F3EB' },
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        num: ['var(--font-manrope)', 'var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '18px',
        md: '14px',
        sm: '10px',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(199,255,74,0.35), 0 0 28px -6px rgba(199,255,74,0.45)',
        'glow-soft': '0 0 22px -8px rgba(199,255,74,0.4)',
        card: '0 1px 0 0 rgba(255,255,255,0.02), 0 10px 30px -18px rgba(0,0,0,0.9)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 1px rgba(199,255,74,0.30), 0 0 20px -8px rgba(199,255,74,0.35)' },
          '50%': { boxShadow: '0 0 0 1px rgba(199,255,74,0.55), 0 0 34px -4px rgba(199,255,74,0.60)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
