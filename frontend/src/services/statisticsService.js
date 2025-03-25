// /src/services/statisticsService.js
import apiAxios from './apiService';

const statisticsService = {

    /**
     * Récupérer les stats du dashboard
     * @param {Object} params - ex: { period: 'week', startDate: '2025-03-01', endDate: '2025-03-07' }
     */
    getDashboardStats: async (params = {}) => {
        try {
            // Construire une query string
            // ex: ?period=week&startDate=2025-03-01&endDate=2025-03-07
            const query = new URLSearchParams();
            if (params.period) query.append('period', params.period);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);

            const response = await apiAxios.get(`/statistics/dashboard?${query.toString()}`);
            if (!response.data.success) {
                throw new Error('Impossible de récupérer les statistiques du dashboard.');
            }
            return response.data.data; // renvoie l'objet stats
        } catch (error) {
            console.error('Erreur getDashboardStats:', error);
            throw error;
        }
    },

    /**
     * Générer un rapport statistique
     * @param {Object} payload - ex: { type: 'pdf', period: 'month', startDate, endDate, sections: ['users','sessions'] }
     */
    generateReport: async (payload) => {
        try {
            // type = 'pdf' ou 'excel'
            // period = 'day'|'week'|'month'|'year'
            // startDate, endDate, sections = []
            const response = await apiAxios.post('/statistics/reports', payload);
            if (!response.data.success) {
                throw new Error('Impossible de générer le rapport.');
            }
            return response.data.data; // ex: { success: true, filePath, ... }
        } catch (error) {
            console.error('Erreur generateReport:', error);
            throw error;
        }
    },

    /**
     * Obtenir les alertes statistiques
     * @param {Object} params - ex: { severity: 'high', status: 'active', category: 'matching' }
     */
    getAlerts: async (params = {}) => {
        try {
            // Construire une query string
            const query = new URLSearchParams();
            if (params.severity) query.append('severity', params.severity);
            if (params.status) query.append('status', params.status);
            if (params.category) query.append('category', params.category);

            const response = await apiAxios.get(`/statistics/alerts?${query.toString()}`);
            if (!response.data.success) {
                throw new Error('Impossible de récupérer les alertes.');
            }
            return response.data.data; // un tableau d'alertes
        } catch (error) {
            console.error('Erreur getAlerts:', error);
            throw error;
        }
    },

    /**
     * Exporter des données statistiques
     * @param {Object} payload - ex: { format: 'csv', data: ['users','sessions'], filters: {}, startDate, endDate, includeHeaders: true }
     */
    exportData: async (payload) => {
        try {
            // format = 'csv'|'excel'|'json'
            // data = ['users','matching','sessions','feedback','activity']
            const response = await apiAxios.post('/statistics/export', payload);
            if (!response.data.success) {
                throw new Error('Impossible d’exporter les données.');
            }
            return response.data.data;
            // ex: si format='json' => un objet
            // si format='csv' => potentiellement un string CSV
            // si format='excel' => { filePath: ... } etc.
        } catch (error) {
            console.error('Erreur exportData:', error);
            throw error;
        }
    },

     /**
   * getMatchingDistribution: appelle GET /statistics/matching-distribution
   * @param {Object} params ex: { period: 'week', startDate, endDate }
   */
  getMatchingDistribution: async (params = {}) => {
        try {
            const query = new URLSearchParams();
            if (params.period) query.append('period', params.period);
            if (params.startDate) query.append('startDate', params.startDate);
            if (params.endDate) query.append('endDate', params.endDate);

            const response = await apiAxios.get(`/statistics/matching-distribution?${query.toString()}`);
            if (!response.data.success) {
                throw new Error('Impossible de récupérer la distribution des scores.');
            }
            return response.data.data; // { startDate, endDate, distribution: [ { range, count }, ... ] }
        } catch (error) {
            console.error('Erreur getMatchingDistribution:', error);
            throw error;
        }
    }

};

export default statisticsService;
