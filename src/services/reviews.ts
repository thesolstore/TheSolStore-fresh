import { PublicKey } from '@solana/web3.js';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  walletAddress: string;
}

// In a production environment, this would be stored in a database
let reviews: Review[] = [];

export const addReview = (
  productId: string,
  rating: number,
  comment: string,
  walletAddress: string
): Review => {
  const review: Review = {
    id: `review_${Date.now()}`,
    productId,
    userId: walletAddress,
    rating,
    comment,
    createdAt: new Date().toISOString(),
    walletAddress
  };

  reviews.push(review);
  return review;
};

export const getProductReviews = (productId: string): Review[] => {
  return reviews.filter(review => review.productId === productId);
};

export const getAverageRating = (productId: string): number => {
  const productReviews = getProductReviews(productId);
  if (productReviews.length === 0) return 0;
  
  const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
  return totalRating / productReviews.length;
};

export const getUserReviews = (walletAddress: string): Review[] => {
  return reviews.filter(review => review.walletAddress === walletAddress);
};

export const deleteReview = (reviewId: string, walletAddress: string): boolean => {
  const index = reviews.findIndex(
    review => review.id === reviewId && review.walletAddress === walletAddress
  );
  
  if (index === -1) return false;
  
  reviews.splice(index, 1);
  return true;
};

export const updateReview = (
  reviewId: string,
  walletAddress: string,
  updates: Partial<Pick<Review, 'rating' | 'comment'>>
): Review | null => {
  const review = reviews.find(
    r => r.id === reviewId && r.walletAddress === walletAddress
  );
  
  if (!review) return null;
  
  Object.assign(review, updates);
  return review;
};
