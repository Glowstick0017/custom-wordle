/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      spacing: {
        'safe': 'env(safe-area-inset-bottom)',
        '18': '4.5rem',
        '20': '5rem',
        '24': '6rem',
      },
      width: {
        '18': '4.5rem',
        '20': '5rem',
        '24': '6rem',
      },
      height: {
        '18': '4.5rem',
        '20': '5rem',
        '24': '6rem',
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [],
} 