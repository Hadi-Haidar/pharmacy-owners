// src/services/chatService.js
import api from './api';

class ChatService {
  /**
   * Get all conversations for the pharmacy owner
   */
  async getConversations(pharmacyOwnerId) {
    const response = await api.get(`/chat/conversations/pharmacy-owner/${pharmacyOwnerId}`);
    return response.data;
  }

  /**
   * Get a specific conversation
   */
  async getConversation(conversationId) {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId, limit = 50, lastMessageId = null) {
    const params = { limit };
    if (lastMessageId) {
      params.lastMessageId = lastMessageId;
    }
    const response = await api.get(`/chat/conversations/${conversationId}/messages`, { params });
    return response.data;
  }

  /**
   * Send a text message
   */
  async sendMessage(conversationId, senderId, senderName, content, imageUrl = null) {
    const response = await api.post('/chat/messages', {
      conversationId,
      senderId,
      senderType: 'pharmacy-owner',
      senderName,
      content,
      imageUrl,
    });
    return response.data;
  }

  /**
   * Upload an image for chat
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/chat/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId, readerId) {
    const response = await api.patch('/chat/messages/mark-read', {
      conversationId,
      readerId,
      readerType: 'pharmacy-owner',
    });
    return response.data;
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId) {
    const response = await api.patch(`/chat/conversations/${conversationId}/archive`);
    return response.data;
  }
}

export const chatService = new ChatService();

