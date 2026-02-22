/**
 * Messaging UI - Usage Examples
 */

import { useState } from 'react';
import { MessagingUI } from './MessagingUI';
import { MOCK_CONVERSATIONS } from '../lib/mockMessages';

/**
 * Example 1: Basic Patient-Doctor Conversation
 */
export const Example1_PatientDoctorChat = () => {
  const conversation = MOCK_CONVERSATIONS[0]; // Nimal & Dr. Perera

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Patient-Doctor Chat</h2>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl" style={{ height: '600px' }}>
        <MessagingUI
          conversation={conversation}
          currentUserId="p1" // Viewing as patient
        />
      </div>
    </div>
  );
};

/**
 * Example 2: Patient-Nurse Conversation
 */
export const Example2_PatientNurseChat = () => {
  const conversation = MOCK_CONVERSATIONS[1]; // Sarah & Nurse Anjali

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Patient-Nurse Chat</h2>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl" style={{ height: '600px' }}>
        <MessagingUI
          conversation={conversation}
          currentUserId="p2" // Viewing as patient
        />
      </div>
    </div>
  );
};

/**
 * Example 3: Same Chat from Professional Perspective
 */
export const Example3_ProfessionalPerspective = () => {
  const conversation = MOCK_CONVERSATIONS[0]; // Nimal & Dr. Perera

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Chat from Doctor's Perspective</h2>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl" style={{ height: '600px' }}>
        <MessagingUI
          conversation={conversation}
          currentUserId="d1" // Viewing as doctor (messages flip)
        />
      </div>
    </div>
  );
};

/**
 * Example 4: Interactive Chat with Message Sending
 */
export const Example4_InteractiveChat = () => {
  const conversation = MOCK_CONVERSATIONS[2]; // Michael & Dr. Kamal

  const handleSendMessage = (message: string) => {
    console.log('Message sent:', message);
  };

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        Interactive Chat
        <span className="text-sm text-slate-500 dark:text-slate-400 font-normal">(Try sending a message)</span>
      </h2>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl" style={{ height: '600px' }}>
        <MessagingUI
          conversation={conversation}
          currentUserId="p3" // Viewing as patient Michael
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
};

/**
 * Example 5: Conversation List with Chat Selection
 */
export const Example5_ConversationList = () => {
  const [selectedConvId, setSelectedConvId] = useState(MOCK_CONVERSATIONS[0].id);
  const [userRole, setUserRole] = useState<'patient' | 'professional'>('patient');

  const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConvId);
  const currentUserId = userRole === 'patient'
    ? selectedConversation?.participantIds[0]
    : selectedConversation?.participantIds[1];

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Conversations</h2>
        <button
          onClick={() => setUserRole(userRole === 'patient' ? 'professional' : 'patient')}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Switch to {userRole === 'patient' ? 'Professional' : 'Patient'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-96">
        {/* Conversation List */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl overflow-hidden flex flex-col">
          <div className="border-b border-slate-200 dark:border-slate-800 p-4 font-semibold text-slate-900 dark:text-white">
            {userRole === 'patient' ? 'My Doctors' : 'My Patients'}
          </div>
          <div className="overflow-y-auto flex-1">
            {MOCK_CONVERSATIONS.map(conv => {
              const isSelected = conv.id === selectedConvId;
              const otherIndex = userRole === 'patient' ? 1 : 0;
              const otherName = conv.participantNames[otherIndex];
              const unreadCount = conv.messages.filter(m => !m.isRead && m.senderId !== (userRole === 'patient' ? conv.participantIds[0] : conv.participantIds[1])).length;

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-4 border-b border-slate-200 dark:border-slate-800 transition-colors ${isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-slate-900 dark:text-white">{otherName}</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {conv.lastMessage}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation && currentUserId && (
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl overflow-hidden flex flex-col">
            <MessagingUI
              conversation={selectedConversation}
              currentUserId={currentUserId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Example 6: Mobile-Optimized Chat
 */
export const Example6_MobileOptimized = () => {
  const conversation = MOCK_CONVERSATIONS[0];

  return (
    <div className="h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h1>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <MessagingUI
          conversation={conversation}
          currentUserId="p1"
        />
      </div>
    </div>
  );
};

/**
 * Example 7: Empty Conversation State
 */
export const Example7_EmptyConversation = () => {
  // Create a conversation with no messages
  const emptyConversation = {
    id: 'empty-conv',
    participantIds: ['p-new', 'd-new'] as [string, string],
    participantNames: ['New Patient', 'Dr. New'] as [string, string],
    participantRoles: ['patient', 'professional'] as ['patient', 'professional'],
    messages: [],
  };

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">New Conversation (Empty State)</h2>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl" style={{ height: '600px' }}>
        <MessagingUI
          conversation={emptyConversation}
          currentUserId="p-new"
        />
      </div>
    </div>
  );
};

/**
 * Example 8: Conversation with Many Messages
 */
export const Example8_LongConversation = () => {
  // Create a conversation with many messages
  const longConversation = {
    ...MOCK_CONVERSATIONS[0],
    messages: Array(30).fill(null).map((_, i) => ({
      ...MOCK_CONVERSATIONS[0].messages[i % MOCK_CONVERSATIONS[0].messages.length],
      id: `long-msg-${i}`,
      timestamp: new Date(Date.now() - i * 300000).toISOString(),
    })),
  };

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Long Conversation (Scroll Test)</h2>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow dark:shadow-xl" style={{ height: '600px' }}>
        <MessagingUI
          conversation={longConversation}
          currentUserId="p1"
        />
      </div>
    </div>
  );
};
