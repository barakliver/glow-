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
         *
         * Warmer and quieter than before. The greens in the neutrals are what
         * keep a near-black room from reading as a dashboard: everything is a
         * few degrees toward olive, so the white text lands warm rather than
         * clinical, and the blue has something to be cold against.
         */
        bg: '#0D0F0E',
        surface: '#151816',
        raised: '#1D211E',
        ink: '#F6F4EE',
        /*
         * Secondary text carries most of this interface - every caption, every
         * label, every line under a title - so it is lifted again, to around
         * 7:1. Grey-on-grey is the single fastest way to make a clean design
         * look cheap, and it is always the muted token that does it.
         */
        muted: '#ABAE9F',
        accent: {
          /*
           * The club's own warm gold, taken from the logo.
           *
           * Royal blue was the one thing on screen with nothing to do with the
           * mark - a cold accent under a warm slate line drawing reads as two
           * brands sharing a page. Gold on near-black lands around 11:1, so it
           * carries text and fills alike, and a fill takes dark ink rather
           * than white.
           */
          DEFAULT: '#D9C68C',
          pressed: '#C0A85F',
          /* A shade up, for long runs of accent-coloured text. */
          ink: '#E7D9AC',
        },
        /* Reserved for moments worth marking: a record, a streak, a milestone. */
        champagne: '#D9C68C',
        success: '#70E1A3',
        /* Red, not amber. It sits lighter than `danger` so the two stay
           apart, and every place that uses either also carries its own icon. */
        warning: '#F0433A',
        danger: '#FF776D',
        /*
         * A hairline, and a faint one. Cards are separated by light and by the
         * space around them; the border is only there to stop two surfaces
         * touching.
         */
        line: '#242822',
        /* shadcn tokens mapped onto the GLoW palette */
        border: '#242822',
        input: '#242822',
        ring: '#E7D9AC',
        background: '#0D0F0E',
        foreground: '#F6F4EE',
        primary: { DEFAULT: '#D9C68C', foreground: '#0D0F0E' },
        secondary: { DEFAULT: '#1D211E', foreground: '#F6F4EE' },
        destructive: { DEFAULT: '#FF776D', foreground: '#0D0F0E' },
        popover: { DEFAULT: '#151816', foreground: '#F6F4EE' },
        card: { DEFAULT: '#151816', foreground: '#F6F4EE' },
      },
      fontFamily: {
        sans: ['var(--font-heebo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-frank)', 'Georgia', 'serif'],
        num: ['var(--font-manrope)', 'var(--font-heebo)', 'system-ui', 'sans-serif'],
      },
      /*
       * Bigger, softer corners. A 16px card next to a 12px button reads as two
       * different systems; the whole scale moves up together and the smallest
       * step is large enough that nothing looks boxy.
       */
      borderRadius: {
        '2xl': '28px',
        xl: '22px',
        lg: '18px',
        md: '14px',
        sm: '10px',
      },
      spacing: {
        /* The gap between stacked actions, used everywhere so it stays one number. */
        gutter: '1.25rem',
      },
      /*
       * More room to breathe between lines of Hebrew. The default 1.5 is tight
       * for a script with no ascender/descender rhythm to rest on, and loose
       * text is most of what separates a considered page from a busy one.
       */
      lineHeight: {
        relaxed: '1.75',
      },
      boxShadow: {
        /*
         * The old glow ringed anything important in luminous lime, which is
         * what made the app read as a game. Depth now comes from a lifted
         * surface and a soft drop, and the accent is left to the one control
         * that actually wants the eye.
         */
        glow: '0 0 0 1px rgba(217,198,140,0.32)',
        'glow-soft': '0 8px 24px -14px rgba(0,0,0,0.9)',
        card: '0 1px 0 0 rgba(255,255,255,0.028), 0 18px 44px -28px rgba(0,0,0,0.9)',
        /* For the one element that should feel like it is floating. */
        lift: '0 1px 0 0 rgba(255,255,255,0.04), 0 28px 60px -32px rgba(0,0,0,0.95)',
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
          '0%,100%': { boxShadow: '0 0 0 1px rgba(217,198,140,0.30), 0 0 20px -8px rgba(217,198,140,0.35)' },
          '50%': { boxShadow: '0 0 0 1px rgba(217,198,140,0.55), 0 0 34px -4px rgba(217,198,140,0.60)' },
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
