import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

// Debug log to check API key
const apiKey = process.env.PRINTIFY_API_KEY;
console.log('Environment variables loaded:', {
  hasApiKey: !!apiKey,
  apiKeyLength: apiKey?.length,
  firstFewChars: apiKey?.substring(0, 20) + '...'
});

// Proxy endpoint for Printify API
app.use('/api/printify', async (req, res) => {
  const apiKey = process.env.PRINTIFY_API_KEY;
  
  if (!apiKey) {
    console.error('API Key not found in environment variables');
    return res.status(500).json({ message: 'Server configuration error: Missing API key' });
  }

  try {
    const printifyUrl = `https://api.printify.com/v1${req.path}`;
    
    // Special handling for order creation
    if (req.path.includes('/orders.json') && req.method === 'POST') {
      // Ensure shipping address is properly structured
      const { shipping_address } = req.body;
      
      // Log the incoming shipping address
      console.log('Incoming shipping address:', shipping_address);
      
      // Create a properly structured order payload
      const orderPayload = {
        ...req.body,
        shipping_address: {
          first_name: shipping_address.first_name,
          last_name: shipping_address.last_name,
          address1: shipping_address.address1,
          address2: shipping_address.address2 || '',
          city: shipping_address.city,
          state: shipping_address.state,
          country: 'US',
          zip: shipping_address.zip,
          phone: shipping_address.phone || '',
          email: shipping_address.email
        },
        address_to: {
          first_name: shipping_address.first_name,
          last_name: shipping_address.last_name,
          address1: shipping_address.address1,
          address2: shipping_address.address2 || '',
          city: shipping_address.city,
          state: shipping_address.state,
          country: 'US',
          zip: shipping_address.zip,
          phone: shipping_address.phone || '',
          email: shipping_address.email
        }
      };

      // Log the final payload being sent to Printify
      console.log('Sending order payload to Printify:', orderPayload);

      const response = await axios({
        method: 'POST',
        url: printifyUrl,
        data: orderPayload,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return res.status(response.status).json(response.data);
    }

    // Handle all other requests
    const response = await axios({
      method: req.method,
      url: printifyUrl,
      data: req.method !== 'GET' ? req.body : undefined,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying request to Printify:', error.response?.data || error.message);
    
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      message: 'Error communicating with Printify',
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running on port ${port}`);
});
