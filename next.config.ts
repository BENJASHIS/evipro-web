import type { NextConfig } from "next";
import { NOINDEX_ROUTES } from './lib/seo';
import { CSP } from './lib/csp';

const nextConfig: NextConfig = {
  async headers() {
    return [
      // SAMEORIGIN y no DENY: el visor del frasco se muestra en un iframe del mismo sitio.
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: CSP },
        ],
      },
      ...NOINDEX_ROUTES.map(source => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
    ];
  },
  outputFileTracingIncludes: {
    '/miembros/contenido/explora-cbd-thc/visor/*': ['./private/frasco/**/*'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'bfcyzdrxnjkfeplcxyxv.supabase.co' },
    ],
  },
};

export default nextConfig;
