/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:        "#05714B",
        "primary-hover":"#045c3d",
        "primary-bg":   "#edf7f2",
        "bg-main":      "#FAFAFA",
        "bg-secondary": "#F4F4F4",
        border:         "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary":"#6B7280",
        "text-muted":   "#9CA3AF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}