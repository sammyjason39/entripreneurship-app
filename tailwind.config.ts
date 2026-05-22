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
          'on-bg': 'var(--color-text-on-bg)',
          'on-bg-muted': 'var(--color-text-on-bg-muted)',
          'on-surface': 'var(--color-text-on-surface)',
          'on-accent': 'var(--color-text-on-accent)',
          'link-on-bg': 'var(--color-link-on-bg)',
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
          '0%': { boxShadow: '0 0 0 var(--color-glow-green)' },
          '50%': { boxShadow: '0 0 24px var(--color-glow-green)' },
          '100%': { boxShadow: '0 0 8px var(--color-glow-green)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
