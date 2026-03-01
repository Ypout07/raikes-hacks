import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#ffffff",
          raised: "#fbfbfd",
          overlay: "#f5f5f7",
          hover: "#e8e8ed",
        },
        accent: {
          DEFAULT: "#0071e3",
          dim: "#0077ed",
          glow: "#147ce5",
        },
        muted: "#86868b",
        heading: "#1d1d1f",
        body: "#424245",
      },
    },
  },
  plugins: [],
};

export default config;
