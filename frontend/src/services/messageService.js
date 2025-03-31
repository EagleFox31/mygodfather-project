// src/services/messageService.js
import apiAxios from './apiService';

const messageService = {
  /**
   * Obtenir les messages d'une conversation
   * GET /api/messages?receiverId=xxx&page=1&limit=10
   */
  getMessages: async (receiverId, page = 1, limit = 10) => {
    try {
      const response = await apiAxios.get('/messages', {
        params: { receiverId, page, limit },
      });
      return response.data.data; // liste des messages
    } catch (error) {
      console.error('❌ Erreur getMessages:', error);
      throw error;
    }
  },

  /**
   * Obtenir les messages non lus
   * GET /api/messages/unread
   */
  getUnreadMessages: async () => {
    try {
      const response = await apiAxios.get('/messages/unread');
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur getUnreadMessages:', error);
      throw error;
    }
  },

  /**
   * Envoyer un message
   * POST /api/messages
   */
  sendMessage: async (receiverId, content, attachments = []) => {
    try {
      const response = await apiAxios.post('/messages', {
        receiverId,
        content,
        attachments,
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur sendMessage:', error);
      throw error;
    }
  },

  /**
   * Marquer un message comme lu
   * PUT /api/messages/:id/read
   */
  markAsRead: async (messageId) => {
    try {
      const response = await apiAxios.put(`/messages/${messageId}/read`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur markAsRead:', error);
      throw error;
    }
  },

  /**
   * Supprimer un message (soft delete)
   * DELETE /api/messages/:id
   */
  deleteMessage: async (messageId) => {
    try {
      const response = await apiAxios.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteMessage:', error);
      throw error;
    }
  },
};

export default messageService;
