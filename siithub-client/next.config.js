/** @type {import('next').NextConfig} */
require("dotenv").config;

const nextConfig = {
  reactStrictMode: false,
  output: "standalone",
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

module.exports = nextConfig;
