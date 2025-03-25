import React from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useNotification } from "../context/NotificationContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { addNotification } = useNotification();

  const handleLogout = () => {
    logout();
    addNotification("Vous avez été déconnecté", "success");
  };

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between">
      <span>MY GODFATHER</span>
      <div>
        <select onChange={(e) => setLanguage(e.target.value)} value={language}>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
        {isAuthenticated ? (
          <>
            <span>Bienvenue, {user?.name}!</span>
            <button onClick={handleLogout} className="ml-4">Déconnexion</button>
          </>
        ) : (
          <span>Connectez-vous</span>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
