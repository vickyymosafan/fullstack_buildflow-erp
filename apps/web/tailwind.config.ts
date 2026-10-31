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
        primary: {
          DEFAULT: "#17324D",
          hover: "#102337",
          foreground: "#FFFFFF",
        },
        action: {
          DEFAULT: "#2F6B9A",
          hover: "#24557A",
          foreground: "#FFFFFF",
        },
        background: "#F4F7FA",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#EBF0F5",
        },
        content: {
          main: "#2D3D4B",
          muted: "#6B7C8D",
        },
        border: "#D8E1E8",
        status: {
          success: "#4D8B70",
          successBg: "#EAF4EE",
          warning: "#C18A3A",
          warningBg: "#FDF6EC",
          danger: "#B95B5B",
          dangerBg: "#FBEFEF",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

