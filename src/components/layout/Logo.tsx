import React from 'react';
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <Link to="/" className="flex items-center">
      <div className="relative flex items-center justify-center w-12 h-12">
        {/* First S */}
        <div className="absolute transform -rotate-12 bg-gradient-to-br from-[#9945FF] to-[#14F195] text-3xl font-bold text-white rounded-lg w-8 h-8 flex items-center justify-center" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
          S
        </div>
        {/* Second S */}
        <div className="absolute transform rotate-12 bg-gradient-to-br from-[#14F195] to-[#9945FF] text-3xl font-bold text-white rounded-lg w-8 h-8 flex items-center justify-center ml-2" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}>
          S
        </div>
      </div>
    </Link>
  );
};

export default Logo;
