/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Disable static optimization for pages that use Convex
  output: 'standalone',
  webpack: (config) => {
    config.externals = [...config.externals, { bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' }];
    return config;
  },
};

module.exports = nextConfig;