import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: "#00e676",
          dim: "#00c853",
          dark: "#0a3d1f",
        },
        ink: {
          DEFAULT: "#0a0e0d",
          card: "#13181a",
          line: "#1f2627",
          soft: "#262e30",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      maxWidth: {
        app: "480px",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-6px)" },
          "75%": { transform: "translateX(6px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "shimmer-slide": {
          to: { transform: "translateX(calc(100% + 100px))" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.35s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "pulse-soft": "pulse-soft 1.4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        marquee: "marquee var(--duration, 32s) linear infinite",
        "marquee-rev": "marquee var(--duration, 32s) linear infinite reverse",
      },
    },
  },
  plugins: [],
};

export default config;
