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
        /*
         * A warm near-black room with one cold, deliberate accent. Royal blue
         * against the warm greys is what makes it read as considered rather
         * than as a default dark theme - and the accent only ever appears on
         * an action or on something live.
         */
        bg: '#0F100D',
        surface: '#171916',
        raised: '#212420',
        ink: '#F6F3EB',
        muted: '#A6A79B',
        accent: {
          /* True royal blue for fills. */
          DEFAULT: '#4169E1',
          pressed: '#3355C6',
          /*
           * Royal blue is too dark to use as text on a near-black surface -
           * it lands at 3.7:1, under the 4.5:1 a body-sized label needs. This
           * lighter tint is the same blue for reading, at 7:1.
           */
          ink: '#7CA0FF',
        },
        /* Reserved for moments worth marking: a record, a streak, a milestone. */
        champagne: '#D9C68C',
        success: '#70E1A3',
        /* Red, not amber. It sits lighter than `danger` so the two stay
           apart, and every place that uses either also carries its own icon. */
        warning: '#F0433A',
        danger: '#FF776D',
        line: '#2A2C26',
        /* shadcn tokens mapped onto the GLoW palette */
        border: '#2A2C26',
        input: '#2A2C26',
        ring: '#7CA0FF',
        background: '#0F100D',
        foreground: '#F6F3EB',
        primary: { DEFAULT: '#4169E1', foreground: '#FFFFFF' },
        secondary: { DEFAULT: '#212420', foreground: '#F6F3EB' },
        destructive: { DEFAULT: '#FF776D', foreground: '#0F100D' },
        popover: { DEFAULT: '#171916', foreground: '#F6F3EB' },
        card: { DEFAULT: '#171916', foreground: '#F6F3EB' },
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-frank)', 'Georgia', 'serif'],
        num: ['var(--font-manrope)', 'var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '16px',
        md: '12px',
        sm: '8px',
      },
      boxShadow: {
        /*
         * The old glow ringed anything important in luminous lime, which is
         * what made the app read as a game. Depth now comes from a lifted
         * surface and a soft drop, and the accent is left to the one control
         * that actually wants the eye.
         */
        glow: '0 0 0 1px rgba(124,160,255,0.32)',
        'glow-soft': '0 8px 24px -14px rgba(0,0,0,0.9)',
        card: '0 1px 0 0 rgba(255,255,255,0.025), 0 12px 32px -20px rgba(0,0,0,0.95)',
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
          '0%,100%': { boxShadow: '0 0 0 1px rgba(124,160,255,0.30), 0 0 20px -8px rgba(124,160,255,0.35)' },
          '50%': { boxShadow: '0 0 0 1px rgba(124,160,255,0.55), 0 0 34px -4px rgba(124,160,255,0.60)' },
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
