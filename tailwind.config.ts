import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Accent (kept the name "pitch" for code stability) — electric blue.
        pitch: {
          DEFAULT: "#2f80ff",
          dim: "#1f6feb",
          dark: "#0b1f3a",
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
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "ball-kick": {
          "0%, 100%": { transform: "translate(0,0)", opacity: "0.4" },
          "50%": { transform: "translate(34px,-26px)", opacity: "1" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.35s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "pulse-soft": "pulse-soft 1.4s ease-in-out infinite",
        shake: "shake 0.4s ease-in-out",
        marquee: "marquee var(--duration, 32s) linear infinite",
        "marquee-rev": "marquee var(--duration, 32s) linear infinite reverse",
        float: "float 3.5s ease-in-out infinite",
        "ball-kick": "ball-kick 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
