/** @type {import('tailwindcss').Config} */
const { TWPalette } = require('./src/styles/themeColors');
module.exports = {
      content: [
            "./src/**/*.{html,ts}",
      ],
      theme: {
            extend: {
                  colors: TWPalette,
                  fontFamily: {
                        sans: ["Geist", "sans-serif"],
                        roboto: ["Geist", "Helvetica", "Arial", "sans-serif"],
                  },
                  fontSize: {
                        xxs: ['0.7rem', '0.8rem'],
                  },
                  animation: {
                        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                  }
            },
      },
      plugins: [],
}