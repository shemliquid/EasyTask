/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Enable turbopack explicitly
  turbopack: {},
};

module.exports = nextConfig;
