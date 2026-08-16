/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/list-property",
        destination: "/host/new",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
