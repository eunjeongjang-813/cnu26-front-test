import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 네이버 쇼핑 이미지 도메인 허용
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.naver.com',
      },
      {
        protocol: 'https',
        hostname: '**.pstatic.net',
      },
    ],
  },
};

export default nextConfig;
