import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
// On remplace lucide-react par FaBell “solid”
import { FaBell } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { Sidebar } from './Sidebar';
import notificationService from '../../services/notificationService';
import authService from '../../services/authService'; // Importing authService
import { FaSignOutAlt } from 'react-icons/fa'; // Importing logout icon

export function AdminLayout({ children }) {
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = (theme === 'dark');

  // “brandColor” pour le halo
  const brandColor = isDark ? '#FF294D' : '#005795';

  // States notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  // On n’utilise plus handleBellClick -> on gère le dropdown au hover
  const [showDropdown, setShowDropdown] = useState(false);

  // Ref pour fermer le dropdown si on sort de la zone
  const dropdownRef = useRef(null);

  // Charger les notifs
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await notificationService.getUserNotifications({ status: 'unread', limit: 5 });
        setNotifications(data);
        setUnreadCount(data.length);
      } catch (err) {
        console.error('Erreur chargement notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  // Marquer notification comme lue
  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur markAsRead:', err);
    }
  };

  // Au survol, on affiche le dropdown
  const handleMouseEnterBell = () => {
    setShowDropdown(true);
  };
  const handleMouseLeaveBell = (e) => {
    // On vérifie si on quitte la zone du <div ref={dropdownRef}> pour fermer
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

  // Fond swirl global
  const containerClass = isDark
    ? 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1f35] to-slate-900 text-white'
    : 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-50 text-slate-800';

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${containerClass}`}>
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div
        className={`
          h-full flex flex-col
          transition-all duration-300
          ${sidebarCollapsed ? 'ml-20' : 'ml-64'}
        `}
      >
        <header
          className={`
            sticky top-0 z-10 relative
            overflow-visible
            px-8 py-6 shadow-sm border-b backdrop-blur-xl
            transition-all duration-300 group
            ${isDark ? 'bg-[#FF294D] text-white border-white/20' : 'bg-[#005795] text-white border-slate-200'}
          `}
        >
          <div
            className="absolute -right-10 -top-10 w-40 h-40 blur-3xl rounded-full bg-opacity-50
                      group-hover:scale-110 transition-transform duration-500"
            style={{ backgroundColor: brandColor }}
          />
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            {/* Zone notifications */}
            <div
              className="relative flex items-center"
              ref={dropdownRef}
              // On affiche le menu au hover
              onMouseEnter={handleMouseEnterBell}
              onMouseLeave={handleMouseLeaveBell}
            >
              {/* Icône cloche blanche (FaBell) */}
              <FaBell size={20} className="text-white cursor-pointer" />

              {/* Point rouge si unread */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}

              {/* Dropdown quand showDropdown = true */}
              {showDropdown && (
                <div
                  className="
                    absolute right-0 top-8 w-72 bg-white text-slate-800
                    shadow-lg rounded-lg py-2 z-50
                  "
                >
                  <h4 className="text-sm font-semibold px-3 py-2 border-b">
                    Notifications
                  </h4>
                  <div className="max-h-60 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center text-sm p-2">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className="px-3 py-2 text-sm border-b last:border-b-0 flex justify-between items-start"
                        >
                          <div>
                            <div className="font-medium">{notif.title}</div>
                            <div>{notif.message}</div>
                          </div>
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="ml-2 text-xs text-blue-600 hover:underline"
                          >
                            Lu
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminLayout;
