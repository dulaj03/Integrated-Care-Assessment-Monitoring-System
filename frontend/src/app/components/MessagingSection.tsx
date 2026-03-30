import { useState, useEffect } from 'react';
import { MessagingUI, Conversation } from './MessagingUI';
import { MessageSquare, Search, Building2, User, Loader2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { initSocket } from '../lib/socket';

export function MessagingSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [availableContacts, setAvailableContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const userId = sessionStorage.getItem('userId');
  const userRole = sessionStorage.getItem('userRole') || 'patient';

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
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableContacts = async () => {
    setLoadingContacts(true);
    const token = sessionStorage.getItem('token');
    try {
      let url = '';
      if (userRole === 'patient') {
        url = 'http://localhost:5000/api/hospitals'; // Patients can message any hospital
      } else if (userRole === 'hospital') {
        url = `http://localhost:5000/api/hospitals/${userId}/patients`;
      } else if (userRole === 'doctor' || userRole === 'nurse') {
        url = `http://localhost:5000/api/${userRole}/patients`;
      }

      if (url) {
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAvailableContacts(data);
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Listen for new messages to update the list
    const socket = initSocket(String(userId), userRole);
    socket?.on('new_message', () => {
      fetchConversations();
    });

    return () => {
      socket?.off('new_message');
    };
  }, [userId, userRole]);

  const handleStartNewChat = (contact: any) => {
    // Create a temporary conversation object
    const newConv: Conversation = {
      other_id: contact.id,
      other_role: userRole === 'patient' ? 'hospital' : 'patient',
      other_name: contact.name || contact.full_name,
    };

    // Check if conversation already exists in list
    const existing = conversations.find(c => String(c.other_id) === String(newConv.other_id) && c.other_role === newConv.other_role);
    if (existing) {
      setSelectedConversation(existing);
    } else {
      setSelectedConversation(newConv);
    }
    
    setIsNewChatModalOpen(false);
  };

  const filteredConversations = conversations.filter(c => 
    (c.other_name || `${c.other_role} #${c.other_id}`).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 h-[600px] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Messages</h3>
            <button 
              onClick={() => {
                setIsNewChatModalOpen(true);
                fetchAvailableContacts();
              }}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No conversations found</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={`${conv.other_id}_${conv.other_role}`}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${
                  selectedConversation?.other_id === conv.other_id && selectedConversation?.other_role === conv.other_role
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`h-12 w-12 rounded-full flex-shrink-0 flex items-center justify-center ${
                  conv.other_role === 'hospital' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {conv.other_role === 'hospital' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {conv.other_name || `${conv.other_role} #${conv.other_id}`}
                    </h4>
                    {!conv.is_read && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {conv.last_message || 'New conversation'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-slate-50 dark:bg-slate-950/50">
        {selectedConversation ? (
          <MessagingUI
            conversation={selectedConversation}
            currentUserId={userId || ''}
            currentUserRole={userRole}
            onSendMessage={fetchConversations}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Messages</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Select a conversation from the list or start a new one to communicate with hospitals or patients.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
        {isNewChatModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {userRole === 'patient' ? 'Message a Hospital' : 'Message a Patient'}
                </h3>
                <button onClick={() => setIsNewChatModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="h-6 w-6 text-slate-400" />
                </button>
              </div>
              
              <div className="p-4 max-h-[400px] overflow-y-auto">
                {loadingContacts ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  </div>
                ) : availableContacts.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <p>No contacts available for messaging.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableContacts.map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => handleStartNewChat(contact)}
                        className="w-full p-4 flex items-center gap-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                      >
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          {userRole === 'patient' ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{contact.name || contact.full_name}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[200px]">
                            {contact.address || `${contact.condition || 'Status'} · ${contact.status || 'Active'}`}
                          </p>
                        </div>
                        <Plus className="ml-auto h-5 w-5 text-slate-300" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

