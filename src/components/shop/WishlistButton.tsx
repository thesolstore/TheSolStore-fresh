import { FC } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export const WishlistButton: FC<WishlistButtonProps> = ({ productId, className = '' }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(productId);

  const handleClick = () => {
    try {
      if (isWishlisted) {
        removeFromWishlist(productId);
        toast.success('Removed from wishlist');
      } else {
        addToWishlist(productId);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      className={`p-2 rounded-lg transition-colors ${className} ${
        isWishlisted ? 'bg-red-500/10' : ''
      }`}
      title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          isWishlisted
            ? 'text-red-500 fill-current'
            : 'text-gray-400 hover:text-red-500'
        }`}
      />
    </motion.button>
  );
};
