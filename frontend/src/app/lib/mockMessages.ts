/**
 * Mock Message Data
 * 
 * Sample conversation data for messaging UI component
 */

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'professional';
  content: string;
  timestamp: string;
  isRead?: boolean;
}

export interface Conversation {
  id: string;
  participantIds: [string, string]; // [patient_id, professional_id]
  participantNames: [string, string];
  participantRoles: ['patient', 'professional'];
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: string;
}

// Mock conversations between patients and doctors/nurses
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participantIds: ['p1', 'd1'],
    participantNames: ['Nimal Jayasinghe', 'Dr. Sarah Perera'],
    participantRoles: ['patient', 'professional'],
    messages: [
      {
        id: 'msg-1',
        senderId: 'p1',
        senderName: 'Nimal Jayasinghe',
        senderRole: 'patient',
        content: "Hi Dr. Perera, I've been experiencing some dizziness lately",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-2',
        senderId: 'd1',
        senderName: 'Dr. Sarah Perera',
        senderRole: 'professional',
        content: 'Hello Nimal! When did this start? Does it occur at specific times?',
        timestamp: new Date(Date.now() - 3300000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-3',
        senderId: 'p1',
        senderName: 'Nimal Jayasinghe',
        senderRole: 'patient',
        content: 'It started about 3 days ago, mostly in the mornings after I wake up',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-4',
        senderId: 'd1',
        senderName: 'Dr. Sarah Perera',
        senderRole: 'professional',
        content: 'I see. Have you noticed any changes in your blood pressure recently? Can you check and log it?',
        timestamp: new Date(Date.now() - 2700000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-5',
        senderId: 'p1',
        senderName: 'Nimal Jayasinghe',
        senderRole: 'patient',
        content: 'Yes, I just checked - it was 125/82. The dizziness seems to correlate with higher BP',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-6',
        senderId: 'd1',
        senderName: 'Dr. Sarah Perera',
        senderRole: 'professional',
        content: "That's helpful information. Please continue monitoring and log readings twice daily. Let's discuss this at your appointment.",
        timestamp: new Date(Date.now() - 2100000).toISOString(),
        isRead: false,
      },
    ],
    lastMessage: "That's helpful information. Please continue monitoring...",
    lastMessageTime: new Date(Date.now() - 2100000).toISOString(),
  },
  {
    id: 'conv-2',
    participantIds: ['p2', 'n1'],
    participantNames: ['Sarah Johnson', 'Nurse Anjali'],
    participantRoles: ['patient', 'professional'],
    messages: [
      {
        id: 'msg-7',
        senderId: 'p2',
        senderName: 'Sarah Johnson',
        senderRole: 'patient',
        content: 'Hi Nurse Anjali, when is my next appointment?',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-8',
        senderId: 'n1',
        senderName: 'Nurse Anjali',
        senderRole: 'professional',
        content: 'Hi Sarah! Your next appointment is scheduled for next Tuesday at 2:00 PM',
        timestamp: new Date(Date.now() - 6900000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-9',
        senderId: 'p2',
        senderName: 'Sarah Johnson',
        senderRole: 'patient',
        content: 'Perfect, thank you! Do I need to bring anything?',
        timestamp: new Date(Date.now() - 6600000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-10',
        senderId: 'n1',
        senderName: 'Nurse Anjali',
        senderRole: 'professional',
        content: 'Please bring your ID and insurance card. Also, bring your recent blood pressure readings if you have them.',
        timestamp: new Date(Date.now() - 6300000).toISOString(),
        isRead: true,
      },
    ],
    lastMessage: 'Please bring your ID and insurance card...',
    lastMessageTime: new Date(Date.now() - 6300000).toISOString(),
  },
  {
    id: 'conv-3',
    participantIds: ['p3', 'd2'],
    participantNames: ['Michael Brown', 'Dr. Kamal Silva'],
    participantRoles: ['patient', 'professional'],
    messages: [
      {
        id: 'msg-11',
        senderId: 'd2',
        senderName: 'Dr. Kamal Silva',
        senderRole: 'professional',
        content: 'Michael, I reviewed your recent lab results',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-12',
        senderId: 'p3',
        senderName: 'Michael Brown',
        senderRole: 'patient',
        content: 'Great! How do they look?',
        timestamp: new Date(Date.now() - 10500000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-13',
        senderId: 'd2',
        senderName: 'Dr. Kamal Silva',
        senderRole: 'professional',
        content: 'All results are within normal range. Keep up with your current exercise and diet routine!',
        timestamp: new Date(Date.now() - 10200000).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-14',
        senderId: 'p3',
        senderName: 'Michael Brown',
        senderRole: 'patient',
        content: 'Excellent news! Thank you doctor 😊',
        timestamp: new Date(Date.now() - 9900000).toISOString(),
        isRead: true,
      },
    ],
    lastMessage: 'Excellent news! Thank you doctor 😊',
    lastMessageTime: new Date(Date.now() - 9900000).toISOString(),
  },
];

/**
 * Format timestamp for display
 * Shows time like "2:30 PM" or "Yesterday 3:45 PM"
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    // Less than 1 hour - show time only
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffInHours < 24) {
    // Same day - show time only
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } else if (diffInHours < 48) {
    // Yesterday
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  } else {
    // More than 2 days - show date and time
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
};

/**
 * Get the other participant in a conversation
 */
export const getOtherParticipant = (conversation: Conversation, currentUserId: string) => {
  const otherIndex = conversation.participantIds[0] === currentUserId ? 1 : 0;
  return {
    id: conversation.participantIds[otherIndex],
    name: conversation.participantNames[otherIndex],
    role: conversation.participantRoles[otherIndex],
  };
};
