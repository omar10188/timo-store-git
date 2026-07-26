import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/checkout/', '/api/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000'}/sitemap.xml`,
  };
}
