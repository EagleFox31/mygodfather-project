// src/services/userService.js
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/users';

const userAxios = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

userAxios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

const userService = {
  /**
   * 🔹 Récupérer l'utilisateur connecté depuis le backend
   */
  fetchCurrentUser: async () => {
    try {
      console.log('📡 Récupération du profil utilisateur...');
      const response = await userAxios.get('/profile'); // Utilisation de userAxios
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  },

  /**
   * 🔹 Mettre à jour le profil utilisateur
   */
  updateProfile: async (updatedData) => {
    try {
      const response = await userAxios.put('/profile', updatedData);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour profil:', error);
      throw error;
    }
  },

  /**
   * 🔹 Marquer l'onboarding comme terminé côté serveur
   */
  completeOnboarding: async () => {
    try {
      const response = await userAxios.patch('/complete-onboarding');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour onboarding:', error);
      throw error;
    }
  },

  /**
   * 🔹 Récupérer tous les mentors
   * Utilise la route GET /api/users avec le paramètre role=mentor
   */
  fetchMentors: async () => {
    try {
      const response = await userAxios.get('/', { params: { role: 'mentor' } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur récupération mentors:', error);
      throw error;
    }
  },

  /**
   * 🔹 Récupérer tous les mentees
   * Utilise la route GET /api/users avec le paramètre role=mentee
   */
  fetchMentees: async () => {
    try {
      const response = await userAxios.get('/', { params: { role: 'mentee' } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur récupération mentees:', error);
      throw error;
    }
  },

  /**
   * 🔹 Récupérer tous les administrateurs et RH
   * Ici, on peut soit appeler deux fois fetch (pour 'admin' et 'rh') et fusionner, soit 
   * utiliser une convention côté backend pour accepter un paramètre role avec plusieurs valeurs.
   * Dans cet exemple, on suppose que le backend accepte 'admin,rh'
   */
  fetchAdminsAndRH: async () => {
    try {
      const response = await userAxios.get('/', { params: { role: 'admin,rh' } });
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Erreur récupération admins et RH:', error);
      throw error;
    }
  }
};

export default userService;
