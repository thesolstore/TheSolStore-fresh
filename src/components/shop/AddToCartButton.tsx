import { FC, useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { PrintifyProduct } from '../../services/printify';

interface AddToCartButtonProps {
  product: PrintifyProduct;
  className?: string;
  onSuccess?: () => void;
}

export const AddToCartButton: FC<AddToCartButtonProps> = ({ product, className = '', onSuccess }) => {
  const [isAdded, setIsAdded] = useState(false);
  const addToCart = useStore((state) => state.addToCart);

  const handleClick = () => {
    addToCart({
      id: product.id,
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '/placeholder.png',
      variantId: product.variants[0]?.id
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
    if (onSuccess) onSuccess();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`relative overflow-hidden ${className} ${
        isAdded ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'
      } text-white px-6 py-2 rounded-lg flex items-center justify-center transition-colors duration-300`}
      disabled={isAdded}
    >
      <AnimatePresence mode="wait">
        {isAdded ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center"
          >
            <Check className="h-5 w-5 mr-2" />
            Added!
          </motion.div>
        ) : (
          <motion.div
            key="cart"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};
