import React, { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { FaTwitter, FaDiscord, FaTelegram } from 'react-icons/fa';
import { getProducts, PrintifyProduct } from '../services/printify';
import JupiterSwap from '../components/JupiterSwap';
import Whitepaper from '../components/Whitepaper';
import { useSound } from '../hooks/useSound';
import { SoundButton } from '../components/common/SoundButton';

const Home: FC = () => {
  const { connected, publicKey, disconnect } = useWallet();
  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { playHoverSound } = useSound();

  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts.slice(0, 6)); // Only show first 6 products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url("/assets/background.webp")',
        backgroundColor: 'rgba(17, 24, 39, 0.95)', // dark overlay
        backgroundBlendMode: 'overlay',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 pt-5 pb-12 relative z-10">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex justify-center space-x-4 mb-6">
            <SoundButton
              onClick={(e) => {
                e.preventDefault();
                window.open('https://x.com/thesolstore', '_blank');
              }}
              className="relative group animate-bounce hover:animate-none p-2 bg-white hover:bg-black rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
              variant="ghost"
              style={{ animationDelay: '0s' }}
            >
              <div className="relative">
                <FaTwitter 
                  size={24} 
                  className="text-black group-hover:text-white transition-colors" 
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-[#000000] to-[#1DA1F2] rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              </div>
            </SoundButton>
            <SoundButton
              onClick={(e) => {
                e.preventDefault();
                window.open('https://discord.gg/thesolstore', '_blank');
              }}
              className="relative group animate-bounce hover:animate-none p-2 bg-white hover:bg-[#5865F2] rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
              variant="ghost"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="relative">
                <FaDiscord 
                  size={24} 
                  className="text-[#5865F2] group-hover:text-white transition-colors" 
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-[#5865F2] to-[#7289DA] rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              </div>
            </SoundButton>
            <SoundButton
              onClick={(e) => {
                e.preventDefault();
                window.open('https://t.me/thesolstore', '_blank');
              }}
              className="relative group animate-bounce hover:animate-none p-2 bg-white hover:bg-[#0088cc] rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
              variant="ghost"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="relative">
                <FaTelegram 
                  size={24} 
                  className="text-[#0088cc] group-hover:text-white transition-colors" 
                />
                <div className="absolute -inset-2 bg-gradient-to-r from-[#0088cc] to-[#229ED9] rounded-full blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              </div>
            </SoundButton>
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-extrabold 
                bg-clip-text text-transparent 
                bg-gradient-to-r from-[#9945FF] to-[#14F195] 
                animate-solanaShimmer
                bg-[length:200%_auto]
                leading-tight
                relative
                z-10
              ">
                Welcome to The Sol Store
                <div className="absolute -inset-1 bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 blur-lg -z-10"></div>
              </h1>
              
              <div className="mt-2 relative">
                <p className="text-lg md:text-xl text-white/90
                  font-medium
                  tracking-wide
                  px-4
                  py-1
                  rounded-full
                  bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10
                  border border-[#9945FF]/20
                  backdrop-blur-sm
                ">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#9945FF] to-[#14F195]">
                    Your Crypto Merch Destination
                  </span>
                  <span className="mx-2 text-[#14F195]">|</span>
                  <span className="text-[#9945FF]">Powered by Dinero</span>
                </p>
                <div className="absolute -inset-1 bg-gradient-to-r from-[#9945FF]/10 to-[#14F195]/10 blur-md -z-10 rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Link to="/shop">
                <SoundButton variant="ghost" className="!p-0 relative group mr-4">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#14F195]/20 to-[#9945FF]/20 blur group-hover:blur-md transition-all rounded-lg"></div>
                  <span className="relative bg-gradient-to-r from-[#14F195] to-[#9945FF] hover:from-[#9945FF] hover:to-[#14F195] transition-all duration-300 text-white font-bold py-2.5 px-8 rounded-lg text-base flex items-center">
                    Shop Now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </SoundButton>
              </Link>
              <SoundButton variant="ghost" className="!p-0 relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 blur group-hover:blur-md transition-all rounded-lg"></div>
                <WalletMultiButton className="relative !bg-[#9945FF] hover:!bg-[#14F195] transition-all duration-300 text-white font-bold py-2.5 px-5 rounded-lg text-base" />
              </SoundButton>
              {connected && (
                <SoundButton
                  onClick={() => disconnect()}
                  className="relative group"
                  variant="ghost"
                >
                  <div className="absolute -inset-1 bg-red-500/20 blur group-hover:blur-md transition-all rounded-lg"></div>
                  <span className="relative bg-red-500 hover:bg-red-600 transition-colors duration-300 text-white font-bold py-2.5 px-5 rounded-lg text-base block">
                    Disconnect
                  </span>
                </SoundButton>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12">
          <Link 
            to="/shop" 
            className="md:col-span-4 bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border-2 border-[#9945FF] hover:border-[#14F195] transition-colors h-[700px] group hover:bg-gray-800/90"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="group-hover:translate-x-1 transition-transform flex items-center space-x-2 text-2xl font-bold text-[#14F195] group-hover:text-[#9945FF] transition-colors">
                <span>Crypto Merch</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </div>
            </div>
            <div className="h-[620px] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-gray-900/50 rounded-lg p-2 hover:bg-gray-900/70 transition-colors group/item"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-2">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-32 object-cover group-hover/item:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-700 flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                      {product.images && product.images.length > 1 && (
                        <div className="absolute bottom-2 left-2 flex space-x-1">
                          {product.images.slice(0, 3).map((img, index) => (
                            <div 
                              key={index} 
                              className="w-6 h-6 bg-white/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/75"
                            >
                              {index + 1}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1 truncate">{product.title}</h3>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-300 text-sm">${product.price.toFixed(2)}</p>
                      <SoundButton className="bg-[#14F195] text-black px-2 py-1 rounded-md text-xs hover:bg-[#9945FF] transition-colors">
                        Add to Cart
                      </SoundButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          <div className="md:col-span-4 h-[700px] relative overflow-hidden rounded-lg border-2 border-[#9945FF] hover:border-[#14F195] transition-colors">
            <img
              src="/assets/DNERO.jpeg"
              alt="DNERO Official Currency"
              className="absolute inset-0 w-full h-full object-contain bg-gray-800/80 backdrop-blur-sm p-2"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 text-center z-10">
              <p className="text-white text-lg font-semibold">
                Much Currency. Very Official. Such Store. 🚀💸
              </p>
            </div>
          </div>

          <div className="md:col-span-4 bg-gray-800/80 backdrop-blur-sm p-6 rounded-lg border-2 border-[#9945FF] hover:border-[#14F195] transition-colors h-[700px]">
            <h3 className="text-xl font-bold mb-4 text-[#14F195]">Jupiter Swap</h3>
            <div className="h-[620px] overflow-hidden">
              <JupiterSwap />
            </div>
          </div>
        </div>

        {/* Whitepaper Component */}
        <Whitepaper />

        {selectedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={closeModal}>
            <img src={selectedImage} alt="Full Size Meme" className="max-w-full max-h-full rounded-lg object-contain" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;