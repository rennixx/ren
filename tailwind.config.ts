import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#060610",
        panel: "rgba(0,229,255,0.02)",
        accent: {
          DEFAULT: "#00e5ff",
          dim: "rgba(0,229,255,0.15)",
          glow: "rgba(0,229,255,0.3)",
        },
        "text-primary": "#e8e8e8",
        "text-secondary": "#a0b0c0",
        "text-tertiary": "#90a8b8",
      },
      fontFamily: {
        mono: ['"Courier New"', "Consolas", "Monaco", "monospace"],
      },
      animation: {
        "spin-slow": "rotate 30s linear infinite",
        "spin-slow-reverse": "rotate 20s linear infinite reverse",
        pulse: "pulse 2s ease-in-out infinite",
      },
      keyframes: {
        rotate: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
