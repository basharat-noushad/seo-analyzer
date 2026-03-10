/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    // Exclude server-only packages that are too large or can't run in serverless
    serverComponentsExternalPackages: ['puppeteer', 'puppeteer-core', 'chrome-aws-lambda'],
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
