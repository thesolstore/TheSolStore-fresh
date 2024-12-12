import { FC } from 'react';
import { useSOLPrice } from '../services/price';
import { Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number; // USD price from Printify
  image: string;
}

export const ProductCard: FC<ProductCardProps> = ({ id, name, description, price, image }) => {
  const { solPrice, loading: priceLoading } = useSOLPrice();
  const { addToCart } = useStore();

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price, // Store USD price
      image,
      quantity: 1,
    });
    toast.success('Added to cart!');
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <img 
        src={image} 
        alt={name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <div className="flex justify-between items-end mb-4">
          <div>
            {priceLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading price...</span>
              </div>
            ) : (
              <div>
                <div className="text-purple-400 text-lg font-bold">
                  {solPrice ? (price / solPrice).toFixed(3) : '...'} SOL
                </div>
                <div className="text-sm text-gray-400">
                  ${price.toFixed(2)} USD
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
