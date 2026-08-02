import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { getProductSEO } from '@/lib/seo';

// Fetch product data for SEO (Server-side)
async function getProduct(id: string) {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch product for SEO:', error);
    return null;
  }
}

// Generate dynamic metadata for SEO & Social Sharing
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  return getProductSEO(product);
}

// Render the Client Component layout
export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient />;
}
