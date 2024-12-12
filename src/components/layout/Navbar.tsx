import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { ShoppingCart, User, Search, Settings, Package, LogOut, ChevronDown, Mail, Heart } from 'lucide-react';
import { useStore } from '../../store/useStore';
import Logo from './Logo';
import { SoundButton } from '../common/SoundButton';

// Mock data for shop items - replace with actual data later
const shopItems = [
  { id: 1, name: 'Solana T-Shirt', price: '25 DINERO', category: 'Clothing' },
  { id: 2, name: 'Crypto Hoodie', price: '50 DINERO', category: 'Clothing' },
  { id: 3, name: 'Blockchain Mug', price: '15 DINERO', category: 'Accessories' },
  { id: 4, name: 'NFT Cap', price: '20 DINERO', category: 'Accessories' },
  { id: 5, name: 'Web3 Stickers', price: '5 DINERO', category: 'Accessories' },
];

const Navbar: React.FC = () => {
  const { connected, disconnect } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = shopItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  const handleLogout = async () => {
    try {
      await disconnect();
      setIsProfileOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="bg-[#000000] shadow-lg">
      <div className="flex justify-between items-center h-14">
        {/* Logo and title on the left edge */}
        <Link to="/" className="flex items-center space-x-1 hover:opacity-80 transition-opacity pl-6">
          <Logo />
          <span className="text-white text-lg font-bold hover:text-[#14F195]">
            The Sol Store
          </span>
        </Link>

        {/* Navigation and wallet on the right */}
        <div className="flex items-center space-x-4 pr-6">
          {/* Search box with dropdown */}
          <div className="hidden md:block relative">
            <form onSubmit={handleSearch} className="flex items-center relative">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsSearchFocused(false), 200);
                }}
                className="bg-white text-gray-800 px-4 py-1.5 rounded-lg w-96 
                           border border-gray-200 focus:border-[#14F195] focus:outline-none
                           placeholder-gray-500 text-sm"
              />
              <SoundButton
                type="submit"
                className="absolute right-3 text-gray-400 hover:text-[#14F195] transition-colors"
                variant="ghost"
              >
                <Search className="h-4 w-4" />
              </SoundButton>
            </form>

            {/* Dropdown search results */}
            {isSearchFocused && (
              <div className="absolute mt-1 w-full bg-[#1B1B1F] border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/shop/item/${item.id}`}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A2F] 
                               hover:text-[#14F195] border-b border-gray-700 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="text-[#14F195]">{item.price}</span>
                      </div>
                      <span className="text-xs text-gray-500">{item.category}</span>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No items found
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <SoundButton
              as="link"
              to="/shop"
              className="text-gray-300 hover:text-[#14F195] text-sm"
              variant="ghost"
            >
              Shop
            </SoundButton>
            <SoundButton
              as="link"
              to="/solmail"
              className="text-gray-300 hover:text-[#14F195] text-sm flex items-center"
              title="SolMail"
              variant="ghost"
            >
              <Mail className="h-5 w-5" />
              <span className="ml-1 hidden lg:inline">SolMail</span>
            </SoundButton>
            <SoundButton
              as="link"
              to="/cart"
              className="text-gray-300 hover:text-[#14F195] text-sm flex items-center relative"
              title="Cart"
              variant="ghost"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-1 hidden lg:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </SoundButton>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <SoundButton
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-1 text-gray-300 hover:text-[#14F195] focus:outline-none"
                variant="ghost"
              >
                <User className="h-5 w-5" />
                <ChevronDown className="h-4 w-4" />
              </SoundButton>

              {/* Profile dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1B1B1F] border border-gray-700 
                              rounded-lg shadow-lg overflow-hidden z-50">
                  {connected ? (
                    <>
                      <SoundButton
                        as="link"
                        to="/profile"
                        className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A2F] 
                                 hover:text-[#14F195] border-b border-gray-700 text-left"
                        onClick={() => setIsProfileOpen(false)}
                        variant="ghost"
                      >
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </div>
                      </SoundButton>
                      <SoundButton
                        as="link"
                        to="/wishlist"
                        className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A2F] 
                                 hover:text-[#14F195] border-b border-gray-700 text-left"
                        onClick={() => setIsProfileOpen(false)}
                        variant="ghost"
                      >
                        <div className="flex items-center space-x-2">
                          <Heart className="h-4 w-4" />
                          <span>Wishlist</span>
                        </div>
                      </SoundButton>
                      <SoundButton
                        as="link"
                        to="/orders"
                        className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A2F] 
                                 hover:text-[#14F195] border-b border-gray-700 text-left"
                        onClick={() => setIsProfileOpen(false)}
                        variant="ghost"
                      >
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>Orders</span>
                        </div>
                      </SoundButton>
                      <SoundButton
                        as="link"
                        to="/settings"
                        className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A2F] 
                                 hover:text-[#14F195] border-b border-gray-700 text-left"
                        onClick={() => setIsProfileOpen(false)}
                        variant="ghost"
                      >
                        <div className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </div>
                      </SoundButton>
                      <SoundButton
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2A2A2F] 
                                 hover:text-[#14F195] text-left"
                        variant="ghost"
                      >
                        <div className="flex items-center space-x-2">
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </div>
                      </SoundButton>
                    </>
                  ) : (
                    <WalletMultiButton className="!bg-[#9945FF] hover:!bg-[#14F195] transition-colors duration-300" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;