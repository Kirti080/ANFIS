/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-base":  "#050714",
        "dark-card":  "#0d0f24",
        "dark-card2": "#111329",
        "dark-border":"#1a1d3a",
        "neon":       "#7c3aed",
        "neon-light": "#a78bfa",
        "neon-bright":"#c4b5fd",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', "monospace"],
      },
      animation: {
        "pulse-slow":    "pulse 3s ease-in-out infinite",
        "spin-slow":     "spin 8s linear infinite",
        "gradient-x":   "gradientX 4s linear infinite",
        "fade-up":       "fadeUp .4s ease both",
        "slide-in":      "slideIn .35s ease both",
        "glow-pulse":    "glowPulse 2s ease-in-out infinite",
        "scanline":      "scanline 6s linear infinite",
      },
      keyframes: {
        gradientX: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%":     { backgroundPosition: "100% 50%" },
        },
        fadeUp: {
          from: { opacity: 0, transform: "translateY(14px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: 0, transform: "translateX(-12px)" },
          to:   { opacity: 1, transform: "translateX(0)" },
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 8px rgba(124,58,237,0.4)" },
          "50%":     { boxShadow: "0 0 24px rgba(124,58,237,0.9), 0 0 40px rgba(124,58,237,0.3)" },
        },
        scanline: {
          "0%":   { top: "-4px" },
          "100%": { top: "100%" },
        },
      },
      backgroundSize: {
        "200": "200% 200%",
      },
    },
  },
  plugins: [],
}
