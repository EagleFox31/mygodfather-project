import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Settings, Bell } from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-auto"
              />
              <h1 className="ml-3 text-xl font-semibold text-gray-900">
                My Godfather
              </h1>
            </div>

            {/* Navigation et actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5 text-gray-500" />
              </button>

              {/* Menu utilisateur */}
              <div className="relative ml-3">
                <div className="flex items-center">
                  <button className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {user?.name} {user?.prenom}
                    </span>
                  </button>
                </div>
              </div>

              {/* Bouton déconnexion */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} My Godfather. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
