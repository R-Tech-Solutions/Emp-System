/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#875A7B',
          light: '#F5EDF2',
          dark: '#6C4462',
        },
        secondary: '#CBA8C6',
        accent: '#D8BFD8',
        background: '#FFFFFF',
        surface: '#FAF8FA',
        border: '#D9C9D6',
        text: {
          primary: '#2D2D2D',
          secondary: '#5A5A5A',
          muted: '#9E7B93',
        },
      },
    },
  },
  plugins: [],
}
