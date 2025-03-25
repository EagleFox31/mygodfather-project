import axios from 'axios';



const API_BASE = 'http://localhost:3001/api/users';

const userAxios = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

userAxios.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));


const userService = {
    /**
     * 🔹 Récupérer l'utilisateur connecté depuis le backend
     */
    fetchCurrentUser: async () => {
        try {
            console.log('📡 Récupération du profil utilisateur...');
            const response = await userAxios.get('/profile');  // ✅ Utilisation correcte de userAxios
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
    }
};

export default userService;
