/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "on-background": "#0b1c30",
        "on-surface-variant": "#45464d",
        "surface-container-highest": "#d3e4fe",
        "on-surface": "#0b1c30",
        "surface-container-lowest": "#ffffff",
        "secondary-fixed-dim": "#7bd0ff",
        "on-secondary": "#ffffff",
        "outline-variant": "#c6c6cd",
        "inverse-on-surface": "#eaf1ff",
        "on-secondary-fixed": "#001e2c",
        "surface-container-high": "#dce9ff",
        "primary-fixed": "#dae2fd",
        "on-tertiary-container": "#818486",
        "on-tertiary": "#ffffff",
        "on-secondary-fixed-variant": "#004c69",
        "surface-container": "#e5eeff",
        "on-primary-container": "#7c839b",
        "primary-container": "#131b2e",
        "tertiary-fixed": "#e0e3e5",
        "inverse-primary": "#bec6e0",
        "secondary-container": "#40c2fd",
        "on-error": "#ffffff",
        "surface-tint": "#565e74",
        "on-secondary-container": "#004d6a",
        "on-tertiary-fixed": "#191c1e",
        "on-error-container": "#93000a",
        "surface-container-low": "#eff4ff",
        "on-tertiary-fixed-variant": "#444749",
        "surface": "#f8f9ff",
        "secondary": "#00668a",
        "tertiary-fixed-dim": "#c4c7c9",
        "background": "#f8f9ff",
        "on-primary": "#ffffff",
        "error": "#ba1a1a",
        "outline": "#76777d",
        "tertiary": "#000000",
        "primary": "#000000",
        "surface-variant": "#d3e4fe",
        "on-primary-fixed": "#131b2e",
        "secondary-fixed": "#c4e7ff",
        "on-primary-fixed-variant": "#3f465c",
        "surface-dim": "#cbdbf5",
        "tertiary-container": "#191c1e",
        "primary-fixed-dim": "#bec6e0",
        "surface-bright": "#f8f9ff",
        "inverse-surface": "#213145",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "stack-sm": "8px",
        "stack-md": "16px",
        "margin-mobile": "16px",
        "container-max": "1440px",
        "margin-desktop": "40px",
        "gutter": "24px",
        "stack-lg": "32px",
        "unit": "4px"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        headline: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        'level-1': '0px 4px 20px rgba(11, 28, 48, 0.05)',
        'level-2': '0px 10px 30px rgba(11, 28, 48, 0.08)'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
