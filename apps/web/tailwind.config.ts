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
        marine: {
          DEFAULT: "#1877f2",
          deep: "#0333ff",
          teal: "#26a1b2",
        },
        feedback: {
          success: "hsl(var(--feedback-success))",
          "success-subtle": "hsl(var(--feedback-success-subtle))",
          warning: "hsl(var(--feedback-warning))",
          "warning-subtle": "hsl(var(--feedback-warning-subtle))",
          error: "hsl(var(--feedback-error))",
          "error-subtle": "hsl(var(--feedback-error-subtle))",
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
        wordmark: ["var(--font-krona)", "var(--font-manrope)", "sans-serif"],
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
      backgroundImage: {
        "brand-gradient": "linear-gradient(169deg, #807dfe 9%, #0333ff 88%)",
        "headline-gradient": "linear-gradient(175deg, #0333ff 65%, #26a1b2 84%)",
      },
      keyframes: {
        "waveform-pulse": {
          "0%, 100%": { transform: "scaleY(0.4)" },
          "50%": { transform: "scaleY(1)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "waveform-pulse": "waveform-pulse 1s ease-in-out infinite",
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
