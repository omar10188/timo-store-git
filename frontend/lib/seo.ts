import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://timo-store.vercel.app';

export function getImageUrl(src: string) {
  if (!src) return '';
  const decoded = src.startsWith('http') ? src : `${API_BASE}${src}`;
  return encodeURI(decoded);
}

export function getProductSEO(product: any): Metadata {
  if (!product) {
    return {
      title: 'Product Not Found | TIMO STORE',
      description: 'The requested product could not be found.',
    };
  }

  const title = `${product.name} | TIMO STORE`;
  const description = product.description 
    ? product.description.substring(0, 160) 
    : `Buy ${product.name} at TIMO STORE. Premium fragrances and colognes.`;
    
  const imageUrl = getImageUrl(product.image || product.images?.[0]);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : [],
      type: 'website',
      siteName: 'TIMO STORE',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}
