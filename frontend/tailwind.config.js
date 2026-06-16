/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#111827',
        card: '#1F2937',
        primary: '#2563EB',
      },
      maxWidth: {
        mobile: '430px',
      },
    },
  },
  plugins: [],
};
