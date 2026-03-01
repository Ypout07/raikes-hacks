import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0a0a0a",
          raised: "#141414",
          overlay: "#1a1a1a",
          hover: "#222222",
        },
        accent: {
          DEFAULT: "#00d4aa",
          dim: "#00a885",
          glow: "#00f0c0",
        },
        muted: "#8a8a8a",
      },
    },
  },
  plugins: [],
};

export default config;
