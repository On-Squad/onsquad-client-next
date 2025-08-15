/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,

  images: {
    domains: [
      'onsquad-bucket.s3.ap-northeast-2.amazonaws.com',
      't1.daumcdn.net',
      'avatars.githubusercontent.com',
    ],
  },
};

export default nextConfig;
