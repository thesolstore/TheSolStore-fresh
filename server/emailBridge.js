require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { Connection, PublicKey } = require('@solana/web3.js');

const app = express();
app.use(cors());
app.use(express.json());

// Configure email transporter (replace with your SMTP settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Solana connection
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Email cost endpoint
app.get('/api/email-cost', (req, res) => {
  res.json({ cost: process.env.EMAIL_COST_SOL || 0.001 });
});

// Send email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, from, subject, content, signature, senderWallet } = req.body;

    // Verify the transaction signature
    const tx = await connection.getTransaction(signature);
    if (!tx) {
      throw new Error('Invalid transaction signature');
    }

    // Send the email using nodemailer
    await transporter.sendMail({
      from: `"${from}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: content,
      html: content.replace(/\n/g, '<br>'),
    });

    // Store the email in history (you might want to use a database)
    // This is just a placeholder
    console.log('Email sent:', {
      to,
      from,
      subject,
      timestamp: new Date(),
      txSignature: signature,
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    });
  }
});

// Get email history endpoint
app.get('/api/email-history/:walletAddress', (req, res) => {
  // This is a placeholder - implement actual database queries
  res.json([]);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email bridge server running on port ${PORT}`);
});
