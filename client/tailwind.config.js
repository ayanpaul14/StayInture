/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./context/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: "#E9EFEE",
          100: "#C9DAD6",
          400: "#4C8577",
          600: "#3A6659",
          800: "#234036",
          900: "#16221F",
        },
        coral: {
          50: "#EAF0F3",
          100: "#C7D9E0",
          400: "#5E85A0",
          600: "#3F6478",
        },
        gold: {
          100: "#F6EAC9",
          400: "#E8C77E",
          600: "#C9A550",
        },
        canvas: "#F4F7F6",
        ink: "#1E2E2E",
        muted: "#5B6B68",
      },
      fontFamily: {
        head: ["Georgia", "Cambria", "serif"],
        body: ["system-ui", "Helvetica", "Arial", "sans-serif"],
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.5s ease both",
      },
    },
  },
  plugins: [],
};