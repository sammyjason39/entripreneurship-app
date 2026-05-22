import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  fallbacks: {
    document: '/offline',
  },
  // `!` = do not precache (see next-pwa docs). Default already skips public/noprecache/.
  publicExcludes: [
    '!noprecache/**/*',
    '!map/**/*',
    '!brands/**/*',
    '!logo-entrip.png',
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default withPWA(nextConfig);
