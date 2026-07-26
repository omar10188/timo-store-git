import { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const CLIENT_URL = process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${CLIENT_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${CLIENT_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${CLIENT_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Fetch products to add them dynamically
    const res = await fetch(`${API_BASE}/products?limit=1000`);
    if (res.ok) {
      const data = await res.json();
      const productRoutes: MetadataRoute.Sitemap = data.products.map((product: any) => ({
        url: `${CLIENT_URL}/products/${product._id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
      return [...routes, ...productRoutes];
    }
  } catch (error) {
    console.error('Failed to generate dynamic sitemap for products', error);
  }

  return routes;
}
