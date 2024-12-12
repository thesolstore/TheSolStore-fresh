import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Mail, Send, Inbox, Star, Trash2 } from 'lucide-react';
import { useMailStore } from '../stores/useMailStore';
import { ComposeEmail } from '../components/ComposeEmail';
import { EmailView } from '../components/EmailView';

const SolMail: FC = () => {
  const { connected } = useWallet();
  const {
    emails,
    selectedEmail,
    composing,
    setSelectedEmail,
    setComposing,
    markAsRead,
    toggleStar,
  } = useMailStore();

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox },
    { id: 'sent', name: 'Sent', icon: Send },
    { id: 'starred', name: 'Starred', icon: Star },
    { id: 'trash', name: 'Trash', icon: Trash2 },
  ];

  const [selectedFolder, setSelectedFolder] = useState('inbox');

  const filteredEmails = emails.filter((email) => {
    if (selectedFolder === 'starred') {
      return email.starred;
    }
    return email.folder === selectedFolder;
  });

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-[#1B1B1F]">
        <Mail className="w-16 h-16 text-[#9945FF] mb-4" />
        <h1 className="text-2xl font-bold text-white mb-4">Welcome to SolMail</h1>
        <p className="text-gray-400 mb-6">Connect your wallet to access your decentralized mailbox</p>
        <WalletMultiButton className="!bg-[#9945FF] hover:!bg-[#7C37CC]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-[#1B1B1F]">
      {/* Sidebar */}
      <div className="w-64 bg-[#000000] p-4">
        <button
          onClick={() => setComposing(true)}
          className="w-full bg-[#14F195] text-gray-900 rounded-lg py-2 px-4 font-medium hover:bg-[#10C077] transition-colors mb-6"
        >
          Compose
        </button>

        <nav>
          {folders.map((folder) => {
            const Icon = folder.icon;
            const emailCount = folder.id === 'starred'
              ? emails.filter(e => e.starred).length
              : emails.filter(e => e.folder === folder.id).length;
            
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg mb-1 transition-colors ${
                  selectedFolder === folder.id
                    ? 'bg-[#2A2A2F] text-[#14F195]'
                    : 'text-gray-300 hover:bg-[#2A2A2F] hover:text-[#14F195]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5" />
                  <span>{folder.name}</span>
                </div>
                {emailCount > 0 && (
                  <span className="bg-[#14F195] text-gray-900 px-2 py-0.5 text-xs rounded-full">
                    {emailCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {selectedEmail ? (
          <EmailView email={selectedEmail} />
        ) : (
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">
              {folders.find(f => f.id === selectedFolder)?.name}
            </h2>

            {/* Email list */}
            <div className="space-y-2">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => {
                    setSelectedEmail(email);
                    markAsRead(email.id);
                  }}
                  className={`flex items-center space-x-4 p-4 rounded-lg cursor-pointer
                            ${email.read ? 'bg-[#1B1B1F]' : 'bg-[#2A2A2F]'}
                            hover:bg-[#2A2A2F] transition-colors`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(email.id);
                    }}
                    className="text-gray-400 hover:text-yellow-500 transition-colors"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        email.starred ? 'text-yellow-500 fill-current' : ''
                      }`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium truncate">
                        {selectedFolder === 'sent' ? email.to : email.from}
                      </p>
                      <span className="text-gray-400 text-sm">
                        {new Date(email.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${email.read ? 'text-gray-400' : 'text-white'}`}>
                      {email.subject}
                    </p>
                  </div>
                </div>
              ))}

              {filteredEmails.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-400">No emails in this folder</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {composing && <ComposeEmail />}
    </div>
  );
};

export default SolMail;
