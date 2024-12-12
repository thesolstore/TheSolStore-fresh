import axios from 'axios';
import { PrintifyOrder } from '../utils/cn';

const api = axios.create({
  baseURL: 'http://localhost:3005',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export interface PrintifyVariant {
  id: string;
  price: number;
  title: string;
  is_enabled: boolean;
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: string[];
  variants: PrintifyVariant[];
  price: number;  // This will be the lowest variant price
  variantPrices: { [key: string]: number }; // Map of variant ID to price
}

export interface PrintifyOrder {
  id: string;
  status: string;
  shipping_address: any;
  line_items: any[];
  total_price: number;
  created_at: string;
}

export interface PrintifyOrderAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  email: string;
  phone: string;
}

export interface PrintifyOrderItem {
  product_id: string;
  quantity: number;
  variant_id: string;
}

const getProductPrice = (variants: any[]): { price: number; variantPrices: { [key: string]: number } } => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return { price: 29.99, variantPrices: {} };
  }

  const variantPrices: { [key: string]: number } = {};
  let lowestPrice = Infinity;

  variants.forEach(variant => {
    if (variant.is_enabled && typeof variant.price === 'number') {
      // Convert cents to dollars
      const priceInDollars = variant.price / 100;
      variantPrices[variant.id] = priceInDollars;
      if (priceInDollars < lowestPrice) {
        lowestPrice = priceInDollars;
      }
    }
  });

  return {
    price: lowestPrice === Infinity ? 29.99 : lowestPrice,
    variantPrices
  };
};

// Cache for products
let productsCache: {
  data: PrintifyProduct[] | null;
  timestamp: number;
  expiryTime: number;
} = {
  data: null,
  timestamp: 0,
  expiryTime: 5 * 60 * 1000 // 5 minutes
};

export const getProducts = async (): Promise<PrintifyProduct[]> => {
  // Check if we have valid cached data
  const now = Date.now();
  if (productsCache.data && (now - productsCache.timestamp) < productsCache.expiryTime) {
    return productsCache.data;
  }

  try {
    const shopId = import.meta.env.VITE_SHOP_ID;
    if (!shopId) {
      console.error('Shop ID not found in environment variables');
      throw new Error('Missing shop ID configuration');
    }

    console.log('Fetching products for shop:', shopId);
    const response = await api.get(`/api/printify/shops/${shopId}/products.json`);
    
    if (!response.data) {
      console.warn('No products found in response');
      return [];
    }

    // Handle both array and object responses
    const products = Array.isArray(response.data) ? response.data : response.data.data || [];

    // Transform and fetch detailed prices for each product
    const detailedProducts = await Promise.all(
      products.map(async (product: any) => {
        try {
          // Fetch detailed product info to get accurate pricing
          const details = await getProductDetails(product.id);
          const { price, variantPrices } = getProductPrice(details.variants);

          return {
            id: product.id,
            title: product.title,
            description: product.description || 'Awesome crypto merch!',
            images: product.images?.map((img: any) => img.src) || [],
            variants: details.variants || [],
            price,
            variantPrices
          };
        } catch (error) {
          console.error(`Error fetching details for product ${product.id}:`, error);
          const { price, variantPrices } = getProductPrice(product.variants);
          
          return {
            id: product.id,
            title: product.title,
            description: product.description || 'Awesome crypto merch!',
            images: product.images?.map((img: any) => img.src) || [],
            variants: product.variants || [],
            price,
            variantPrices
          };
        }
      })
    );

    // Update cache
    productsCache = {
      data: detailedProducts,
      timestamp: now,
      expiryTime: 5 * 60 * 1000
    };

    return detailedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch products');
  }
};

