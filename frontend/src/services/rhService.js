// src/services/rhService.js
import api from './apiService'; // Ton instance Axios déjà configurée

const rhService = {
  /**
   * Récupérer les statistiques du tableau de bord RH.
   * -> Correspond à la route GET /api/statistics/dashboard
   * -> Ton backend renvoie { success: true, data: { ... } }
   */
  async getDashboardStats({ period = 'month', startDate, endDate } = {}) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    // Appel GET /api/statistics/dashboard?period=xxx&startDate=xxx&endDate=xxx
    const response = await api.get(`/statistics/dashboard?${params.toString()}`);

    // Ton backend semble renvoyer : { success: true, data: {...} }
    // On renvoie directement data.data
    return response.data.data;
  },

  /**
   * Récupérer la liste des paires en attente
   * -> GET /api/pairs?status=pending
   * -> Ton PairController.getPairs() gère le param status
   */
  async getPendingPairs({ limit = 5, offset = 0 } = {}) {
    const response = await api.get('/pairs', {
      params: {
        status: 'pending',
        limit,
        offset,
      }
    });
    // backend: { success: true, data: [ ... ] }
    return response.data.data;
  },

  /**
   * Récupérer la liste des paires actives
   * -> GET /api/pairs?status=active
   */
  async getActivePairs() {
    const response = await api.get('/pairs', {
      params: { status: 'active' },
    });
    return response.data.data;
  },
};

export default rhService;
