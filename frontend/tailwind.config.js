/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      // ---------------------
      // 1) Tes couleurs
      // ---------------------
      colors: {
        // == Palette existante ==
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

        // == Ajouts pour le swirl ==
        // On les appelle swirl-primary & swirl-secondary (pour éviter de casser tes couleurs)
        "swirl-primary": {
          50: '#FFF1F3',
          100: '#FFE4E8',
          200: '#FFB8C3',
          300: '#FF8C9E',
          400: '#FF607A',
          500: '#FF294D',
          600: '#FF1A3D',
          700: '#E6002D',
          800: '#CC0028',
          900: '#B30023',
        },
        "swirl-secondary": {
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#0087FF',
          600: '#0077E6',
          700: '#005795',
          800: '#004A7A',
          900: '#003D66',
        },
      },

      // Tu peux conserver tes familles de police
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },

      // ---------------------
      // 2) Le gradient conique
      // ---------------------
      backgroundImage: {
        'gradient-conic-tr': 'conic-gradient(at top right, var(--tw-gradient-stops))',
      },

      // ---------------------
      // 3) (Optionnel) Animations
      // ---------------------
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-left': 'slideLeft 0.5s ease-out',
        'slide-right': 'slideRight 0.5s ease-out',
        'bounce-soft': 'bounceSoft 1s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': {
            transform: 'translateY(-5%)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
          },
          '50%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.7' },
        },
      },
    },
  },
  plugins: [],
};
