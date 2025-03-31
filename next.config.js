/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './app'),
      '@components': path.resolve(__dirname, './app/components'),
      '@contexts': path.resolve(__dirname, './app/contexts'),
    };
    return config;
  },
};

module.exports = nextConfig; 