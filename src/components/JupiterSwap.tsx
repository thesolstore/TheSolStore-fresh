import { FC, useEffect, useState, useRef } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface JupiterSwapProps {
  className?: string;
}

const JupiterSwap: FC<JupiterSwapProps> = ({ className }) => {
  const { publicKey, connected } = useWallet();
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset iframe when wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      // Reload iframe with new wallet connection
      setIframeKey(prev => prev + 1);
    }
  }, [connected, publicKey]);

  // Construct Jupiter URL with proper parameters
  const jupiterUrl = new URL('https://jup.ag/swap');
  if (connected && publicKey) {
    jupiterUrl.searchParams.set('userPublicKey', publicKey.toString());
    jupiterUrl.searchParams.set('autoConnect', 'true');
  }
  jupiterUrl.searchParams.set('platform', 'solstore');

  return (
    <div className={`${className} relative w-full h-[600px]`}>
      <iframe
        ref={iframeRef}
        key={iframeKey}
        src={jupiterUrl.toString()}
        frameBorder="0"
        width="100%"
        height="100%"
        style={{
          borderRadius: '12px',
          border: 'none'
        }}
        allow="clipboard-write; clipboard-read"
      />
    </div>
  );
};

export default JupiterSwap;
