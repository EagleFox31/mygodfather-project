import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FaBell } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import SidebarRH from './SidebarRH';
import notificationService from '../../services/notificationService';

export function RHLayout({ children }) {
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isDark = theme === 'dark';
  const brandColor = isDark ? '#FF294D' : '#005795';

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

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

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur markAsRead:', err);
    }
  };

  const handleMouseEnterBell = () => setShowDropdown(true);
  const handleMouseLeaveBell = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

  const containerClass = isDark
    ? 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1f35] to-slate-900 text-white'
    : 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-50 text-slate-800';

  return (
    <div className={`h-screen overflow-hidden transition-colors duration-300 ${containerClass}`}>
      <SidebarRH collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      <div className={`h-full flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header
          className={`
            sticky top-0 z-10 relative px-8 py-6 shadow-sm border-b backdrop-blur-xl
            ${isDark ? 'bg-[#FF294D] text-white border-white/20' : 'bg-[#005795] text-white border-slate-200'}
          `}
        >
          <div
            className="absolute -right-10 -top-10 w-40 h-40 blur-3xl rounded-full bg-opacity-50
                       group-hover:scale-110 transition-transform duration-500"
            style={{ backgroundColor: brandColor }}
          />
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Espace RH</h1>

            {/* Icône Notifications */}
            <div
              className="relative flex items-center"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnterBell}
              onMouseLeave={handleMouseLeaveBell}
            >
              <FaBell size={20} className="text-white cursor-pointer" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              )}
              {showDropdown && (
                <div className="absolute right-0 top-8 w-72 bg-white text-slate-800 shadow-lg rounded-lg py-2 z-50">
                  <h4 className="text-sm font-semibold px-3 py-2 border-b">Notifications</h4>
                  <div className="max-h-60 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center text-sm p-2">Aucune notification</div>
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

RHLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default RHLayout;
