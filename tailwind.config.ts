import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxW: 'none',
            color: '#cbd5e1', // slate-300
            h1: { color: '#f1f5f9' }, // slate-100
            h2: { color: '#f1f5f9' },
            h3: { color: '#10b981' }, // emerald-400 para seções do feedback
            strong: { color: '#ffffff' },
            code: { color: '#10b981' },
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
