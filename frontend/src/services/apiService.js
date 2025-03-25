// src/services/apiService.js
import axios from 'axios';
// import authService from './authService';

// ⚙️ Utilisation d'une variable d'environnement pour l'URL de l'API
const API_BASE = 'http://localhost:3001/api';

// 📌 Création d'une instance Axios unique
const apiAxios = axios.create({
    baseURL: API_BASE,
    withCredentials: true, // Pour envoyer les cookies (ex: refresh token)
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 🔑 Intercepteur de requêtes : Ajoute le token si présent
// ─────────────────────────────────────────────────────────────────────────────
apiAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────────────────────────────────────
// 🚨 Intercepteur de réponses : Gestion des erreurs + refresh du token si expiré
// ─────────────────────────────────────────────────────────────────────────────
apiAxios.interceptors.response.use(
    (response) => {
        return response; // ✅ Réponse OK, on la retourne directement
    },
    async (error) => {
        // const originalRequest = error.config;

        // 🔴 Si la requête échoue pour une erreur 401 et qu'on n'est PAS sur /auth/login ni /auth/refresh
        // if (error.response?.status === 401 && !originalRequest._retry) {
        //     originalRequest._retry = true;

        //     try {
        //         console.log('🔄 [apiService] Token expiré, tentative de refresh...');

        //         // 🔄 Tentative de refresh du token via `authService`
        //         const newToken = await authService.refreshToken();

        //         if (newToken) {
        //             console.log('✅ [apiService] Token rafraîchi avec succès:', newToken);

        //             // 🛠️ Mise à jour du token dans le localStorage
        //             localStorage.setItem('accessToken', newToken.accessToken);

        //             // 🛠️ Mise à jour de l'instance Axios avec le nouveau token
        //             apiAxios.defaults.headers.common['Authorization'] = `Bearer ${newToken.accessToken}`;

        //             // 🔄 Réexécute la requête initiale avec le nouveau token
        //             originalRequest.headers['Authorization'] = `Bearer ${newToken.accessToken}`;
        //             return apiAxios(originalRequest);
        //         }
        //     } catch (refreshError) {
        //         console.error('❌ [apiService] Erreur lors du refresh du token:', refreshError);

        //         // ⛔ Déconnexion forcée et redirection vers /login si le refresh échoue
        //         await authService.logout();
        //         window.location.href = '/login';
        //         return Promise.reject(refreshError);
        //     }
        // }

        return Promise.reject(error);
    }
);

export default apiAxios;
