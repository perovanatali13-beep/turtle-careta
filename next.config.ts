import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://*.supabase.co'),
      new URL('https://*.supabase.in'),
      new URL('https://upload.wikimedia.org'),
      new URL('https://images.unsplash.com'),
    ],
  },
};

export default withNextIntl(nextConfig);
