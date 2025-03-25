/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#363C5A",  // Bleu principal
        "secondary-1": "#003A70",
        "secondary-2": "#005795",
        "secondary-3": "#256BA2",
        "secondary-4": "#758CC0",
        "secondary-5": "#5F9BC6",
        alert: "#E62244",  // Rouge d’alerte
        "alert-light": "#E5554F",
        "alert-dark": "#941914",
        neutral: {
          light: "#FFFFFF",
          dark: "#000000",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
