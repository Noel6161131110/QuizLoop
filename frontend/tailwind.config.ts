import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        rainbow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
      },
      animation: {
        rainbow: 'rainbow 4s linear infinite',
      },
      backgroundImage: {
        'rainbow-gradient':
          'linear-gradient(270deg, red, orange, yellow, green, blue, indigo, violet)',
      },
      backgroundSize: {
        rainbow: '300% 300%',
      },
    },
  },
  plugins: [],
};

export default config;