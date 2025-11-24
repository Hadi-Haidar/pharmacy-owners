// src/pages/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Image as ImageIcon, X, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot, limit as firestoreLimit } from 'firebase/firestore';

const Chat = () => {
  const { owner } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Real-time conversations listener
  useEffect(() => {
    if (!owner?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Set a timeout to stop loading if query takes too long (prevents infinite spinner)
    const loadingTimeout = setTimeout(() => {
      console.warn('Loading timeout - Firestore query may need indexes');
      setLoading(false);
      setConversations([]);
    }, 5000); // 5 seconds max
    
    let unsubscribe = null;
    
    try {
      // Query without orderBy to avoid requiring Firestore composite indexes
      const q = query(
        collection(db, 'conversations'),
        where('pharmacyOwnerId', '==', owner.id),
        where('status', '==', 'active'),
        firestoreLimit(100)
      );
      
      unsubscribe = onSnapshot(
        q, 
        (snapshot) => {
          clearTimeout(loadingTimeout);
          
          const convs = [];
          snapshot.forEach((doc) => {
            convs.push({ id: doc.id, ...doc.data() });
          });
          
          // Sort by most recent message (done in JavaScript to avoid index requirement)
          convs.sort((a, b) => {
            const aTime = a.lastMessageAt?.toDate?.() || new Date(a.lastMessageAt);
            const bTime = b.lastMessageAt?.toDate?.() || new Date(b.lastMessageAt);
            return bTime - aTime;
          });
          
          setConversations(convs);
          setLoading(false);
        }, 
        (error) => {
          clearTimeout(loadingTimeout);
          console.error('Error loading conversations:', error.code, error.message);
          
          // Show user-friendly error messages
          if (error.code === 'permission-denied') {
            console.error('Firestore permission denied - check security rules');
          } else if (error.code === 'failed-precondition') {
            console.error('Firestore index required - check console for index creation link');
          }
          
          setLoading(false);
          setConversations([]);
        }
      );
    } catch (error) {
      clearTimeout(loadingTimeout);
      console.error('Exception setting up Firestore listener:', error);
      setLoading(false);
      setConversations([]);
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (unsubscribe) unsubscribe();
    };
  }, [owner?.id]);

  // Real-time messages listener
  useEffect(() => {
    if (!selectedConversation?.id) return;

    // Query without orderBy to avoid requiring Firestore composite indexes
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', selectedConversation.id),
      firestoreLimit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
        });
      });
      
      // Sort by oldest first (done in JavaScript to avoid index requirement)
      msgs.sort((a, b) => {
        const aTime = a.createdAt || new Date(0);
        const bTime = b.createdAt || new Date(0);
        return aTime - bTime;
      });
      
      setMessages(msgs);

      // Mark as read when opening conversation
      if (selectedConversation.unreadCountPharmacyOwner > 0) {
        chatService.markAsRead(selectedConversation.id, owner.id).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [selectedConversation?.id, owner?.id]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() && !selectedImage) {
      return;
    }

    if (!selectedConversation) {
      alert('Please select a conversation');
      return;
    }

    setSending(true);

    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        setUploading(true);
        imageUrl = await chatService.uploadImage(selectedImage);
        setUploading(false);
      }

      // Send message
      await chatService.sendMessage(
        selectedConversation.id,
        owner.id,
        owner.name,
        messageText.trim(),
        imageUrl
      );

      // Clear input
      setMessageText('');
      removeImage();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for conversation
  const formatConversationDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const msgDate = date.toDate ? date.toDate() : new Date(date);
    
    if (now.toDateString() === msgDate.toDateString()) {
      return formatTime(msgDate);
    }
    return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-gray-50">
      {/* Conversations Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-indigo-600" />
            Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {conv.userId?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div>User {conv.userId?.substring(0, 8)}...</div>
                      <div className="text-xs text-gray-500 font-normal">
                        {formatConversationDate(conv.lastMessageAt)}
                      </div>
                    </div>
                  </div>
                  {conv.unreadCountPharmacyOwner > 0 && (
                    <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-1 font-semibold">
                      {conv.unreadCountPharmacyOwner}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conv.lastMessageType === 'image' ? '📷 Image' : conv.lastMessage || 'No messages yet'}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {selectedConversation.userId?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    User {selectedConversation.userId?.substring(0, 12)}...
                  </h3>
                  <p className="text-sm text-gray-500">Active conversation</p>
                </div>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'pharmacy-owner' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        msg.senderType === 'pharmacy-owner'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.content && <p className="whitespace-pre-wrap break-words">{msg.content}</p>}
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Attachment"
                          className="mt-2 rounded-lg max-w-full cursor-pointer hover:opacity-90"
                          onClick={() => window.open(msg.imageUrl, '_blank')}
                        />
                      )}
                      <p className={`text-xs mt-1 ${msg.senderType === 'pharmacy-owner' ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200">
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-3 relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                  <button
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || sending}
                  className="p-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <ImageIcon className="w-6 h-6" />
                </button>
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={uploading || sending}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!messageText.trim() && !selectedImage) || uploading || sending}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading || sending ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  {uploading ? 'Uploading...' : sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

