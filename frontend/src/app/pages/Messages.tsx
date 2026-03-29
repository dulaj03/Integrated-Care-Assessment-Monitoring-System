import { useState, useEffect } from 'react';
import { MessagingUI } from '../components/MessagingUI';
import { ScrollArea } from '../components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';

export function Messages() {
  const userId = sessionStorage.getItem('userId') || 'p1';
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = () => {
    fetchConversations();
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
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-3">
            {conversations.map((conv) => (
              <button
                key={`${conv.other_id}-${conv.other_role}`}
                onClick={() => setSelectedConversation(conv)}
                className={`
                  w-full p-3 rounded-lg text-left transition-all duration-200
                  ${selectedConversation?.other_id === conv.other_id ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold">
                    {(conv.other_role || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate text-sm capitalize">
                      {conv.other_role}: {conv.other_id}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {conv.message_text}
                    </p>
                  </div>
                  {!conv.is_read && <div className="h-2 w-2 rounded-full bg-blue-600" />}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="hidden sm:flex flex-1 flex-col">
        {selectedConversation ? (
          <MessagingUI
            conversation={selectedConversation}
            currentUserId={userId}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <MessageCircle className="h-16 w-16 mb-4 opacity-10" />
            <p className="text-lg font-medium">No conversation selected</p>
            <p className="text-sm">Select a contact from the list to start chatting.</p>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div className="flex sm:hidden w-full flex-col">
        {selectedConversation && (
          <MessagingUI
            conversation={selectedConversation}
            currentUserId={userId}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}

export default Messages;
