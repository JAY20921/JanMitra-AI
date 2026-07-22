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
        "primary-container": "#1e3a8a",
        "outline-variant": "#c5c5d3",
        "secondary-container": "#6cf8bb",
        "on-tertiary-container": "#ff8f4f",
        "on-primary-fixed": "#00164e",
        "tertiary-fixed-dim": "#ffb690",
        "surface-tint": "#4059aa",
        "surface-container-high": "#dee9fc",
        "on-surface": "#121c2a",
        "on-error": "#ffffff",
        "tertiary-container": "#6e2d00",
        "on-primary": "#ffffff",
        "on-background": "#121c2a",
        "surface-container-low": "#eff4ff",
        "on-primary-container": "#90a8ff",
        "on-tertiary-fixed-variant": "#783200",
        "inverse-on-surface": "#eaf1ff",
        "on-secondary-fixed-variant": "#005236",
        "error-container": "#ffdad6",
        "surface-variant": "#d9e3f6",
        "surface": "#f8f9ff",
        "surface-container-highest": "#d9e3f6",
        "surface-bright": "#f8f9ff",
        "on-tertiary": "#ffffff",
        "secondary": "#006c49",
        "on-secondary": "#ffffff",
        "primary": "#00236f",
        "surface-dim": "#d0dbed",
        "on-secondary-fixed": "#002113",
        "background": "#f8f9ff",
        "primary-fixed-dim": "#b6c4ff",
        "on-tertiary-fixed": "#341100",
        "on-secondary-container": "#00714d",
        "on-surface-variant": "#444651",
        "secondary-fixed": "#6ffbbe",
        "inverse-primary": "#b6c4ff",
        "outline": "#757682",
        "tertiary": "#4b1c00",
        "error": "#ba1a1a",
        "surface-container": "#e6eeff",
        "inverse-surface": "#27313f",
        "primary-fixed": "#dce1ff",
        "tertiary-fixed": "#ffdbca",
        "on-error-container": "#93000a",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed-variant": "#264191",
        "secondary-fixed-dim": "#4edea3"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "sm": "16px",
        "base": "4px",
        "gutter": "24px",
        "lg": "40px",
        "container-max": "1120px",
        "xs": "8px",
        "xl": "64px",
        "md": "24px"
      },
      fontFamily: {
        "headline-md": ["var(--font-manrope)"],
        "body-lg": ["var(--font-inter)"],
        "body-sm": ["var(--font-inter)"],
        "headline-lg": ["var(--font-manrope)"],
        "label-sm": ["var(--font-inter)"],
        "headline-lg-mobile": ["var(--font-manrope)"],
        "headline-xl": ["var(--font-manrope)"],
        "label-md": ["var(--font-inter)"],
        "body-md": ["var(--font-inter)"]
      },
      fontSize: {
        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "label-sm": ["12px", { "lineHeight": "16px", "fontWeight": "500" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-xl": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "label-md": ["14px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
export default config;
