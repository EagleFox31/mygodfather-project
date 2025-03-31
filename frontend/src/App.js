import React from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
// import { useAuth } from "./context/AuthContext";
// import WelcomeScreen from "./pages/WelcomeScreen";
import Router from "./Router";
import NotificationContainer from "./components/Notifications/NotificationContainer";
import { useTheme } from './context/ThemeContext';


function App() {
  const location = useLocation();
  const { theme } = useTheme();
  // const { isAuthenticated } = useAuth();

  return (
    <div
      className={`min-h-screen ${theme === 'dark'
        ? 'bg-gradient-conic-tr from-primary-900/20 via-swirl-secondary-900/20 to-slate-900 backdrop-blur-2xl text-white'
        : 'bg-gradient-conic-tr from-primary-900/20 via-swirl-secondary-900/20 to-slate-900 backdrop-blur-2xl text-slate-800'
      
        }`}
    >
      {/* Conteneur des notifications */}
      <NotificationContainer />

      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

          {/* Si l'utilisateur n'est pas authentifié, afficher l'écran de bienvenue */}

            <Router location={location} />

        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
