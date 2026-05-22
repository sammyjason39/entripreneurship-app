import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          active: 'var(--color-border-active)',
        },
        accent: {
          green: 'var(--color-accent-green)',
          blue: 'var(--color-accent-blue)',
          yellow: 'var(--color-accent-yellow)',
          red: 'var(--color-accent-red)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          accent: 'var(--color-text-accent)',
        },
        pixel: {
          green: 'var(--color-pixel-green)',
          blue: 'var(--color-pixel-blue)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'monospace'],
        body: ['var(--font-body)', 'Courier New', 'monospace'],
      },
      borderRadius: {
        card: '8px',
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'count-glow': 'countGlow 0.6s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        countGlow: {
          '0%': { boxShadow: '0 0 0 rgba(74, 222, 128, 0)' },
          '50%': { boxShadow: '0 0 24px rgba(74, 222, 128, 0.6)' },
          '100%': { boxShadow: '0 0 8px rgba(74, 222, 128, 0.3)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
