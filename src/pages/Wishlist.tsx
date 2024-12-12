import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Heart, Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { getProducts, PrintifyProduct } from '../services/printify';
import { AddToCartButton } from '../components/shop/AddToCartButton';
import { toast } from 'react-hot-toast';

interface Product extends PrintifyProduct {
  selectedVariantId?: string;
  price: number;
}

const Wishlist: FC = () => {
  const { connected } = useWallet();
  const { wishlist, removeFromWishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        const wishlistProducts = allProducts.filter(product => 
          wishlist.includes(product.id)
        );
        setProducts(wishlistProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [wishlist]);

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
    toast.success('Removed from wishlist');
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your wishlist
          </p>
          <WalletMultiButton className="!bg-[#9945FF] hover:!bg-[#7C37CC]" />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading wishlist...</span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-400 mb-6">
            Browse our shop and add items to your wishlist
          </p>
          <a
            href="/shop"
            className="inline-flex items-center space-x-2 bg-[#9945FF] text-white px-6 py-3 rounded-lg hover:bg-[#7C37CC] transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            <span>Go to Shop</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-[#232328] rounded-lg overflow-hidden hover:shadow-lg hover:shadow-[#9945FF]/20 transition-all duration-300 border border-[#2D2D32]"
          >
            <div className="relative group">
              <img
                src={product.images[0] || '/placeholder.png'}
                alt={product.title}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">{product.title}</h3>
              <p className="text-[#C8C8C8] mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#9945FF]">
                  ${product.price.toFixed(2)}
                </span>
                <AddToCartButton 
                  product={product}
                  className="shadow-lg shadow-[#9945FF]/20"
                  onSuccess={() => toast.success('Added to cart')}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
