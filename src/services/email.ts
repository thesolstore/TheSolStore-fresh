import { CartItem } from '../store/useStore';
import { ShippingAddress } from '../components/ShippingAddressForm';

export interface ReceiptEmailData {
  orderNumber: string;
  items: CartItem[];
  totalUSD: number;
  totalSOL: number;
  shippingAddress: ShippingAddress;
  transactionSignature: string;
  timestamp: number;
}

export const sendReceiptEmail = async (email: string, data: ReceiptEmailData): Promise<boolean> => {
  try {
    // In a production environment, you would want to use a proper email service
    // like SendGrid, AWS SES, or similar. For now, we'll just mock the email sending.
    console.log('Sending receipt email to:', email);
    console.log('Receipt data:', data);

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return true to indicate success
    return true;
  } catch (error) {
    console.error('Failed to send receipt email:', error);
    return false;
  }
};
