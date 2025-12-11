import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'src', 'components', 'lib', 'hooks'],
  },
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
                net: false,
                tls: false,
                crypto: false,
                stream: false,
                util: false,
                url: false,
                assert: false,
                http: false,
                https: false,
                os: false,
                buffer: false,
                process: false,
            };
        }
        return config;
    },
};

export default nextConfig;
