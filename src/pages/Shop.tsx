import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { getProducts, PrintifyProduct } from '../services/printify';
import { useStore } from '../store/useStore';
import { Star, Loader2, RefreshCw } from 'lucide-react';
import { ReviewComponent } from '../components/shop/ReviewComponent';
import { AddToCartButton } from '../components/shop/AddToCartButton';
import { WishlistButton } from '../components/shop/WishlistButton';
import { useSOLPrice } from '../services/price';
import { toast } from 'react-hot-toast';
import '../styles/wallet-button.css';

interface Product extends PrintifyProduct {
  selectedVariantId?: string;
  price: number; // USD price from Printify
}

const Shop: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const { connected } = useWallet();
  const addToCart = useStore((state) => state.addToCart);
  const { solPrice, loading: priceLoading, lastUpdated, refresh: refreshPrice } = useSOLPrice();

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        setLoading(true);
        const fetchedProducts = await getProducts();
        
        const productsWithVariants = fetchedProducts.map(product => ({
          ...product,
          selectedVariantId: product.variants.find(v => v.is_enabled)?.id
        }));
        
        const validProducts = productsWithVariants.filter(product => 
          typeof product.price === 'number' && !isNaN(product.price)
        );
        
        setProducts(validProducts);
      } catch (error: any) {
        console.error('Error loading products:', error);
        setError(error.message || 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Loading skeleton component
  const ProductSkeleton = () => (
    <div className="bg-[#232328] rounded-lg overflow-hidden hover:shadow-lg hover:shadow-[#9945FF]/20 transition-all duration-300 border border-[#2D2D32]">
      <div className="relative group">
        <div className="h-64 bg-gray-200 rounded-md mb-4"></div>
        {connected && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center space-x-2">
              <WishlistButton productId={''} />
              <AddToCartButton 
                product={{ id: '', title: '' }}
                className="shadow-lg shadow-[#9945FF]/20"
                onSuccess={() => toast.success(`Added  to cart!`)}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < 4 ? 'text-[#14F195]' : 'text-[#2D2D32]'}`}
                fill="currentColor"
              />
            ))}
          </div>
          <span className="ml-2 text-[#C8C8C8]">(4.0)</span>
        </div>
        
        <p className="text-[#C8C8C8] mb-4 line-clamp-2"></p>
        
        <div className="flex flex-col space-y-4">
          <select
            className="bg-[#1B1B1F] text-white rounded-lg p-2 border border-[#2D2D32] focus:border-[#9945FF] focus:ring-1 focus:ring-[#9945FF] transition-colors duration-300"
          >
            <option value="">Select variant</option>
          </select>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-[#9945FF]"></span>
              <span className="text-sm text-[#C8C8C8]"></span>
            </div>
            {connected && (
              <div className="flex items-center space-x-2">
                <WishlistButton productId={''} />
                <AddToCartButton 
                  product={{ id: '', title: '' }}
                  className="shadow-lg shadow-[#9945FF]/20"
                  onSuccess={() => toast.success(`Added  to cart!`)}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
        {[...Array(productsPerPage)].map((_, index) => (
          <ProductSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Function to format the last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastUpdated.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    return `${Math.floor(seconds / 60)} minutes ago`;
  };

  const handleVariantChange = (productId: string, variantId: string) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, selectedVariantId: variantId }
          : product
      )
    );
  };

  const handleAddToCart = (product: Product) => {
    if (!solPrice) {
      toast.error('Unable to add to cart: SOL price not available');
      return;
    }

    const variantId = product.selectedVariantId || product.variants[0]?.id;
    const variantPrice = product.variantPrices[variantId] || product.price;

    addToCart({
      id: product.id,
      name: product.title,
      price: variantPrice,
      quantity: 1,
      image: product.images[0]
    });
    
    toast.success(`Added ${product.title} to cart!`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-2">The Sol Store Merch</h1>
      <p className="text-xl text-center text-gray-600 mb-4">Wear Your Crypto Pride! To The Moon! 🚀</p>
      <p className="text-sm text-center text-gray-500 mb-6">
        SOL Price Last Updated: {getLastUpdatedText()}
      </p>

      {!connected && (
        <div className="max-w-3xl mx-auto mb-8 wallet-button-wrapper bg-gradient-to-r from-purple-900/10 to-red-900/10 rounded-xl p-6 backdrop-blur-sm border border-red-500/20">
          <div className="flex flex-col items-center space-y-4">
            <div className="wallet-alert text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-purple-600">
              🎉 Connect Your Wallet to Start Shopping! 🎉
            </div>
            <div className="text-gray-500 text-center max-w-xl">
              Access exclusive Sol Store merch and join our community of crypto enthusiasts. Your style, your wallet, your way!
            </div>
            <div className="relative mt-2 transform hover:scale-105 transition-transform duration-200">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500 to-purple-600 animate-pulse opacity-50 blur-md"></div>
              <WalletMultiButton className="relative !bg-gradient-to-r !from-red-500 !to-purple-600 hover:!from-red-600 hover:!to-purple-700 !transition-all !duration-300 !rounded-lg !px-8 !py-3 !text-lg !font-bold !border-2 !border-white/20" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentProducts.map((product) => (
          <div key={product.id} className="bg-[#232328] rounded-lg overflow-hidden hover:shadow-lg hover:shadow-[#9945FF]/20 transition-all duration-300 border border-[#2D2D32]">
            <div className="relative group">
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
              />
              {connected && (
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center space-x-2">
                    <WishlistButton productId={product.id} />
                    <AddToCartButton 
                      product={product}
                      className="shadow-lg shadow-[#9945FF]/20"
                      onSuccess={() => toast.success(`Added ${product.title} to cart!`)}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 text-white hover:text-[#14F195] transition-colors duration-300">
                {product.title}
              </h3>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < 4 ? 'text-[#14F195]' : 'text-[#2D2D32]'}`}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <span className="ml-2 text-[#C8C8C8]">(4.0)</span>
              </div>
              
              <p className="text-[#C8C8C8] mb-4 line-clamp-2">{product.description}</p>
              
              <div className="flex flex-col space-y-4">
                {product.variants.length > 1 && (
                  <select
                    className="bg-[#1B1B1F] text-white rounded-lg p-2 border border-[#2D2D32] focus:border-[#9945FF] focus:ring-1 focus:ring-[#9945FF] transition-colors duration-300"
                    value={product.selectedVariantId}
                    onChange={(e) => handleVariantChange(product.id, e.target.value)}
                  >
                    {product.variants
                      .filter(v => v.is_enabled)
                      .map(variant => (
                        <option key={variant.id} value={variant.id}>
                          {variant.title}
                        </option>
                      ))}
                  </select>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    {solPrice ? (
                      <>
                        <span className="text-2xl font-bold text-[#9945FF]">
                          {(
                            (product.selectedVariantId 
                              ? product.variantPrices[product.selectedVariantId] 
                              : product.price) / solPrice
                          ).toFixed(3)} SOL
                        </span>
                        <span className="text-sm text-[#C8C8C8]">
                          ${(
                            product.selectedVariantId 
                              ? product.variantPrices[product.selectedVariantId] 
                              : product.price
                          ).toFixed(2)} USD
                        </span>
                      </>
                    ) : (
                      <div className="flex items-center text-[#C8C8C8]">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading price...</span>
                      </div>
                    )}
                  </div>
                  {connected && (
                    <div className="flex items-center space-x-2">
                      <WishlistButton productId={product.id} />
                      <AddToCartButton 
                        product={product}
                        className="shadow-lg shadow-[#9945FF]/20"
                        onSuccess={() => toast.success(`Added ${product.title} to cart!`)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedProduct === product.id && (
              <div className="p-6 border-t border-[#2D2D32]">
                <ReviewComponent productId={product.id} />
              </div>
            )}
            
            <div className="px-6 pb-6">
              <button
                onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                className="text-sm text-[#C8C8C8] hover:text-[#14F195] transition-colors duration-300"
              >
                {selectedProduct === product.id ? 'Hide Reviews' : 'Show Reviews'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 gap-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Shop;