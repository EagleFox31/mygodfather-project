import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';
import authService from "../services/authService";
import userService from "../services/userService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
  };

  // État global du user
  const [user, setUser] = useState(() => {
    // Try to get user from stored token on initial load
    const currentUser = authService.getCurrentUser();
    console.log('🔍 [AuthContext] Initial auth check:', currentUser ? '✅ Found user' : '❌ No user');
    return currentUser;
  });
  
  // État de l’erreur d’auth
  const [error, setError] = useState(null);

  // État de l’onboarding (vrai/faux)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    () => JSON.parse(localStorage.getItem("hasCompletedOnboarding")) || false
  );

  // CHANGED: On synchronise localStorage quand `hasCompletedOnboarding` change
  useEffect(() => {
    localStorage.setItem("hasCompletedOnboarding", JSON.stringify(hasCompletedOnboarding));
  }, [hasCompletedOnboarding]);

  // À l’init, on va chercher l’utilisateur complet sur le backend
  useEffect(() => {
    const fetchUser = async () => {
      // This function is redundant and not needed anymore
      try {
        const currentUser = await userService.fetchCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // CHANGED: on récupère la valeur depuis l’API
          setHasCompletedOnboarding(!!currentUser?.hasCompletedOnboarding);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('⚠️ Erreur lors de la récupération de l’utilisateur:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // Fonction login
  const login = async (email, password) => {
    try {
      
      setError(null);

      const result = await authService.login(email, password);
      // On récupère à nouveau l’utilisateur complet (et ses infos d’onboarding)
      const currentUser = result.user; // Set current user directly from login response
      setUser(currentUser);
      // CHANGED: on synchronise
      setHasCompletedOnboarding(currentUser?.hasCompletedOnboarding || false);
      return {
        success: true,
        user: currentUser
      };
    } catch (err) {
      console.error('⚠️ Authentication error:', err.message);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } 
  };

  // Fonction logout
  const logout = async () => {
    try {
      
      // Clean up local state first
      setUser(null);
      setHasCompletedOnboarding(false);
      sessionStorage.removeItem("hasCompletedOnboarding");
      localStorage.removeItem("accessToken");
      
      // Déconnexion côté serveur (on ne “await” pas forcément)
      authService.logout().catch(err => {
        console.error('Erreur lors de la déconnexion côté serveur:', err);
      });
      
      // Navigate to login
      window.location.href = '/login';
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      // Ensure we still redirect to login even if there's an error
      window.location.href = '/login';
    } 
  };

  // Méthode de refresh (optionnel, tel que dans ton code)
  const refreshUserSession = async () => {
    try {
      
      console.log('🔄 [AuthContext] Attempting to refresh token...');
      
      // Check if token is about to expire
      const isTokenExpiring = await authService.isTokenExpiring();
      if (!isTokenExpiring) {
        console.log('✅ [AuthContext] Token still valid, no refresh needed');
        return;
      }

      const result = await authService.refreshToken();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      console.log('✅ [AuthContext] Token refreshed successfully');
      return result;
    } catch (err) {
      console.error('❌ [AuthContext] Error refreshing token:', err);
      await logout();
      throw err;
    } 
  };

  // Fonction utilitaire pour obtenir le dashboard approprié selon le rôle
  const getDefaultRedirect = () => {
    if (!user) return '/login';

    switch (user.role?.toLowerCase()) {
      case 'admin':
        return '/admin/dashboard';
      case 'rh':
        return '/dashboard-rh';
      case 'mentor':
        return '/dashboard-mentor';
      case 'mentore':
        return '/dashboard-mentore';
      default:
        return '/login';
    }
  };

  // Fonction pour vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (requiredRole) => {
    return user?.role?.toLowerCase() === requiredRole.toLowerCase();
  };

  // Fonction pour vérifier si l'utilisateur a l'un des rôles spécifiés
  const hasAnyRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    return requiredRoles.some(role => user.role.toLowerCase() === role.toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        
        error,
        login,
        logout,
        refreshUserSession,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        getDefaultRedirect,
        hasRole,
        hasAnyRole,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
