import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://timo-store.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/*'], // Prevent crawling of admin pages
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
