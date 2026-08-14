import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,

  // 워크스페이스 패키지를 TS 소스 그대로 소비한다 (빌드 단계 없음).
  transpilePackages: ['@onsquad/bridge'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dkf7z15ruw9rd.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 't1.daumcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // 빌드 타임 시크릿. 없으면 소스맵을 안 올리고 빌드는 그대로 성공한다.
  // 없이 배포하면 스택 트레이스가 난독화된 채로 올라와 사실상 못 읽는다.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  silent: !process.env.CI,
});
