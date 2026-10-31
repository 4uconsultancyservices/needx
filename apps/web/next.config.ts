import type { NextConfig } from 'next';

const apiOrigin = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Self-contained server.js + minimal node_modules — the Dockerfile above
  // copies exactly this output, keeping the production image small.
  output: 'standalone',
  transpilePackages: ['@needx/types', '@needx/validation'],
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: '192.168.**' },
      { protocol: 'http', hostname: '10.**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  async headers() {
    return [
      {
        // Service worker must never be cached by intermediaries — a stale
        // SW can pin users to an old app shell indefinitely.
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Lets the browser call same-origin `/api/v1/...` in dev (avoids
        // CORS entirely); the NestJS API still also has CORS configured for
        // direct cross-origin calls (e.g. from a deployed frontend origin).
        source: '/api/v1/:path*',
        destination: `${apiOrigin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
