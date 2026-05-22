import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.tang-freres.fr' },
    ],
  },
}

export default nextConfig
