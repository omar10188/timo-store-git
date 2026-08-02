import { MetadataRoute } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://timo-store.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Fetch products
    const productsRes = await fetch(`${API_BASE}/products?limit=1000`, { next: { revalidate: 3600 } });
    if (productsRes.ok) {
      const productsData = await productsRes.json();
      const products = productsData.products || []; // Depending on API format
      products.forEach((product: any) => {
        sitemapEntries.push({
          url: `${SITE_URL}/products/${product._id}`,
          lastModified: new Date(product.updatedAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      });
    }

    // Fetch categories
    const categoriesRes = await fetch(`${API_BASE}/categories`, { next: { revalidate: 3600 } });
    if (categoriesRes.ok) {
      const categories = await categoriesRes.json();
      categories.forEach((category: any) => {
        sitemapEntries.push({
          url: `${SITE_URL}/products?category=${category._id}`,
          lastModified: new Date(category.updatedAt || new Date()),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemapEntries;
}
