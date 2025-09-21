/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Optimize Edge Function deployment
    optimizeServerReact: true,
    // Better HTTP streaming
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
