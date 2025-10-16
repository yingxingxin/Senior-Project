import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
  turbopack: {
    // Ensure Turbopack uses this project as the workspace root to avoid
    // selecting a parent directory with another lockfile.
    root: __dirname,
  },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // prevent browser bundle from trying to use Node's fs/path
            config.resolve = config.resolve || {};
            config.resolve.fallback = {
                ...(config.resolve.fallback || {}),
                fs: false,
                path: false,
            };
        }
        return config;
    },
};

export default nextConfig;
