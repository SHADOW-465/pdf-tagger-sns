/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        navy: {
          800: '#13233a',
          850: '#0f1c2e',
          900: '#0b1626',
          950: '#060d17',
        },
        editorial: {
          bg: '#fbfbf9',
          surface: '#ffffff',
          panel: '#f4f5f1',
          border: '#e4e6df',
          darkBorder: '#cbd0c4',
          accent: '#0f766e',
          accentLight: '#14b8a6',
          warning: '#d97706',
          danger: '#dc2626',
          success: '#16a34a',
        },
        tag: {
          h1: '#7c3aed',
          h2: '#2563eb',
          h3: '#0891b2',
          p: '#475569',
          figure: '#0d9488',
          table: '#d97706',
          list: '#ca8a04',
          footnote: '#e11d48',
          sidebar: '#4f46e5',
          artifact: '#64748b',
          link: '#0284c7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 12px 0 rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'float': '0 12px 30px -4px rgba(11, 22, 38, 0.12), 0 4px 12px -2px rgba(11, 22, 38, 0.08)',
        'modal': '0 25px 50px -12px rgba(6, 13, 23, 0.25)',
      },
    },
  },
  plugins: [],
}
