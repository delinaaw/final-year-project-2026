import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      xs: "400px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          muted: "hsl(var(--brand-muted))",
        },
        surface: {
          page: "hsl(var(--surface-page))",
          card: "hsl(var(--surface-card))",
          subtle: "hsl(var(--surface-subtle))",
        },
        content: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          placeholder: "hsl(var(--text-placeholder))",
          inverse: "hsl(var(--text-inverse))",
          link: "hsl(var(--text-link))",
        },
        line: {
          DEFAULT: "hsl(var(--border-default))",
          strong: "hsl(var(--border-strong))",
        },
        state: {
          success: "hsl(var(--state-success))",
          warning: "hsl(var(--state-warning))",
          danger: "hsl(var(--state-danger))",
          info: "hsl(var(--state-info))",
        },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-l": ["2.5rem", { lineHeight: "3rem", fontWeight: "700" }],
        "heading-xl": ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],
        "body-l": ["1.125rem", { lineHeight: "1.5rem" }],
        "body-m": ["1rem", { lineHeight: "1.25rem" }],
        "body-s": ["0.875rem", { lineHeight: "1.25rem" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 8px 12px 0 rgb(128 125 254 / 0.08)",
      },
      keyframes: {
        "waveform-pulse": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        "waveform-pulse": "waveform-pulse 1s ease-in-out infinite",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
