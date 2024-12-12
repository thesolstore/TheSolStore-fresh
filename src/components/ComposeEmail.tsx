import { FC, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMailStore } from '../stores/useMailStore';
import { validateEmailAddress, sendEmailWeb2 } from '../services/emailBridge';
import toast from 'react-hot-toast';

export const ComposeEmail: FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { addEmail, setComposing } = useMailStore();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to || !subject || !content) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!publicKey) {
      toast.error('Please connect your wallet');
      return;
    }

    setSending(true);

    try {
      // Check if it's a Web2 email address
      const isWeb2Email = validateEmailAddress(to);

      if (isWeb2Email) {
        // Handle Web2 email sending
        const result = await sendEmailWeb2(
          {
            to,
            from: publicKey.toBase58(),
            subject,
            content,
            senderWallet: publicKey.toBase58(),
          },
          connection,
          signTransaction
        );

        if (result.success) {
          // Add to sent folder
          addEmail({
            to,
            from: publicKey.toBase58(),
            subject,
            content,
            folder: 'sent'
          });
          toast.success('Email sent successfully to Web2 address');
        } else {
          throw new Error(result.message);
        }
      } else {
        // Handle Web3 wallet address
        addEmail({
          to,
          from: publicKey.toBase58(),
          subject,
          content,
          folder: 'sent'
        });

        // Simulate receiving the email in the recipient's inbox
        addEmail({
          to: publicKey.toBase58(),
          from: to,
          subject,
          content,
          folder: 'inbox'
        });

        toast.success('Email sent successfully to wallet address');
      }

      setComposing(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1B1B1F] rounded-lg w-full max-w-2xl shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">New Message</h2>
          <button
            onClick={() => setComposing(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <label className="text-sm text-gray-400">To:</label>
              <div className="text-xs text-gray-500">
                (Enter email address or wallet address)
              </div>
            </div>
            <input
              type="text"
              placeholder="name@example.com or wallet address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-[#2A2A2F] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#14F195] focus:outline-none"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#2A2A2F] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#14F195] focus:outline-none"
            />
          </div>

          <div>
            <textarea
              placeholder="Write your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-[#2A2A2F] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#14F195] focus:outline-none resize-none"
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-400">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Sending emails to Web2 addresses requires a small SOL fee</span>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setComposing(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2 bg-[#14F195] text-gray-900 rounded-lg font-medium hover:bg-[#10C077] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
