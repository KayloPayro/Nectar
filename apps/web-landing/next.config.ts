import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false, // התיקון כאן (עם ה-ed)
  reactStrictMode: true,
  // אופטימיזציות נוספות לציון 100:
  images: {
    formats: ["image/avif", "image/webp"], // גורם לתמונות להיות קטנות ב-50%
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
