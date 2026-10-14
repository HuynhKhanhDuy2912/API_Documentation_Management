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
          DEFAULT: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          text: '#e2e8f0',
          muted: '#94a3b8',
        },
        get: '#22c55e',
        post: '#3b82f6',
        put: '#f59e0b',
        patch: '#a855f7',
        delete: '#ef4444',
      },
    },
  },
  plugins: [],
}
