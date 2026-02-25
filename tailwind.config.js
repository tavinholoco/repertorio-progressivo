/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3A0CA3',
          accent: '#6C2DC7',
          light: '#F7F6FB',
          yellow: '#FFF3B0',
          border: '#E0E0E0',
          muted: '#5C5C5C',
          dark: '#1E1E1E',
        },
        priority: {
          green: '#4ADE80',
          yellow: '#F5C518',
          red: '#E11D48',
        },
      },
    },
  },
  plugins: [],
};
