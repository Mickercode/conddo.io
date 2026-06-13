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

        // Light-theme surfaces — used by the dashboard / authed routes.
        neutral: {
          bg: "#F8F8F6",
          surface: "#FFFFFF",
          surface2: "#F2F2F0",
          border: "#E5E5E3",
          strong: "#CECEC9",
        },

        // Cinema palette — codifies the dark cinematic marketing surface.
        // Use these names instead of raw #0a0a0c / #13131a / etc. so a
        // future palette tweak is a one-line change here.
        cinema: {
          base: "#0a0a0c",     // page background on every marketing route
          elev: "#13131a",     // elevated card / bento cell surface
          elev2: "#1a1a23",    // hover state for elevated surfaces
          line: "#252531",     // hairline divider on dark
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
        "2xl": "24px",
        "3xl": "28px",
        full: "9999px",
      },

      maxWidth: {
        container: "1280px",
      },

      letterSpacing: {
        tightest: "-0.03em",
        tighter:  "-0.02em",
        eyebrow:  "0.1em",
        caps:     "0.12em",
        loose:    "0.2em",
      },

      // Cinema gradient — the same violet→white→rose gradient used on
      // every cinematic headline accent. Exposed as a class so we can
      // write `bg-clip-text bg-cinema-aurora` instead of repeating the
      // raw stops everywhere.
      backgroundImage: {
        "cinema-aurora":
          "linear-gradient(to right, #A07FD4, rgba(255,255,255,0.95), #FDA4AF)",
        "cinema-glow":
          "radial-gradient(80% 60% at 50% 0%, rgba(124, 92, 191, 0.22), transparent 70%), radial-gradient(60% 80% at 100% 100%, rgba(124, 92, 191, 0.12), transparent 70%)",
      },

      // Cinematic shadows — the soft violet underglow used on bento
      // cards' hover state, and a stronger drop for floating cards.
      boxShadow: {
        cinema: "0 24px 60px -30px rgba(124, 92, 191, 0.35)",
        "cinema-strong": "0 30px 60px -30px rgba(124, 92, 191, 0.5)",
        "cinema-float": "0 8px 40px -12px rgba(0, 0, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
