import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E87722",
          dark: "#D16A1E",
          light: "#F59042",
        },
        brown: {
          DEFAULT: "#5C3317",
          dark: "#3D210F",
          light: "#7A4A2A",
          800: "#3D1B00",
          700: "#4A2A14",
        },
        cream: {
          DEFAULT: "#FDF6ED",
          dark: "#F5E6D3",
          light: "#FFFBF7",
        },
        gold: "#FFB800",
        beige: "#FEF3E2",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
