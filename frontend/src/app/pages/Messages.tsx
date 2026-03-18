import { useState } from 'react';
import { MessagingUI } from '../components/MessagingUI';
import { MOCK_CONVERSATIONS, Conversation } from '../lib/mockMessages';
import { ScrollArea } from '../components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';

interface MessagesPageProps {
  userRole: 'patient' | 'professional';
  userId: string;
}

export function Messages({ userRole, userId }: MessagesPageProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(
    MOCK_CONVERSATIONS[0]
  );

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
    // This will be connected to real API in Phase 4
  };

  return (
    <div className="flex h-full gap-0 bg-white dark:bg-slate-900">
      {/* Conversation List Sidebar */}
      <div className="w-full sm:w-1/3 md:w-1/4 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Messages
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {MOCK_CONVERSATIONS.length} conversation{MOCK_CONVERSATIONS.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-3">
            {MOCK_CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`
                  w-full p-3 rounded-lg text-left transition-all duration-200
                  ${selectedConversation.id === conv.id
                ? 'bg-blue-100 dark:bg-blue-900/30 shadow-md'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }
                `}
              >
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate text-sm">
                      {conv.participantNames[1]}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate line-clamp-1">
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area - Hidden on mobile, visible on tablet+ */}
      <div className="hidden sm:flex flex-1 flex-col">
        <MessagingUI
          conversation={selectedConversation}
          currentUserId={userId}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Mobile View - Show chat on small screens */}
      <div className="flex sm:hidden w-full flex-col">
        <MessagingUI
          conversation={selectedConversation}
          currentUserId={userId}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}

export default Messages;
