import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        sans: ["Assistant", "sans-serif"],
      },
      fontSize: {
        'display-lg': ['2.625rem', { lineHeight: '1', letterSpacing: '-0.02em' }], // ~42px
        'display-md': ['2.375rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }], // ~38px
        'label-sm': ['0.625rem', { letterSpacing: '0.3em' }], // ~10px
      },
    },
  },
  plugins: [],
};
export default config;
