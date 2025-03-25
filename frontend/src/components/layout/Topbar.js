import React from "react";
import { Search, Bell, Sun, Moon, UserCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Topbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Champ de Recherche */}
        <div className="relative flex items-center w-96">
          <Search className="absolute left-3 text-gray-500 dark:text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 bg-white/20 dark:bg-black/20 rounded-lg text-sm text-gray-700 dark:text-white outline-none border border-transparent focus:border-gray-300 dark:focus:border-gray-600 transition"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-white/20 transition-all"
          >
            {theme === "dark" ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-gray-700" size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative cursor-pointer">
            <Bell className="text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white" size={22} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>

          {/* Profil Admin */}
          <div className="relative group">
            <div className="flex items-center space-x-3 cursor-pointer">
              <UserCircle className="text-gray-700 dark:text-white" size={28} />
              <span className="text-sm font-medium text-gray-700 dark:text-white hidden md:block">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
