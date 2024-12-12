import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, ChevronRight, DollarSign } from 'lucide-react';

// Mock data for order history - replace with actual data from your backend
const mockOrders = [
  {
    id: '1',
    date: '2024-01-15',
    status: 'Delivered',
    items: [
      { name: 'Solana T-Shirt', quantity: 2, price: '25 DINERO' },
      { name: 'Web3 Stickers', quantity: 1, price: '5 DINERO' }
    ],
    total: '55 DINERO',
    transactionId: '5D3c...8Fq2'
  },
  {
    id: '2',
    date: '2024-01-10',
    status: 'Processing',
    items: [
      { name: 'Crypto Hoodie', quantity: 1, price: '50 DINERO' }
    ],
    total: '50 DINERO',
    transactionId: '7H9x...2Wp4'
  },
  {
    id: '3',
    date: '2024-01-05',
    status: 'Delivered',
    items: [
      { name: 'Blockchain Mug', quantity: 3, price: '15 DINERO' },
      { name: 'NFT Cap', quantity: 1, price: '20 DINERO' }
    ],
    total: '65 DINERO',
    transactionId: '3B7y...9Lm5'
  }
];

const Orders: React.FC = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();

  // Redirect if wallet is not connected
  React.useEffect(() => {
    if (!connected) {
      navigate('/');
    }
  }, [connected, navigate]);

  if (!connected) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-[#14F195]';
      case 'processing':
        return 'text-[#9945FF]';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#1B1B1F] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Package className="h-6 w-6 text-[#9945FF] mr-3" />
          <h1 className="text-2xl font-bold">Order History</h1>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div
              key={order.id}
              className="bg-[#2A2A2F] rounded-lg p-4 hover:bg-[#32323A] transition-colors"
            >
              {/* Order Header */}
              <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-400">{order.date}</span>
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Order #{order.id}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-300">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-[#14F195]">{item.price}</div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-400">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Transaction: {order.transactionId}
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-medium text-[#14F195] mr-2">
                    {order.total}
                  </span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {mockOrders.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
