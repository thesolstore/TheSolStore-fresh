import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { MapPin, Copy, ExternalLink, Edit2, Plus, Clock, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '../store/useStore';
import { ShippingAddressForm } from '../components/shop/ShippingAddressForm';

const Profile: FC = () => {
  const { publicKey } = useWallet();
  const { orders, userProfile, setShippingAddress } = useStore();
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard!');
  };

  const handleAddressSubmit = (address: any) => {
    setShippingAddress(address);
    setIsEditingAddress(false);
    toast.success('Shipping address saved successfully!');
  };

  if (!publicKey) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">
            Connect your wallet to view your profile and order history
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Wallet Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Wallet Details</h2>
          <div className="flex flex-col space-y-2">
            <label className="text-gray-400">Wallet Address</label>
            <div className="flex items-center space-x-2">
              <code className="bg-gray-900 px-4 py-2 rounded-lg flex-1">
                {publicKey.toBase58()}
              </code>
              <button
                onClick={() => copyAddress(publicKey.toBase58())}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Copy address"
              >
                <Copy className="h-5 w-5" />
              </button>
              <a
                href={`https://explorer.solana.com/address/${publicKey.toBase58()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="View on Solana Explorer"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Shipping Address</h2>
            {userProfile.shippingAddress && !isEditingAddress && (
              <button
                onClick={() => setIsEditingAddress(true)}
                className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Edit2 className="h-5 w-5" />
                <span>Edit Address</span>
              </button>
            )}
          </div>

          {isEditingAddress ? (
            <ShippingAddressForm
              onSubmit={handleAddressSubmit}
              defaultAddress={userProfile.shippingAddress}
            />
          ) : userProfile.shippingAddress ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400">Name</label>
                  <p className="font-medium">
                    {userProfile.shippingAddress.firstName} {userProfile.shippingAddress.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Email</label>
                  <p className="font-medium">{userProfile.shippingAddress.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Phone</label>
                  <p className="font-medium">{userProfile.shippingAddress.phone}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400">Country</label>
                  <p className="font-medium">{userProfile.shippingAddress.country}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400">Address</label>
                <p className="font-medium">
                  {userProfile.shippingAddress.address1}
                  {userProfile.shippingAddress.address2 && (
                    <>, {userProfile.shippingAddress.address2}</>
                  )}
                </p>
                <p className="font-medium">
                  {userProfile.shippingAddress.city}, {userProfile.shippingAddress.state}{' '}
                  {userProfile.shippingAddress.zipCode}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No shipping address saved yet</p>
              <button
                onClick={() => setIsEditingAddress(true)}
                className="flex items-center space-x-2 mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add Shipping Address</span>
              </button>
            </div>
          )}
        </div>

        {/* Order History Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Order History</h2>
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-700/50 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Order #{order.id.slice(0, 8)}...
                      </h3>
                      <p className="text-sm text-gray-400">
                        <Clock className="inline-block h-4 w-4 mr-1" />
                        {new Date(order.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <a
                      href={`https://solscan.io/tx/${order.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 flex items-center"
                    >
                      View Transaction
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 bg-gray-800/50 p-3 rounded-lg"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-600">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Total USD</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-purple-400">
                      <span>Total SOL</span>
                      <span>{order.solAmount.toFixed(3)} SOL</span>
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

export default Profile;