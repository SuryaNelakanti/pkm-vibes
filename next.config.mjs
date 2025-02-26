/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this being included on the client
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        assert: false,
        crypto: false,
      };
    }
    return config;
  },
};

export default nextConfig;
