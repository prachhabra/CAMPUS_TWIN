import React, { useEffect, useState, useRef } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import Card from '../components/Card';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import {
  MessageCircle,
  Send,
  Search,
  User,
  Users,
  Circle,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { getInitials, formatDateTime } from '../utils/helpers';

const StudentChat = () => {
  const { user } = useAuth();
  const { socket, onlineUsers = [] } = useSocket();
  const { showError } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [contacts, setContacts] = useState([]);
  const [searchContact, setSearchContact] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await chatService.getConversations();
      if (res.success) {
        setConversations(res.data || []);
        if (res.data?.length > 0 && !activeConversation) {
          selectConversation(res.data[0]);
        }
      }
    } catch (err) {
      showError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket listener for new messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = ({ message, conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
      fetchConversations();
    };

    const handleMessageSent = ({ message, conversationId }) => {
      if (activeConversation?._id === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
      fetchConversations();
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [socket, activeConversation]);

  const selectConversation = async (conv) => {
    setActiveConversation(conv);
    try {
      setLoadingMessages(true);
      const res = await chatService.getMessages(conv._id);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const otherParticipant = activeConversation.participants.find(
      (p) => p._id !== user._id
    );

    if (!otherParticipant) return;

    const messageText = inputText.trim();
    setInputText('');

    if (socket && socket.connected) {
      socket.emit('send_message', {
        recipientId: otherParticipant._id,
        conversationId: activeConversation._id,
        text: messageText
      });
    } else {
      // Fallback to REST
      try {
        const res = await chatService.sendMessage({
          recipientId: otherParticipant._id,
          text: messageText
        });
        if (res.success) {
          setMessages((prev) => [...prev, res.message]);
          fetchConversations();
        }
      } catch (err) {
        showError('Message failed to send');
      }
    }
  };

  const handleOpenContacts = async () => {
    try {
      const res = await chatService.getContacts({ q: searchContact });
      if (res.success) {
        setContacts(res.data || []);
        setShowContactsModal(true);
      }
    } catch (err) {
      showError('Failed to fetch campus contacts');
    }
  };

  const handleStartChatWithContact = (contactUser) => {
    setShowContactsModal(false);
    // Find existing conversation with this user
    const existing = conversations.find((c) =>
      c.participants.some((p) => p._id === contactUser._id)
    );

    if (existing) {
      selectConversation(existing);
    } else {
      // Create provisional conversation UI
      const mockConv = {
        _id: 'temp-' + Date.now(),
        participants: [user, contactUser],
        lastMessage: null
      };
      setConversations((prev) => [mockConv, ...prev]);
      setActiveConversation(mockConv);
      setMessages([]);
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find((p) => p._id !== user?._id) || conv.participants[0];
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="page-header" style={{ marginBottom: 8 }}>
        <div>
          <h2 className="page-title">
            <MessageCircle size={24} color="var(--primary)" /> Campus Messenger
          </h2>
          <p className="page-subtitle">
            Direct real-time communication with peers, group members, and faculty
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenContacts}>
          <Users size={18} /> New Message / Contacts
        </button>
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '320px 1fr',
            height: '620px',
            backgroundColor: '#FFFFFF'
          }}
        >
          {/* Left: Conversations List */}
          <div
            style={{
              borderRight: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'var(--surface-alt)'
            }}
          >
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>
                Conversations
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <Loader message="Loading chats..." />
              ) : conversations.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
                  No messages yet. Click "New Message" above to chat with classmates or professors.
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = activeConversation?._id === conv._id;
                  const online = other ? isUserOnline(other._id) : false;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => selectConversation(conv)}
                      style={{
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                        borderLeft: isSelected ? '4px solid var(--accent)' : '4px solid transparent',
                        borderBottom: '1px solid #f1f3f7',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        {other?.profileImage ? (
                          <img
                            src={other.profileImage}
                            alt={other.name}
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem'
                            }}
                          >
                            {getInitials(other?.name)}
                          </div>
                        )}
                        {online && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: 'var(--success)',
                              border: '2px solid #fff'
                            }}
                          />
                        )}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              color: 'var(--text)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {other?.name || 'User'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                            {other?.role}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: 2
                          }}
                        >
                          {conv.lastMessage?.text || 'Tap to chat'}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Active Chat Area */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {activeConversation ? (
              <>
                {/* Chat Top Header */}
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem'
                      }}
                    >
                      {getInitials(getOtherParticipant(activeConversation)?.name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text)' }}>
                        {getOtherParticipant(activeConversation)?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {getOtherParticipant(activeConversation)?.department} •{' '}
                        {isUserOnline(getOtherParticipant(activeConversation)?._id) ? (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active Online</span>
                        ) : (
                          'Offline'
                        )}
                      </div>
                    </div>
                  </div>

                  <StatusBadge status={getOtherParticipant(activeConversation)?.role} />
                </div>

                {/* Messages Body */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px',
                    backgroundColor: '#FAFCFE',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12
                  }}
                >
                  {loadingMessages ? (
                    <Loader message="Loading message history..." />
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--muted)', fontSize: '0.875rem' }}>
                      Send the first message to start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = (msg.sender?._id || msg.sender)?.toString() === user?._id?.toString();

                      return (
                        <div
                          key={msg._id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '70%'
                          }}
                        >
                          <div
                            style={{
                              padding: '10px 16px',
                              borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                              backgroundColor: isMe ? 'var(--primary)' : '#FFFFFF',
                              color: isMe ? '#FFFFFF' : 'var(--text)',
                              boxShadow: 'var(--shadow-xs)',
                              border: isMe ? 'none' : '1px solid var(--border)',
                              fontSize: '0.875rem',
                              lineHeight: 1.4,
                              wordBreak: 'break-word'
                            }}
                          >
                            {msg.text}
                          </div>
                          <div
                            style={{
                              fontSize: '0.6875rem',
                              color: 'var(--muted)',
                              marginTop: 4,
                              textAlign: isMe ? 'right' : 'left',
                              padding: '0 4px'
                            }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Field Form */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: 12,
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!inputText.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--muted)',
                  gap: 10
                }}
              >
                <MessageCircle size={48} color="var(--border)" />
                <div style={{ fontWeight: 600 }}>Select a conversation to start chatting</div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Campus Contacts Directory Modal */}
      {showContactsModal && (
        <div className="modal-overlay" onClick={() => setShowContactsModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Campus Directory</h3>
              <button onClick={() => setShowContactsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-input"
                placeholder="Search students or faculty by name or department..."
                value={searchContact}
                onChange={(e) => {
                  setSearchContact(e.target.value);
                  chatService.getContacts({ q: e.target.value }).then((res) => {
                    if (res.success) setContacts(res.data || []);
                  });
                }}
                style={{ marginBottom: 14 }}
              />

              <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {contacts.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>
                    No matching campus contacts found.
                  </div>
                ) : (
                  contacts.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => handleStartChatWithContact(c)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        border: '1px solid var(--border)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--background)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary)',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.8125rem'
                          }}
                        >
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            {c.department} • {c.rollNumber || c.employeeId || c.role}
                          </div>
                        </div>
                      </div>
                      <StatusBadge status={c.role} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentChat;
