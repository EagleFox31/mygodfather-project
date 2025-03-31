// src/services/notificationService.js

import apiAxios from './apiService';
// import io from 'socket.io-client'; // si vous activez la Socket.io côté frontend

const notificationService = {
  /**
   * Récupérer les notifications de l'utilisateur (avec filtres).
   * Routes existantes : GET /api/notifications
   * Filtres (status, type, category, page, limit) selon notificationRoutes.js
   * @param {Object} filters ex: { status:'unread', category:'session', page:1, limit:10 }
   * @returns {Array} tableau de notifications
   */
  getUserNotifications: async (filters = {}) => {
    const query = new URLSearchParams();
    if (filters.status) query.append('status', filters.status);       // "read" ou "unread"
    if (filters.type) query.append('type', filters.type);            // "info","success","warning","error"
    if (filters.category) query.append('category', filters.category);// "system","matching","session","message"
    if (filters.page) query.append('page', filters.page);
    if (filters.limit) query.append('limit', filters.limit);

    const res = await apiAxios.get(`/notifications?${query.toString()}`);
    if (!res.data.success) {
      throw new Error('Impossible de récupérer les notifications.');
    }
    // Le contrôleur renvoie { success: true, data: [...] }
    return res.data.data;
  },

  /**
   * Marquer une notification comme lue.
   * Route : PUT /api/notifications/:id/read
   * @param {String} notificationId ex: "64d5674c98..."
   * @returns {Object} la notification mise à jour
   */
  markAsRead: async (notificationId) => {
    const res = await apiAxios.put(`/notifications/${notificationId}/read`);
    if (!res.data.success) {
      throw new Error('Impossible de marquer la notification comme lue.');
    }
    return res.data.data; 
  },

  /**
   * Mettre à jour les préférences de notification.
   * Route : PUT /api/notifications/preferences
   * Exemple de payload:
   * {
   *   "email": { "enabled": true },
   *   "teams": { "enabled": false },
   *   "web":   { "enabled": true }
   * }
   * @param {Object} preferences 
   * @returns {Object} nouvelles préférences
   */
  updatePreferences: async (preferences) => {
    const res = await apiAxios.put('/notifications/preferences', preferences);
    if (!res.data.success) {
      throw new Error('Impossible de mettre à jour les préférences de notification.');
    }
    return res.data.data;
  },

  /**
   * Envoyer une notification globale (admin).
   * Route : POST /api/notifications/global
   * Payload ex:
   * {
   *   message: "Maintenance prévue demain",
   *   type: "info",
   *   category: "system",
   *   roles: ["mentor","mentee"],
   *   services: [],
   *   expiresIn: 3600
   * }
   * @param {Object} payload 
   * @returns {Object} ex: { success:true, data:{ count, notifications: [...] } }
   */
  sendGlobalNotification: async (payload) => {
    const res = await apiAxios.post('/notifications/global', payload);
    if (!res.data.success) {
      throw new Error('Impossible d\'envoyer la notification globale.');
    }
    return res.data.data;
  },

  /**
   * Tester l'envoi d'une notification (pour debug).
   * Route : POST /api/notifications/test
   * Exemple de payload : { userId:"64d123...", message: "Ceci est un test" }
   * @param {Object} data 
   * @returns {Object} ex: { success:true, notification: {...} }
   */
  sendTestNotification: async (data) => {
    const res = await apiAxios.post('/notifications/test', data);
    if (!res.data.success) {
      throw new Error('Impossible d\'envoyer la notification de test.');
    }
    return res.data.notification; 
  },

  /**
   * (Optionnel) Initialiser le WebSocket pour recevoir les notifications en temps réel.
   * Nécessite d'activer le code dans app.js :
   * notificationService.initializeWebSocket(io);
   */
  // initSocket: (token) => {
  //   const socket = io('http://localhost:3001', {
  //     path: '/ws',
  //     transports: ['websocket'],
  //     autoConnect: false
  //   });
  //   socket.auth = { token };
  //   socket.connect();
    
  //   socket.on('connect', () => {
  //     console.log('Connecté au serveur WebSocket, socket.id =', socket.id);
  //     // Envoyer l'event authenticate
  //     socket.emit('authenticate', token);
  //   });

  //   socket.on('notification', (notification) => {
  //     console.log('Notification reçue via WebSocket:', notification);
  //     // On peut déclencher un callback local pour mettre à jour la cloche
  //   });

  //   socket.on('disconnect', () => {
  //     console.log('Déconnecté du serveur WebSocket');
  //   });

  //   return socket;
  // }
};

export default notificationService;
