/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#e0e7ff',
        },
        dark: {
          DEFAULT: '#0b1220',
          card: '#131e2e',
          border: '#29364a',
          text: '#e6edf6',
          muted: '#9aa9be',
        },
        get: '#34d399',
        post: '#60a5fa',
        put: '#fbbf24',
        patch: '#a78bfa',
        delete: '#fb7185',
      },
    },
  },
  plugins: [],
}
