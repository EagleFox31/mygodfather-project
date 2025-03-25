// src/services/authService.js

import axios from 'axios';



// Point de base de notre API côté auth
const API_BASE = 'http://localhost:3001/api/auth';

// Limite de tentatives de refresh avant logout forcé
const MAX_REFRESH_ATTEMPTS = 3;
let refreshAttempts = 0;

// ─────────────────────────────────────────────────────────────────────────────
// 1) CRÉER L'INSTANCE AXIOS DÉDIÉE
// ─────────────────────────────────────────────────────────────────────────────
const authAxios = axios.create({
  baseURL: API_BASE,

  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 2) INTERCEPTEUR DE REQUÊTES :
//    - Injecte le "Bearer <token>" dans les headers si présent en localStorage
//    - Optionnel: Injecter un CSRF token si ton backend l’exige (ex: config.headers['X-CSRF-Token'])
// ─────────────────────────────────────────────────────────────────────────────
authAxios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // config.headers['X-CSRF-Token'] = localStorage.getItem('csrfToken');
    }
    return config;
  },
  error => Promise.reject(error)
);


// ─────────────────────────────────────────────────────────────────────────────
// 3) INTERCEPTEUR DE RÉPONSES :
//    - Gère le cas où le token expire bientôt (ou a expiré) => on tente un refresh
//    - Évite les boucles infinies en limitant le nombre de rafraîchissements
//    - Gère la redirection vers /login en cas d’erreur 401
// ─────────────────────────────────────────────────────────────────────────────
authAxios.interceptors.response.use(
  response => {
    // Debug ou simple logging
    console.log('✅ Réponse reçue:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method
    });
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // On ne fait pas de refresh si déjà en /auth/login, /auth/refresh ou /auth/logout
    if (
      originalRequest.url.includes('/login') ||
      originalRequest.url.includes('/refresh') ||
      originalRequest.url.includes('/logout')
    ) {
      return Promise.reject(error);
    }

    // Vérifier si on a un token en local
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Décoder la payload du token pour connaître la date d’expiration
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiration = expirationTime - currentTime;

        // On considère qu’en-dessous de 5 minutes, on doit déjà refresh
        if (timeUntilExpiration < 5 * 60 * 1000 && !originalRequest._retry) {
          console.log('🔄 Token expirant bientôt, tentative de refresh...');
          originalRequest._retry = true;

          if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.error('❌ Nombre maximal de refresh atteint. Déconnexion...');
            await authService.logout(); // On efface tout
            window.location.href = '/login';
            return Promise.reject(error);
          }

          refreshAttempts++;

          try {
            // On tente de récupérer un nouveau token
            const newToken = await authService.refreshToken();
            console.log('✨ Nouveau token généré:', newToken.accessToken);

            // Reset du compteur si tout va bien
            refreshAttempts = 0;

            // On met à jour le localStorage et les headers
            localStorage.setItem('accessToken', newToken.accessToken);
            authAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken.accessToken}`;

            // On rejoue la requête initiale avec le nouveau token
            return authAxios(originalRequest);
          } catch (refreshError) {
            console.error('❌ Échec lors du refresh token:', refreshError);
            await authService.logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }
      } catch (decodeError) {
        console.error('❌ Erreur de parsing du token:', decodeError);
      }
    }

    // Enfin, on gère une 401 claire => on redirige vers /login
    if (error.response?.status === 401) {
      console.error('🔒 Erreur 401 - Non autorisé:', {
        url: originalRequest.url,
        method: originalRequest.method
      });
      await authService.logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 4) NOTRE OBJET authService AVEC LES DIFFÉRENTES FONCTIONS
const authService = {

  /**
    * 🔹 Marquer l'onboarding comme terminé côté serveur
    */
  completeOnboarding: async () => {
    try {
      const response = await authAxios.patch('/users/complete-onboarding');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour onboarding:', error);
      throw error;
    }
  },

  /**
   * Login: poste { email, password }, stocke le token et le place en header
   */
  login: async (email, password) => {
    try {
      console.log('🔑 Tentative de login avec:', { email });

      // Avant le login, on nettoie tout
      localStorage.removeItem('accessToken');
      delete authAxios.defaults.headers.common['Authorization'];

      const response = await authAxios.post('/login', {
        email,
        password
      });

      const { data } = response;
      if (data.success && data.data?.accessToken) {
        const { user, accessToken, tokenInfo } = data.data;

        // Stocker le nouveau token
        localStorage.setItem('accessToken', accessToken);
        authAxios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        console.log('✅ Login success:', { user, tokenInfo });
        return { user, tokenInfo };
      }

      throw new Error('Réponse serveur invalide ou accessToken manquant.');
    } catch (error) {
      console.error('❌ Échec login:', error);
      throw error;
    }
  },

  /**
   * Logout: supprime le token local et informe le serveur (invalidation)
   */
  logout: async () => {
    const token = localStorage.getItem('accessToken');
    const cleanup = () => {
      localStorage.removeItem('accessToken');
      delete authAxios.defaults.headers.common['Authorization'];
    };

    // Suppression du token côté front
    cleanup();

    // Tentative de logout côté serveur
    if (token) {
      try {
        await authAxios.post('/logout', {} /* body vide */);
        console.log('✅ Déconnexion côté serveur OK');
      } catch (error) {
        console.error('❌ Erreur lors du logout côté serveur:', error);
      }
    }
  },

  /**
   * Refresh: demande un nouveau accessToken à l'endpoint /auth/refresh
   */
  refreshToken: async () => {
    const response = await authAxios.post('/refresh');
    if (response.data.success && response.data.data?.accessToken) {
      const { accessToken } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      authAxios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      return response.data.data; // { accessToken, tokenInfo }
    }
    throw new Error('Impossible de rafraîchir le token');
  },

  /**
   * Vérifie le statut d’authentification côté serveur
   */
  checkAuthStatus: async () => {
    const response = await authAxios.get('/status');
    if (response.data.success) {
      // Renvoie user, isAuthenticated, tokenInfo...
      return response.data.data;
    }
    throw new Error('Non authentifié');
  },

  /**
   * Retourne l'utilisateur courant selon le token stocké
   * (décodage local, pas d'appel serveur ici)
   */
  getCurrentUser: () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Vérification expiration
        if (payload.exp * 1000 < Date.now()) {
          authService.logout();
          return null;
        }
        return payload;
      } catch (error) {
        console.error('Erreur parsing token:', error);
        return null;
      }
    }
    return null;
  },
};
// ─────────────────────────────────────────────────────────────────────────────
// 5) ON EXPOSE NOTRE SERVICE
// ─────────────────────────────────────────────────────────────────────────────
export { authAxios };
export default authService;
