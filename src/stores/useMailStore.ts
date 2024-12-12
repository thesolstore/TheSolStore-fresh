import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent' | 'starred' | 'trash';
}

interface MailStore {
  emails: Email[];
  selectedEmail: Email | null;
  composing: boolean;
  addEmail: (email: Omit<Email, 'id' | 'timestamp' | 'read' | 'starred'>) => void;
  deleteEmail: (id: string) => void;
  markAsRead: (id: string) => void;
  toggleStar: (id: string) => void;
  moveToTrash: (id: string) => void;
  setSelectedEmail: (email: Email | null) => void;
  setComposing: (composing: boolean) => void;
}

export const useMailStore = create<MailStore>()(
  persist(
    (set) => ({
      emails: [
        {
          id: '1',
          from: 'team@solstore.com',
          to: '',
          subject: 'Welcome to SolMail!',
          content: `Welcome to SolMail - your decentralized email platform on Solana!

We're excited to have you join our community. With SolMail, you can:
- Send and receive messages securely
- Star important emails
- Organize your communications
- Connect with other Solana users

Start exploring by composing your first message or checking your inbox.

Best regards,
The Sol Store Team`,
          timestamp: new Date(),
          read: false,
          starred: false,
          folder: 'inbox'
        }
      ],
      selectedEmail: null,
      composing: false,
      addEmail: (email) =>
        set((state) => ({
          emails: [
            ...state.emails,
            {
              ...email,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date(),
              read: false,
              starred: false,
            },
          ],
        })),
      deleteEmail: (id) =>
        set((state) => ({
          emails: state.emails.filter((email) => email.id !== id),
          selectedEmail: state.selectedEmail?.id === id ? null : state.selectedEmail,
        })),
      markAsRead: (id) =>
        set((state) => ({
          emails: state.emails.map((email) =>
            email.id === id ? { ...email, read: true } : email
          ),
        })),
      toggleStar: (id) =>
        set((state) => ({
          emails: state.emails.map((email) =>
            email.id === id ? { ...email, starred: !email.starred } : email
          ),
        })),
      moveToTrash: (id) =>
        set((state) => ({
          emails: state.emails.map((email) =>
            email.id === id ? { ...email, folder: 'trash' } : email
          ),
          selectedEmail: state.selectedEmail?.id === id ? null : state.selectedEmail,
        })),
      setSelectedEmail: (email) => set({ selectedEmail: email }),
      setComposing: (composing) => set({ composing }),
    }),
    {
      name: 'solmail-storage',
    }
  )
);
