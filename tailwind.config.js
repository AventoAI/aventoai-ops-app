/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#020817",
        navyCard: "#080E1E",
        navyDark: "#0B192C",
        navyBorder: "#1E3E62",
        brandBlue: "#0077FF",
        brandCyan: "#00F0FF",
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0, 119, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 119, 255, 0.07) 1px, transparent 1px)",
      },
      animation: {
        'feather-fall': 'featherFall 25s linear infinite',
      },
      keyframes: {
        featherFall: {
          '0%': { transform: 'translate3d(0, -10vh, 0) rotate(-18deg)', opacity: '0' },
          '10%': { opacity: '0.45' },
          '30%': { transform: 'translate3d(26px, 25vh, 0) rotate(14deg)' },
          '55%': { transform: 'translate3d(-20px, 55vh, 0) rotate(-10deg)', opacity: '0.5' },
          '80%': { transform: 'translate3d(22px, 85vh, 0) rotate(16deg)' },
          '95%': { opacity: '0.15' },
          '100%': { transform: 'translate3d(-6px, 115vh, 0) rotate(-12deg)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
