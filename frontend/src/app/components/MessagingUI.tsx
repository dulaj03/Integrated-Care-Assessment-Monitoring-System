import { useState, useRef, useEffect } from 'react';
import { Send, User as UserIcon, Building2 } from 'lucide-react';
import { initSocket } from '../lib/socket';
import { toast } from 'sonner';

export interface Conversation {
  other_id: string | number;
  other_role: string;
  other_name?: string;
  message_text?: string;
  is_read?: boolean;
  is_incoming_unread?: boolean;
  created_at?: string;
  active?: boolean;
}

interface MessagingUIProps {
  conversation: Conversation;
  currentUserId: string | number;
  currentUserRole: string;
  onSendMessage?: (message: string) => void;
  onBack?: () => void;
}

export function MessagingUI({ conversation, currentUserId, currentUserRole, onSendMessage, onBack }: MessagingUIProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const token = sessionStorage.getItem('token');
    if (!token || !conversation) return;
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${conversation.other_role}/${conversation.other_id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Init socket
    const socket = initSocket(String(currentUserId), currentUserRole);

    // Listen for new messages
    const handleNewMessage = (newMessage: any) => {
      // Check if message belongs to current conversation
      if (
        (String(newMessage.sender_id) === String(conversation.other_id) && newMessage.sender_role === conversation.other_role) ||
        (String(newMessage.receiver_id) === String(conversation.other_id) && newMessage.receiver_role === conversation.other_role)
      ) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      }
    };

    socket?.on('new_message', handleNewMessage);

    return () => {
      socket?.off('new_message', handleNewMessage);
    };
  }, [conversation, currentUserId, currentUserRole]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setIsSending(true);
    const token = sessionStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: conversation.other_id,
          receiver_role: conversation.other_role,
          message_text: inputValue
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => {
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setInputValue('');
        onSendMessage?.(inputValue);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 md:gap-4">
        {onBack && (
          <button 
            onClick={onBack} 
            className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          conversation.other_role === 'hospital' ? 'bg-indigo-100 text-indigo-600' : 
          conversation.other_role === 'doctor' ? 'bg-purple-100 text-purple-600' :
          conversation.other_role === 'nurse' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {conversation.other_role === 'hospital' ? <Building2 className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white capitalize truncate">
              {conversation.other_name || `${conversation.other_role} #${conversation.other_id}`}
            </h2>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest ${
              conversation.other_role === 'hospital' ? 'bg-indigo-100 text-indigo-700' :
              conversation.other_role === 'doctor' ? 'bg-purple-100 text-purple-700' :
              conversation.other_role === 'nurse' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {conversation.other_role}
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Connected</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/30"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
             <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Send className="h-6 w-6 text-slate-300 dark:text-slate-600" />
             </div>
             <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Start a Conversation</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your messages are encrypted and secure.</p>
             </div>
          </div>
        ) : (
          messages.map((message, idx) => {
            const isSender = String(message.sender_id) === String(currentUserId);

            return (
              <div
                key={message.id || idx}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200 ${isSender
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700/50 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{message.message_text}</p>
                  <p
                    className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${isSender
                      ? 'text-blue-100'
                      : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {formatMessageTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-slate-900 p-4 border-t border-slate-100 dark:border-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Write a message..."
            disabled={isSending}
            className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 transition-all duration-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="h-10 w-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 disabled:opacity-50 active:scale-95"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default MessagingUI;

