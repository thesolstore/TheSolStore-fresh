import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

const STORE_WALLET = new PublicKey(import.meta.env.VITE_STORE_WALLET_ADDRESS);
const DINERO_TO_SOL_RATE = Number(import.meta.env.VITE_DINERO_TO_SOL_RATE);

export interface TransactionResult {
  success: boolean;
  signature?: string;
  error?: string;
}

export const createTransaction = async (
  amount: number,
  fromPubkey: PublicKey,
  connection: Connection
): Promise<Transaction> => {
  try {
    const lamports = Math.floor(amount * DINERO_TO_SOL_RATE * LAMPORTS_PER_SOL);
    
    // Check if user has enough balance
    const balance = await connection.getBalance(fromPubkey);
    if (balance < lamports) {
      throw new Error('Insufficient balance');
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey: STORE_WALLET,
        lamports,
      })
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.lastValidBlockHeight = lastValidBlockHeight;
    transaction.feePayer = fromPubkey;

    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

export const confirmTransaction = async (
  connection: Connection,
  signature: string
): Promise<TransactionResult> => {
  try {
    const confirmation = await connection.confirmTransaction(signature);
    if (confirmation.value.err) {
      return {
        success: false,
        error: 'Transaction failed',
        signature
      };
    }
    return {
      success: true,
      signature
    };
  } catch (error) {
    console.error('Error confirming transaction:', error);
    return {
      success: false,
      error: 'Failed to confirm transaction',
      signature
    };
  }
};

export const getWalletBalance = async (
  connection: Connection,
  publicKey: PublicKey
): Promise<number> => {
  try {
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
};