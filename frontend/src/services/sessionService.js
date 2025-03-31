// src/services/sessionService.js
import apiAxios from './apiService';

const sessionService = {
  /**
   * Obtenir toutes les sessions (optionnellement filtrées par pairId, status)
   * GET /api/sessions?pairId=xxx&status=xxx
   */
  getSessions: async (filters = {}) => {
    try {
      const response = await apiAxios.get('/sessions', { params: filters });
      return response.data.data; // renvoie la liste de sessions
    } catch (error) {
      console.error('❌ Erreur getSessions:', error);
      throw error;
    }
  },

  /**
   * Créer une nouvelle session
   * POST /api/sessions
   */
  createSession: async (sessionData) => {
    try {
      const response = await apiAxios.post('/sessions', sessionData);
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur createSession:', error);
      throw error;
    }
  },

  /**
   * Obtenir une session par ID
   * GET /api/sessions/:id
   */
  getSession: async (sessionId) => {
    try {
      const response = await apiAxios.get(`/sessions/${sessionId}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur getSession:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour une session
   * PUT /api/sessions/:id
   */
  updateSession: async (sessionId, updateData) => {
    try {
      const response = await apiAxios.put(`/sessions/${sessionId}`, updateData);
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur updateSession:', error);
      throw error;
    }
  },

  /**
   * Annuler une session
   * POST /api/sessions/:id/cancel
   */
  cancelSession: async (sessionId, reason) => {
    try {
      const response = await apiAxios.post(`/sessions/${sessionId}/cancel`, {
        reason,
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur cancelSession:', error);
      throw error;
    }
  },

  /**
   * Ajouter un feedback à une session
   * POST /api/sessions/:id/feedback
   */
  addSessionFeedback: async (sessionId, { rating, comment }) => {
    try {
      const response = await apiAxios.post(`/sessions/${sessionId}/feedback`, {
        rating,
        comment,
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Erreur addSessionFeedback:', error);
      throw error;
    }
  },
};

export default sessionService;
