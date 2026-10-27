import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#18261f", cream: "#f5f0e4", card: "#fcfaf4", terra: "#b8541f", sand: "#e8b872", moss: "#2d4a3b", line: "#d6cfbe", mute: "#5c665f" },
    fontFamily: { sans: ["var(--font-sans)", "DM Sans", "system-ui", "sans-serif"], serif: ["var(--font-serif)", "Libre Baskerville", "Georgia", "serif"] },
  } },
  plugins: [],
} satisfies Config;
