import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '5000' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Add your production backend domain here when deployed:
      // { protocol: 'https', hostname: 'timo-store-backend.up.railway.app' }
    ],
  },
};

export default nextConfig;
