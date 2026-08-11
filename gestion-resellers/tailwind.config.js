/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "#f4f6f4",
        surface: "#ffffff",
        ink: "#1a1d1a",
        muted: "#6b726b",
        line: "#dfe3df",
        green: {
          DEFAULT: "#11b43d",
          dark: "#0d9130",
        },
        amber: {
          DEFAULT: "#e8a713",
          dark: "#c88e0a",
        },
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "Segoe UI", "sans-serif"],
      },
      borderRadius: {
        none: "0",
        DEFAULT: "0",
      },
    },
  },
  plugins: [],
};
