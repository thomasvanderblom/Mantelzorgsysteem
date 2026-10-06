import type { Config } from "tailwindcss";

/**
 * Designsysteem Mantelzorg Navigator
 * - Warme, rustige neutrale tinten (gebroken wit / zand)
 * - Zachte salie-groene hoofdkleur, zachte blauwtint als steun
 * - Eén warme accentkleur (terracotta) voor acties die aandacht verdienen
 * Alle tekstkleuren op de achtergronden halen minimaal WCAG AA (4.5:1).
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBF8F3",
        sand: { 50: "#F6F1E9", 100: "#EEE6D9", 200: "#E0D5C3" },
        ink: { DEFAULT: "#2B2A27", soft: "#5A564E" },
        sage: { 50: "#EEF4EF", 100: "#DCE9DF", 300: "#9DBFA6", 600: "#3F6B4F", 700: "#2F5640", 800: "#244533" },
        mist: { 50: "#EDF3F7", 100: "#D9E6EE", 600: "#3B6A86" },
        accent: { 50: "#FBEEE7", 100: "#F5D9CB", 600: "#B4532A", 700: "#97431F" },
      },
      fontFamily: {
        sans: ["Nunito Sans", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      borderRadius: { xl2: "1.25rem" },
      boxShadow: { soft: "0 2px 14px rgba(60, 50, 30, 0.08)" },
    },
  },
  plugins: [],
};
export default config;
