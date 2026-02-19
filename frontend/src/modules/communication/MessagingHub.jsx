/**
 * Messaging Hub Component
 * Secure internal messaging system between patients and healthcare providers
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import './MessagingHub.css';

const MessagingHub = () => {
  const { t } = useI18n();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    // Mock contacts data
    setContacts([
      {
        id: 1,
        name: 'Dr. Silva',
        role: 'Doctor',
        avatar: 'DS',
        lastMessage: 'Take your medication on time',
        timestamp: '2 hours ago',
        unread: 2,
      },
      {
        id: 2,
        name: 'Nurse Perera',
        role: 'Nurse',
        avatar: 'NP',
        lastMessage: 'Your next appointment is on Friday',
        timestamp: '5 hours ago',
        unread: 0,
      },
      {
        id: 3,
        name: 'Lab Services',
        role: 'Lab',
        avatar: 'LS',
        lastMessage: 'Your test results are ready',
        timestamp: '1 day ago',
        unread: 0,
      },
    ]);
  }, []);

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    // Mock messages
    setMessages([
      {
        id: 1,
        sender: 'Dr. Silva',
        content: 'Hello! How are you feeling today?',
        timestamp: '10:30 AM',
        isSent: false,
      },
      {
        id: 2,
        sender: 'You',
        content: 'I am feeling better, thanks for asking.',
        timestamp: '10:35 AM',
        isSent: true,
      },
      {
        id: 3,
        sender: 'Dr. Silva',
        content: 'Make sure to take your Aspirin daily.',
        timestamp: '10:40 AM',
        isSent: false,
      },
    ]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'You',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isSent: true,
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
  };

  return (
    <div className="messaging-hub">
      <div className="messaging-container">
        <div className="contacts-panel">
          <h2>{t('communication.messages')}</h2>
          <div className="contacts-search">
            <input
              type="text"
              placeholder={t('common.search') || 'Search contacts...'}
              className="search-input"
            />
          </div>

          <div className="contacts-list">
            {contacts.length === 0 ? (
              <p className="no-contacts">{t('communication.noMessages')}</p>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                  onClick={() => handleSelectContact(contact)}
                >
                  <div className="contact-avatar">{contact.avatar}</div>
                  <div className="contact-info">
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-role">{contact.role}</div>
                    <div className="contact-last-message">{contact.lastMessage}</div>
                  </div>
                  <div className="contact-meta">
                    <span className="contact-time">{contact.timestamp}</span>
                    {contact.unread > 0 && (
                      <span className="unread-badge">{contact.unread}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-panel">
          {selectedContact ? (
            <>
              <div className="chat-header">
                <div className="chat-contact-info">
                  <div className="chat-avatar">{selectedContact.avatar}</div>
                  <div>
                    <h3>{selectedContact.name}</h3>
                    <p>{selectedContact.role}</p>
                  </div>
                </div>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <p className="no-messages">{t('communication.selectContact')}</p>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${message.isSent ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">{message.content}</div>
                      <div className="message-timestamp">{message.timestamp}</div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={t('communication.type')}
                  className="chat-input"
                />
                <button type="submit" className="btn-send">
                  📤 Send
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty">
              <p>{t('communication.selectContact')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingHub;
