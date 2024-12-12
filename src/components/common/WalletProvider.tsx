import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { Connection } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: ReactNode;
}

export const WalletProvider: FC<Props> = ({ children }) => {
  const endpoint = useMemo(() => {
    const rpcEndpoint = 'https://api.devnet.solana.com';
    return {
      endpoint: rpcEndpoint,
      config: {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000
      }
    };
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({
        network: 'testnet'
      })
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint.endpoint} config={endpoint.config}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};