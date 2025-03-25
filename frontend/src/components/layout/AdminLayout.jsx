import React from 'react';
import PropTypes from 'prop-types';
import { Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Sidebar } from './Sidebar';

export function AdminLayout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Pour unifier le fond, vous pouvez reprendre le même gradient swirl que sur Home/Login
  const containerClass =
    theme === 'dark'
      ? 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1f35] to-slate-900 text-white'
      : 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-50 text-slate-800';

  // Classes pour le bouton de thème
  const headerBtnBgHover = theme === 'dark'
    ? 'hover:bg-white/20'
    : 'hover:bg-slate-300';

  const headerIconColor = theme === 'dark' ? 'text-white' : 'text-slate-700';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${containerClass}`}>
      {/* Sidebar avec logo */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Contenu principal (right panel) */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#FF294D' : '#005795' }}>
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              {/* Bouton toggle theme */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full bg-white/10 transition-colors ${headerBtnBgHover}`}
              >
                {theme === 'dark' ? (
                  <Sun className={headerIconColor} size={20} />
                ) : (
                  <Moon className={headerIconColor} size={20} />
                )}
              </button>
              {/* Bouton notifications */}
              <div className="relative">
                <Bell
                  className={`cursor-pointer transition-colors ${
                    theme === 'dark'
                      ? 'text-white/70 hover:text-white'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  size={20}
                />
                {/* Pastille rouge */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
          {/* Contenu enfant (le Dashboard, etc.) */}
          {children}
        </div>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;
