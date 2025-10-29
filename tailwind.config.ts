import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}","./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#030303",        // near-black for text
        primary: "#0586AD",    // teal-blue
        accent: "#02D6E4",     // bright cyan
        muted: "#96C8CD",      // soft teal (subtle UI)
        base:  "#FEFEFE",      // white
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 8px 30px rgba(3,3,3,0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
