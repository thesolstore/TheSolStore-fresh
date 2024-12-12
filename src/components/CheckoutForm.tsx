import { FC, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createTransaction, confirmTransaction } from '../services/solana';
import { useStore } from '../store/useStore';
import { Loader2 } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export const CheckoutForm: FC<Props> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const { cart, clearCart } = useStore();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !signTransaction) return;

    setLoading(true);
    setError(null);

    try {
      const transaction = await createTransaction(total, publicKey, connection);
      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      const confirmed = await confirmTransaction(connection, signature);
      
      if (confirmed) {
        clearCart();
        onSuccess();
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during payment. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="text-center">
        <p className="mb-4">Connect your wallet to complete the purchase</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
        <div className="flex justify-between mb-4">
          <span>Total Amount</span>
          <span>{total} DINERO ({total * 0.1} SOL)</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>Wallet</span>
          <span className="text-sm">{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-20 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 py-3 rounded-lg flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Processing Payment...
          </>
        ) : (
          'Pay with Solana'
        )}
      </button>
    </form>
  );
};