import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

const EMAIL_BRIDGE_API = import.meta.env.VITE_EMAIL_BRIDGE_API || 'http://localhost:3001/api';
const REQUIRED_SOL = Number(import.meta.env.VITE_EMAIL_COST_SOL) || 0.001;

interface SendEmailParams {
  to: string;
  from: string;
  subject: string;
  content: string;
  senderWallet: string;
  signature?: string;
}

export const validateEmailAddress = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const calculateEmailCost = async (connection: Connection): Promise<number> => {
  try {
    const { data } = await axios.get(`${EMAIL_BRIDGE_API}/email-cost`);
    return data.cost;
  } catch (error) {
    return REQUIRED_SOL;
  }
};

export const sendEmailWeb2 = async (
  params: SendEmailParams,
  connection: Connection,
  signTransaction: (transaction: Transaction) => Promise<Transaction>
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate email address
    if (!validateEmailAddress(params.to)) {
      throw new Error('Invalid recipient email address');
    }

    // Check sender's balance
    const senderPubkey = new PublicKey(params.senderWallet);
    const balance = await connection.getBalance(senderPubkey);
    const requiredBalance = REQUIRED_SOL * LAMPORTS_PER_SOL;

    if (balance < requiredBalance) {
      throw new Error(`Insufficient balance. Required: ${REQUIRED_SOL} SOL`);
    }

    // Create a transaction for email sending fee
    const transaction = new Transaction().add(
      // Add your custom instruction for email sending fee
      // This is a placeholder - you'll need to implement the actual instruction
    );

    // Sign the transaction
    const signedTransaction = await signTransaction(transaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(signature);

    // Send email through bridge API
    const response = await axios.post(`${EMAIL_BRIDGE_API}/send-email`, {
      ...params,
      signature,
    });

    return {
      success: true,
      message: 'Email sent successfully to Web2 address',
    };

  } catch (error: any) {
    console.error('Error sending email:', error);
    return {
      success: false,
      message: error.message || 'Failed to send email',
    };
  }
};

export const getEmailHistory = async (walletAddress: string): Promise<any[]> => {
  try {
    const response = await axios.get(`${EMAIL_BRIDGE_API}/email-history/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching email history:', error);
    return [];
  }
};
