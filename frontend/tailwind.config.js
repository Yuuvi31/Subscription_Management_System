/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        card: '#FFFFFF',
        sidebar: '#FFFFFF',
        border: '#E8EAF0',
        primary: {
          DEFAULT: '#635BDB',
          hover: '#5046CA',
          light: '#EEEDFC',
          foreground: '#FFFFFF',
        },
        text: {
          primary: '#171A23',
          secondary: '#737987',
          muted: '#9DA3B4',
        },
        success: {
          DEFAULT: '#16845B',
          light: '#E7F7F0',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#D69228',
          light: '#FEF7EB',
          foreground: '#FFFFFF',
        },
        danger: {
          DEFAULT: '#D94C4C',
          light: '#FDECEC',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 1px 3px rgba(16, 24, 40, 0.06), 0 1px 2px rgba(16, 24, 40, 0.04)',
        dropdown: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
