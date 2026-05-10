/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "16px",
    },
    extend: {
      colors: {
        finance: {
          bg: "#0a0e17",
          "bg-secondary": "#111827",
          card: "#1a2332",
          "card-hover": "#1f2a40",
          border: "#2e3a52",
          green: "#00d68f",
          "green-muted": "#00d68f33",
          red: "#ff3d71",
          "red-muted": "#ff3d7133",
          blue: "#3366ff",
          "blue-muted": "#3366ff33",
          gold: "#ffc107",
          "gold-muted": "#ffc10733",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-green": "glowGreen 2s ease-in-out infinite",
        "glow-red": "glowRed 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowGreen: {
          "0%, 100%": { boxShadow: "0 0 5px #00d68f33" },
          "50%": { boxShadow: "0 0 20px #00d68f66" },
        },
        glowRed: {
          "0%, 100%": { boxShadow: "0 0 5px #ff3d7133" },
          "50%": { boxShadow: "0 0 20px #ff3d7166" },
        },
      },
      spacing: {
        "safe-bottom": "env(safe-area-inset-bottom)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
