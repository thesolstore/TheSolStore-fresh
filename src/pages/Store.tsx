import { FC, useEffect, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Loader2 } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: {
    src: string;
  }[];
}

const Store: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products'); // You'll need to implement this endpoint
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch products');
        }
        
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading products...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.title}
            description={product.description}
            price={product.price}
            image={product.images[0]?.src || '/placeholder.png'}
          />
        ))}
      </div>
    </div>
  );
};

export default Store;
