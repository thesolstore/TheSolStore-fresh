import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Review, addReview, getProductReviews, getAverageRating, updateReview, deleteReview } from '../../services/reviews';

interface ReviewComponentProps {
  productId: string;
}

export const ReviewComponent: React.FC<ReviewComponentProps> = ({ productId }) => {
  const { publicKey } = useWallet();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = () => {
    const productReviews = getProductReviews(productId);
    setReviews(productReviews);
    setAverageRating(getAverageRating(productId));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    addReview(productId, rating, comment, publicKey.toString());
    setComment('');
    setRating(5);
    loadReviews();
  };

  const handleDeleteReview = (reviewId: string) => {
    if (!publicKey) return;
    
    if (deleteReview(reviewId, publicKey.toString())) {
      loadReviews();
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Product Reviews</h2>
      
      {/* Average Rating */}
      <div className="mb-6">
        <div className="flex items-center">
          <span className="text-yellow-400 text-xl mr-2">★</span>
          <span className="text-white">{averageRating.toFixed(1)} / 5.0</span>
          <span className="text-gray-400 ml-2">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Review Form */}
      {publicKey && (
        <form onSubmit={handleSubmitReview} className="mb-8">
          <div className="mb-4">
            <label className="block text-white mb-2">Rating</label>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-400'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white"
              rows={3}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Submit Review
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-700 p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className={`text-lg ${
                        index < review.rating ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white">{review.comment}</p>
                <p className="text-gray-400 text-sm mt-2">
                  By: {review.walletAddress.slice(0, 6)}...{review.walletAddress.slice(-4)}
                </p>
              </div>
              {publicKey?.toString() === review.walletAddress && (
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-red-400 hover:text-red-500"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Connect Wallet Prompt */}
      {!publicKey && (
        <div className="text-center py-4">
          <p className="text-gray-400">Connect your wallet to leave a review</p>
        </div>
      )}
    </div>
  );
};
