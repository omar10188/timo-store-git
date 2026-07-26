import { Metadata } from 'next';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) return { title: 'Product Not Found' };
    
    const product = await res.json();
    const imageUrl = product.image?.startsWith('http')
      ? product.image
      : `${API_BASE.replace('/api', '')}${product.image}`;

    return {
      title: product.name,
      description: product.description.substring(0, 160),
      openGraph: {
        title: product.name,
        description: product.description.substring(0, 160),
        images: [{ url: imageUrl }],
      },
    };
  } catch (error) {
    return {
      title: 'Timo Store Product',
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
