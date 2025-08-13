/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/api/socket',
        destination: 'http://localhost:3001/socket.io/',
      },
    ]
  },
}

module.exports = nextConfig