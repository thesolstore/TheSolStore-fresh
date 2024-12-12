import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  sendAndConfirmTransaction,
  clusterApiUrl
} from '@solana/web3.js';
import { useStore } from '../store/useStore';
import { useSOLPrice } from '../services/price';
import { ShoppingCart, User, Search, Settings, Package, LogOut, ChevronDown, Mail, Heart, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ShippingAddressForm } from '../components/shop/ShippingAddressForm';
import { sendReceiptEmail } from '../services/email';
import { createPrintifyOrder, getCountryCode, getStateCode, getProducts, PrintifyProduct } from '../services/printify';
import { AddToCartButton } from '../components/shop/AddToCartButton';

// The store's wallet address (make sure this matches your .env)
const STORE_WALLET_ADDRESS = 'BA4gpFR4wLN7MnfC5YSVRW96bXTRSQ6Vgy49zGkpsHJV';

interface Product extends PrintifyProduct {
  selectedVariantId?: string;
  price: number;
}

const Cart: FC = () => {
  const navigate = useNavigate();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { cart, removeFromCart, clearCart, addOrder, userProfile, setShippingAddress, wishlist, addToWishlist, removeFromWishlist } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [wantEmailReceipt, setWantEmailReceipt] = useState(false);
  const { solPrice, loading: priceLoading } = useSOLPrice();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  const totalUSD = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalSOL = solPrice ? (totalUSD / solPrice) : 0;

  const handleAddressSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setShowAddressForm(false);
    handlePayment();
  };

  const handlePaymentClick = () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet and try again');
      return;
    }

    // Check if shipping address exists
    if (!userProfile.shippingAddress) {
      toast((t) => (
        <div>
          <p className="mb-2">Please add a shipping address to continue</p>
          <button
            onClick={() => {
              setShowAddressForm(true);
              toast.dismiss(t.id);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Add Address
          </button>
        </div>
      ), {
        duration: 5000,
      });
      return;
    }

    // Confirm shipping address and ask about email receipt
    toast((t) => (
      <div>
        <p className="font-semibold mb-2">Confirm shipping address:</p>
        <p className="text-sm mb-1">{userProfile.shippingAddress.first_name} {userProfile.shippingAddress.last_name}</p>
        <p className="text-sm mb-1">{userProfile.shippingAddress.address1}</p>
        {userProfile.shippingAddress.address2 && (
          <p className="text-sm mb-1">{userProfile.shippingAddress.address2}</p>
        )}
        <p className="text-sm mb-1">
          {userProfile.shippingAddress.city}, {userProfile.shippingAddress.state} {userProfile.shippingAddress.zipCode}
        </p>
        <p className="text-sm mb-3">{userProfile.shippingAddress.country}</p>
        
        <div className="mb-3">
          <label className="flex items-center space-x-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={wantEmailReceipt}
              onChange={(e) => setWantEmailReceipt(e.target.checked)}
              className="form-checkbox h-4 w-4 text-purple-600 rounded border-gray-600 bg-gray-700"
            />
            <span>Send receipt to {userProfile.shippingAddress.email}</span>
          </label>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              handlePayment();
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Confirm
          </button>
          <button
            onClick={() => {
              setShowAddressForm(true);
              toast.dismiss(t.id);
            }}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Change
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const handlePayment = async () => {
    if (!publicKey || !signTransaction) {
      toast.error('Please connect your wallet and try again');
      return;
    }

    try {
      setIsProcessing(true);

      // Create recipient public key
      const recipientPubkey = new PublicKey(STORE_WALLET_ADDRESS);
      console.log('Store wallet address:', STORE_WALLET_ADDRESS);

      // Calculate exact amount in lamports
      const amountInLamports = Math.ceil(totalSOL * LAMPORTS_PER_SOL);
      
      // Estimate transaction fee (this is approximate)
      const feeEstimate = 5000; // 0.000005 SOL
      const totalAmount = amountInLamports + feeEstimate;
      
      console.log('Transaction details:', {
        amount: amountInLamports / LAMPORTS_PER_SOL,
        fee: feeEstimate / LAMPORTS_PER_SOL,
        total: totalAmount / LAMPORTS_PER_SOL,
        USD: totalUSD
      });

      // Check sender's balance with retries
      let senderBalance = 0;
      let retries = 3;
      while (retries > 0) {
        try {
          senderBalance = await connection.getBalance(publicKey);
          console.log('Sender balance:', senderBalance / LAMPORTS_PER_SOL, 'SOL');
          break;
        } catch (error) {
          console.log('Error getting balance, retrying...', retries);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (senderBalance < totalAmount) {
        toast.error('Insufficient balance. Please add funds to cover the amount plus transaction fees.');
        return;
      }

      // Get recent blockhash with retries
      let blockhash, lastValidBlockHeight;
      retries = 3;
      while (retries > 0) {
        try {
          const result = await connection.getLatestBlockhash('confirmed');
          blockhash = result.blockhash;
          lastValidBlockHeight = result.lastValidBlockHeight;
          console.log('Got blockhash:', blockhash);
          break;
        } catch (error) {
          console.log('Error getting blockhash, retrying...', retries);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Create and sign transaction
      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: amountInLamports,
        })
      );

      const signedTransaction = await signTransaction(transaction);
      console.log('Transaction signed');

      // Send transaction with retries
      let signature;
      retries = 3;
      while (retries > 0) {
        try {
          signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
            skipPreflight: false,
            preflightCommitment: 'confirmed',
          });
          console.log('Transaction sent:', signature);
          break;
        } catch (error) {
          console.log('Error sending transaction, retrying...', retries);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Wait for confirmation
      console.log('Waiting for confirmation...');
      
      const confirmationStrategy = {
        signature,
        blockhash,
        lastValidBlockHeight
      };

      let confirmed = false;
      retries = 30; // Increase retries with longer timeout
      
      while (retries > 0 && !confirmed) {
        try {
          const confirmation = await connection.confirmTransaction(confirmationStrategy, 'confirmed');
          
          if (confirmation.value.err) {
            throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
          }

          confirmed = true;
          console.log('Transaction confirmed:', confirmation);
          
          // Create Printify order
          try {
            const countryCode = 'US';  // Always US
            const stateCode = getStateCode(userProfile.shippingAddress.state);  // Convert state to proper code

            const shippingAddress = {
              first_name: userProfile.shippingAddress.first_name,
              last_name: userProfile.shippingAddress.last_name,
              address1: userProfile.shippingAddress.address1,
              address2: userProfile.shippingAddress.address2 || '',
              city: userProfile.shippingAddress.city,
              state: stateCode,
              country: countryCode,
              zip: userProfile.shippingAddress.zip,
              email: userProfile.shippingAddress.email,
              phone: userProfile.shippingAddress.phone || ''
            };

            // Create customer profile
            const customer = {
              first_name: userProfile.shippingAddress.first_name,
              last_name: userProfile.shippingAddress.last_name,
              email: userProfile.shippingAddress.email,
              phone: userProfile.shippingAddress.phone || '',
              country_code: countryCode,
              country_name: 'United States',
              region: stateCode,
              address1: userProfile.shippingAddress.address1,
              address2: userProfile.shippingAddress.address2 || '',
              city: userProfile.shippingAddress.city,
              zip: userProfile.shippingAddress.zip
            };

            console.log('Creating order with shipping address:', {
              countryCode,
              stateCode,
              shippingAddress,
              customer
            });

            const printifyOrder = await createPrintifyOrder({
              shipping_address: shippingAddress,
              address_to: shippingAddress,
              customer,
              line_items: cart.map(item => ({
                product_id: item.id,
                variant_id: parseInt(item.variantId || item.id, 10),
                quantity: item.quantity,
              })),
            });

            console.log('Printify order created:', printifyOrder);
          } catch (error) {
            console.error('Error creating Printify order:', error);
            toast.error('Payment successful, but there was an issue creating your order. Our team will contact you.');
          }
          
          // Save order
          const order = {
            id: signature,
            items: [...cart],
            total: totalUSD,
            solAmount: totalSOL,
            signature,
            timestamp: Date.now(),
          };
          
          addOrder(order);
          clearCart();

          // Send email receipt if requested
          if (wantEmailReceipt && userProfile.shippingAddress) {
            try {
              const emailSent = await sendReceiptEmail(userProfile.shippingAddress.email, {
                orderNumber: signature.slice(0, 8),
                items: cart,
                totalUSD,
                totalSOL,
                shippingAddress: userProfile.shippingAddress,
                transactionSignature: signature,
                timestamp: Date.now(),
              });

              if (emailSent) {
                console.log('Receipt email sent successfully');
              } else {
                console.warn('Failed to send receipt email');
                toast.error('Could not send receipt email. Please check your order history for details.');
              }
            } catch (error) {
              console.error('Error sending receipt email:', error);
            }
          }

          toast.success(
            <div>
              Payment successful! 🎉
              <a
                href={`https://solscan.io/tx/${signature}?cluster=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-purple-400 hover:text-purple-300 mt-1"
              >
                View transaction →
              </a>
            </div>
          );

          navigate('/profile');
          return;

        } catch (error) {
          console.log('Confirmation attempt failed, retrying...', retries);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      throw new Error('Transaction confirmation timeout');

    } catch (error: any) {
      console.error('Payment error:', error);
      
      let errorMessage = 'Payment failed. Please try again.';
      const errorDetails = error.message || '';
      
      if (errorDetails.includes('insufficient balance for rent-exempt reserve')) {
        errorMessage = 'Insufficient balance for transaction fees.';
      } else if (errorDetails.includes('insufficient balance')) {
        errorMessage = 'Insufficient balance in your wallet.';
      } else if (errorDetails.includes('User rejected')) {
        errorMessage = 'Transaction was cancelled.';
      } else if (errorDetails.includes('blockhash')) {
        errorMessage = 'Transaction expired. Please try again.';
      } else if (errorDetails.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.';
      } else if (errorDetails.includes('0x1')) {
        errorMessage = 'Transaction failed. Please check your balance and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch wishlist products
  useEffect(() => {
    const fetchWishlistProducts = async () => {
      try {
        setLoadingWishlist(true);
        const allProducts = await getProducts();
        const filteredProducts = allProducts.filter(product => 
          wishlist.includes(product.id)
        );
        setWishlistProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoadingWishlist(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  if (showAddressForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#232328] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="relative">
            <button
              onClick={() => setShowAddressForm(false)}
              className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ShippingAddressForm
              onSubmit={handleAddressSubmit}
              defaultAddress={userProfile.shippingAddress}
            />
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-400 mb-8">Add some awesome crypto merch to get started!</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 bg-gray-800 p-4 rounded-lg mb-4"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-400">
                  Quantity: {item.quantity}
                </p>
                <div className="text-purple-400">
                  ${(item.price * item.quantity).toFixed(2)} USD
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    if (!wishlist.includes(item.id)) {
                      addToWishlist(item.id);
                      toast.success('Added to wishlist');
                    } else {
                      removeFromWishlist(item.id);
                      toast.success('Removed from wishlist');
                    }
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    wishlist.includes(item.id)
                      ? 'bg-[#14F195] hover:bg-[#10C077] text-black'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  title={wishlist.includes(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart 
                    className={`h-5 w-5 ${wishlist.includes(item.id) ? 'fill-current' : ''}`} 
                  />
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>${totalUSD.toFixed(2)} USD</span>
            </div>
            {solPrice && (
              <div className="flex justify-between text-purple-400 font-bold">
                <span>Total in SOL</span>
                <span>{totalSOL.toFixed(3)} SOL</span>
              </div>
            )}
          </div>

          {userProfile.shippingAddress && (
            <div className="mb-4 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Shipping to:</span>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  Change
                </button>
              </div>
              <p className="text-sm text-gray-300">
                {userProfile.shippingAddress.first_name} {userProfile.shippingAddress.last_name}
              </p>
              <p className="text-sm text-gray-300">
                {userProfile.shippingAddress.city}, {userProfile.shippingAddress.state}
              </p>
              <div className="mt-2 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm text-gray-300">{userProfile.shippingAddress.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={handlePaymentClick}
            disabled={isProcessing || priceLoading || !publicKey}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Continue to Payment</span>
            )}
          </button>

          {!publicKey && (
            <p className="text-sm text-gray-400 mt-2 text-center">
              Please connect your wallet to continue
            </p>
          )}
        </div>
      </div>

      {/* Wishlist Section */}
      <div className="mt-12">
        <div className="bg-[#232328] rounded-lg p-6">
          <div className="flex items-center mb-6">
            <Heart className="h-6 w-6 text-[#14F195] mr-2" />
            <h2 className="text-2xl font-bold">Your Wishlist</h2>
          </div>

          {loadingWishlist ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading wishlist...</span>
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Your wishlist is empty</p>
              <a
                href="/shop"
                className="inline-flex items-center mt-4 text-[#14F195] hover:text-[#10C077] transition-colors"
              >
                Browse products
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#1B1B1F] rounded-lg overflow-hidden hover:shadow-lg hover:shadow-[#9945FF]/20 transition-all duration-300 border border-[#2D2D32]"
                >
                  <div className="relative group">
                    <img
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.title}
                      className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => {
                          removeFromWishlist(product.id);
                          toast.success('Removed from wishlist');
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
                    <p className="text-[#C8C8C8] text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-[#9945FF]">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;