export const getProductDetails = async (productId: string): Promise<PrintifyProduct> => {
  try {
    const shopId = import.meta.env.VITE_SHOP_ID;
    if (!shopId) {
      console.error('Shop ID not found in environment variables');
      throw new Error('Missing shop ID configuration');
    }

    const response = await api.get(`/api/printify/shops/${shopId}/products/${productId}.json`);
    const product = response.data;
    const { price, variantPrices } = getProductPrice(product.variants);

    return {
      id: product.id,
      title: product.title,
      description: product.description || 'Awesome crypto merch!',
      images: product.images?.map((img: any) => img.src) || [],
      variants: product.variants || [],
      price,
      variantPrices
    };
  } catch (error) {
    console.error(`Error fetching product details for ${productId}:`, error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch product details');
  }
};

export const createOrder = async (
  productId: string,
  variantId: string,
  quantity: number,
  shippingAddress: any
): Promise<PrintifyOrder> => {
  try {
    const shopId = import.meta.env.VITE_SHOP_ID;
    if (!shopId) {
      console.error('Shop ID not found in environment variables');
      throw new Error('Missing shop ID configuration');
    }

    const response = await api.post(`/api/printify/shops/${shopId}/orders.json`, {
      external_id: `order_${Date.now()}`,
      line_items: [{
        product_id: productId,
        variant_id: variantId,
        quantity
      }],
      shipping_address: shippingAddress
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrder = async (orderId: string): Promise<PrintifyOrder> => {
  try {
    const shopId = import.meta.env.VITE_SHOP_ID;
    if (!shopId) {
      console.error('Shop ID not found in environment variables');
      throw new Error('Missing shop ID configuration');
    }

    const response = await api.get(`/api/printify/shops/${shopId}/orders/${orderId}.json`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const calculateShipping = async (
  productId: string,
  variantId: string,
  address: any
): Promise<number> => {
  try {
    const shopId = import.meta.env.VITE_SHOP_ID;
    if (!shopId) {
      console.error('Shop ID not found in environment variables');
      throw new Error('Missing shop ID configuration');
    }

    const response = await api.post(`/api/printify/shops/${shopId}/orders/shipping.json`, {
      line_items: [{
        product_id: productId,
        variant_id: variantId,
        quantity: 1
      }],
      address
    });
    return response.data.shipping_cost;
  } catch (error) {
    console.error('Error calculating shipping:', error);
    throw error;
  }
};

export const submitOrder = async (order: PrintifyOrder): Promise<any> => {
  try {
    const shopId = import.meta.env.VITE_SHOP_ID;
    const response = await fetch(`/api/printify/shops/${shopId}/orders.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...order,
        shipping_method: 1, // Standard shipping
        send_shipping_notification: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  } catch (error) {
    console.error('Error submitting order to Printify:', error);
    throw error;
  }
};

export interface PrintifyAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;  
  country: string;  
  zip: string;
  phone: string;
  email: string;
}

export interface PrintifyCustomer {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country_code: string;
  country_name: string;
  region?: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyOrderInput {
  external_id?: string;
  label?: string;
  line_items: Array<{
    product_id: string;
    variant_id: number;
    quantity: number;
  }>;
  shipping_method?: number;
  shipping_address: PrintifyAddress;
  address_to: PrintifyAddress;
  send_shipping_notification?: boolean;
  customer: PrintifyCustomer;
}

export const getCountryCode = (countryName: string): string => {
  const countryMap: { [key: string]: string } = {
    'United States': 'US',
    'United States of America': 'US',
    'USA': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'Australia': 'AU',
    'New Zealand': 'NZ',
    'Germany': 'DE',
    'France': 'FR',
    'Italy': 'IT',
    'Spain': 'ES',
    'Netherlands': 'NL',
    'Belgium': 'BE',
    'Switzerland': 'CH',
    'Austria': 'AT',
    'Sweden': 'SE',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Ireland': 'IE',
    'Portugal': 'PT',
  };
  return countryMap[countryName] || countryName;
};

export const createPrintifyOrder = async (orderInput: PrintifyOrderInput): Promise<PrintifyOrder> => {
  try {
    const shopId = import.meta.env.VITE_SHOP_ID;
    if (!shopId) {
      throw new Error('Shop ID not found in environment variables');
    }

    // Create the complete address with all fields at once
    const addressPayload = {
      first_name: orderInput.shipping_address.first_name,
      last_name: orderInput.shipping_address.last_name,
      address1: orderInput.shipping_address.address1,
      address2: orderInput.shipping_address.address2 || '',
      city: orderInput.shipping_address.city,
      state: getStateCode(orderInput.shipping_address.state),
      country: 'US',
      zip: orderInput.shipping_address.zip,
      phone: orderInput.shipping_address.phone || '',
      email: orderInput.shipping_address.email
    };

    // Create the order with complete address
    const orderPayload = {
      external_id: `order_${Date.now()}`,
      line_items: orderInput.line_items,
      shipping_method: orderInput.shipping_method,
      shipping_address: addressPayload,
      address_to: addressPayload,
      send_shipping_notification: true
    };

    // Log the order payload for debugging
    console.log('Sending order payload:', JSON.stringify(orderPayload, null, 2));

    // Make a single API call with the complete order data
    const response = await api.post(`/api/printify/shops/${shopId}/orders.json`, orderPayload);

    if (!response.data) {
      throw new Error('No order data received from Printify');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error creating Printify order:', error);
    throw new Error(error.response?.data?.message || 'Error communicating with Printify');
  }
};

// Helper function to get state code
export const getStateCode = (stateName: string): string => {
  // If the input is already a 2-letter state code, return it directly
  if (/^[A-Z]{2}$/.test(stateName)) {
    return stateName;
  }

  const stateMap: { [key: string]: string } = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY'
  };

  // Try to convert full state name to state code
  const stateCode = stateMap[stateName];
  
  if (stateCode) {
    return stateCode;
  }

  // If no match found, return the original input
  console.warn(`No state code found for: ${stateName}`);
  return stateName;
};