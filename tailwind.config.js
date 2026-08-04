/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette noir et blanc de Services Valu.
        brand: {
          50: "#f7f7f7",
          100: "#e5e5e5",
          200: "#d4d4d4",
          500: "#171717",
          600: "#000000",
          700: "#000000",
        },
      },
      fontFamily: {
        // Switzer pour le texte courant (remplace la pile système par défaut).
        sans: [
          "Switzer",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        // Gamborino pour les titres — appliqué via la classe font-title.
        title: ["Gamborino", "Switzer", "serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
