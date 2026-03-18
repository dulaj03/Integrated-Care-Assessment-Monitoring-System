/**
 * Messaging UI Component
 * 
 * Chat interface for patient-professional communication
 */

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Message, Conversation, formatMessageTime, getOtherParticipant } from '../lib/mockMessages';

interface MessagingUIProps {
  conversation: Conversation;
  currentUserId: string;
  onSendMessage?: (message: string) => void;
}

export function MessagingUI({ conversation, currentUserId, onSendMessage }: MessagingUIProps) {
  const [messages, setMessages] = useState<Message[]>(conversation.messages);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get the other participant
  const otherParticipant = getOtherParticipant(conversation, currentUserId);

  // Determine if current user is a patient or professional
  const currentUserRole = conversation.participantIds[0] === currentUserId
    ? conversation.participantRoles[0]
    : conversation.participantRoles[1];

  // Get current user's name
  const currentUserName = conversation.participantIds[0] === currentUserId
    ? conversation.participantNames[0]
    : conversation.participantNames[1];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    setIsSending(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole as 'patient' | 'professional',
      content: inputValue,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
    setIsSending(false);

    // Call optional callback
    onSendMessage?.(inputValue);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 px-6 py-4 border-b border-blue-700">
        <div>
          <h2 className="text-lg font-semibold text-white">{otherParticipant.name}</h2>
          <p className="text-sm text-blue-100 capitalize">{otherParticipant.role}</p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.senderId === currentUserId;

            return (
              <div
                key={message.id}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg transition-all duration-200 ${isSender
                    ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${isSender
                      ? 'text-blue-100'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={isSending}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-ring duration-200 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="px-4 py-2 bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default MessagingUI;
