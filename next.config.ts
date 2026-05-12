import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL('https://*.supabase.co'),
      new URL('https://*.supabase.in'),
    ],
  },
};

export default withNextIntl(nextConfig);
