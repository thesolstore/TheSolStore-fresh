import { FC } from 'react';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMailStore } from '../stores/useMailStore';
import { Email } from '../stores/useMailStore';

interface EmailViewProps {
  email: Email;
}

export const EmailView: FC<EmailViewProps> = ({ email }) => {
  const { setSelectedEmail, toggleStar, moveToTrash } = useMailStore();

  const handleBack = () => {
    setSelectedEmail(null);
  };

  const handleStar = () => {
    toggleStar(email.id);
  };

  const handleDelete = () => {
    moveToTrash(email.id);
  };

  return (
    <div className="h-full flex flex-col bg-[#1B1B1F] rounded-lg overflow-hidden">
      {/* Email header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleStar}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
            >
              <Star
                className={`h-5 w-5 ${
                  email.starred ? 'text-yellow-500 fill-current' : ''
                }`}
              />
            </button>
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">{email.subject}</h1>

        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-white">
              From: <span className="text-gray-400">{email.from}</span>
            </p>
            <p className="text-white">
              To: <span className="text-gray-400">{email.to}</span>
            </p>
          </div>
          <span className="text-gray-400">
            {formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Email content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="prose prose-invert max-w-none">
          {email.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-gray-300 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
