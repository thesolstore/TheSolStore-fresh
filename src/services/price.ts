import { useState, useEffect } from 'react';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export interface SolanaPrice {
  usd: number;
}

let cachedSolPrice: number | null = null;
let lastFetchTime: number | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute

export const getSolanaPrice = async (): Promise<number> => {
  const now = Date.now();
  
  // Return cached price if it's still valid
  if (cachedSolPrice && lastFetchTime && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedSolPrice;
  }

  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch SOL price');
    }
    
    const data = await response.json();
    
    if (!data.solana?.usd) {
      throw new Error('Invalid price data received');
    }
    
    cachedSolPrice = data.solana.usd;
    lastFetchTime = now;
    
    return cachedSolPrice;
  } catch (error) {
    console.error('Error fetching Solana price:', error);
    // Return last known price if available, otherwise throw error
    if (cachedSolPrice) return cachedSolPrice;
    throw error;
  }
};

export const convertUSDToSOL = (usdAmount: number, solPrice: number): number => {
  return Number((usdAmount / solPrice).toFixed(3));
};

export const useSOLPrice = () => {
  const [solPrice, setSOLPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPrice = async () => {
    try {
      setError(null);
      const price = await getSolanaPrice();
      setSOLPrice(price);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch SOL price');
      console.error('Error in useSOLPrice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    
    // Update price every minute
    const interval = setInterval(fetchPrice, CACHE_DURATION);
    
    return () => clearInterval(interval);
  }, []);

  return { 
    solPrice, 
    loading, 
    error,
    lastUpdated,
    refresh: fetchPrice // Expose refresh function to manually update price
  };
};
