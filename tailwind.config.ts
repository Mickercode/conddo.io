import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The dark anchor — heroes, footers, headlines
        ink: "#111111",
        primary: {
          DEFAULT: "#7C5CBF",
          hover: "#6A4DAD",
          light: "#A07FD4",
          bg: "#F0ECFA",
          border: "#D4C8F0",
        },
        neutral: {
          bg: "#F8F8F6",
          surface: "#FFFFFF",
          surface2: "#F2F2F0",
          border: "#E5E5E3",
          strong: "#CECEC9",
        },
        content: {
          primary: "#111111",
          secondary: "#6B6B6B",
          muted: "#9B9B9B",
        },
        success: { DEFAULT: "#1A6B4A", bg: "#E8F4EF" },
        warning: { DEFAULT: "#C17F3A", bg: "#FAF3E8" },
        danger: { DEFAULT: "#C0392B", bg: "#FDEEEE" },
        info: { DEFAULT: "#2563EB", bg: "#EEF4FF" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "Geist Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "10px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        full: "9999px",
      },
      maxWidth: {
        container: "1280px",
      },
      letterSpacing: {
        tightest: "-0.02em",
        eyebrow: "0.1em",
      },
    },
  },
  plugins: [],
};

export default config;
