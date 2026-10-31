/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        card: '#FFFFFF',
        sidebar: '#FFFFFF',
        border: '#E2E8F0',
        primary: {
          DEFAULT: '#4F46E5', // Refined enterprise indigo
          hover: '#4338CA',
          light: '#EEF2FF',
          foreground: '#FFFFFF',
        },
        text: {
          primary: '#0F172A', // Slate-900 high contrast
          secondary: '#475569', // Slate-600 readable body
          muted: '#94A3B8', // Slate-400 subtle label
        },
        success: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
          foreground: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        dropdown: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)',
      },
    },
  },
  plugins: [],
}
