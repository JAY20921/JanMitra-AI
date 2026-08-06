import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* ── Government Blue Primary ── */
        "primary": "#1a3c8f",
        "on-primary": "#ffffff",
        "primary-container": "#dce1ff",
        "on-primary-container": "#001553",
        "primary-fixed": "#dce1ff",
        "primary-fixed-dim": "#b0c0ff",
        "on-primary-fixed": "#001553",
        "on-primary-fixed-variant": "#1a3c8f",
        
        /* ── Indian Green Secondary (Trust / Success) ── */
        "secondary": "#1B5E20",
        "on-secondary": "#ffffff",
        "secondary-container": "#c8e6c9",
        "on-secondary-container": "#0d3311",
        "secondary-fixed": "#c8e6c9",
        "secondary-fixed-dim": "#81c784",
        "on-secondary-fixed": "#0d3311",
        "on-secondary-fixed-variant": "#1B5E20",

        /* ── Saffron Tertiary (Accent / Highlight) ── */
        "tertiary": "#E65100",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#ffe0b2",
        "on-tertiary-container": "#3e1600",
        "tertiary-fixed": "#ffe0b2",
        "tertiary-fixed-dim": "#ffb74d",
        "on-tertiary-fixed": "#3e1600",
        "on-tertiary-fixed-variant": "#E65100",
        
        /* ── Surfaces (Refined blue-tinted neutrals) ── */
        "background": "#f8f9ff",
        "on-background": "#111827",
        "surface": "#f8f9ff",
        "on-surface": "#111827",
        "surface-dim": "#d5dbe8",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3fc",
        "surface-container": "#e8ecf8",
        "surface-container-high": "#dfe4f2",
        "surface-container-highest": "#d4daea",
        "surface-variant": "#e0e4f0",
        "on-surface-variant": "#44474e",
        "surface-tint": "#2c4faa",
        
        /* ── Outline ── */
        "outline": "#74777f",
        "outline-variant": "#c4c6d0",
        
        /* ── Inverse ── */
        "inverse-surface": "#1f2937",
        "inverse-on-surface": "#eef1fa",
        "inverse-primary": "#b0c0ff",
        
        /* ── Error ── */
        "error": "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#410002",
        
        /* ── Tricolor accents (for decorative use) ── */
        "saffron": "#FF6F00",
        "india-green": "#138808",
        "navy-blue": "#000080",
      },
      borderRadius: {
        "DEFAULT": "0.375rem",
        "lg": "0.625rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "full": "9999px"
      },
      spacing: {
        "xs": "8px",
        "sm": "16px",
        "base": "4px",
        "md": "24px",
        "gutter": "24px",
        "lg": "40px",
        "xl": "64px",
        "container-max": "1200px",
      },
      fontFamily: {
        "headline-xl": ["var(--font-manrope)"],
        "headline-lg": ["var(--font-manrope)"],
        "headline-md": ["var(--font-manrope)"],
        "body-lg": ["var(--font-inter)"],
        "body-md": ["var(--font-inter)"],
        "body-sm": ["var(--font-inter)"],
        "label-md": ["var(--font-inter)"],
        "label-sm": ["var(--font-inter)"],
      },
      fontSize: {
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "16px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      boxShadow: {
        "elevation-1": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
        "elevation-2": "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)",
        "elevation-3": "0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)",
        "elevation-4": "0 20px 25px rgba(0,0,0,0.08), 0 8px 10px rgba(0,0,0,0.04)",
        "glow-primary": "0 0 20px rgba(26,60,143,0.15)",
        "glow-saffron": "0 0 20px rgba(255,111,0,0.12)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "counter": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "shimmer": "shimmer 1.8s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "counter": "counter 0.4s ease-out forwards",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;
