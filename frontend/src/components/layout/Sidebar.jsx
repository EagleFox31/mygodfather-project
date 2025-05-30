// Sidebar.jsx
import React from 'react';
import PropTypes from 'prop-types';
import {
  Gauge,
  Users,
  PieChart,
  MessageCircle,
  UserCog,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function NavItem({ icon: Icon, label, active, collapsed }) {
  const { theme } = useTheme();

  return (
    <div
      className={`
        relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
        transition-all duration-300
        ${
          active
            // On remplace la bordure dorée par la bordure rouge
            ? 'bg-white/10 text-white border-l-4 border-[#FF294D]'
            : `hover:bg-white/5 ${
                theme === 'dark'
                  ? 'text-white/70 hover:text-white'
                  : 'text-white/80 hover:text-white'
              }`
        }
      `}
    >
      {/* Icône + halo */}
      <div className="relative flex items-center justify-center">
        {/* Halo blanc derrière l’icône */}
        <div className="absolute inset-0 rounded-full bg-white blur opacity-30 transition duration-700" />
        {/* Icône en blanc */}
        <Icon size={20} className="relative text-white" />
      </div>

      {/* Label (masqué si collapsed) */}
      <span
        className={`
          text-sm font-semibold transition-all duration-300
          ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
        `}
      >
        {label}
      </span>

      {/* Chevron si actif */}
      {active && !collapsed && (
        <ChevronRight className="ml-auto relative" size={16} />
      )}
    </div>
  );
}

NavItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  collapsed: PropTypes.bool,
};

export function Sidebar({ collapsed, setCollapsed }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Couleur unie : rouge en dark, bleu en clair
  const brandColor = isDark ? '#FF294D' : '#005795';

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen border-r
        backdrop-blur-2xl transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        rounded-br-3xl overflow-hidden
        flex flex-col justify-between
        // On applique la couleur unie, plus du texte blanc
        bg-[${brandColor}] text-white
      `}
    >
      {/* Header : Logo + Titre */}
      <div className="p-6 flex items-center gap-3 relative">
        <img
          src="/logo-cfao.png"
          alt="Logo"
          className="w-10 h-10 object-contain relative z-10"
        />
        <h1
          className={`
            font-bold text-2xl transition-all duration-300
            ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
            text-white
          `}
        >
          MyGodFather
        </h1>
      </div>

      {/* Navigation items */}
      <div className="px-3 space-y-1 flex-1">
        <NavItem icon={Gauge} label="Dashboard" active collapsed={collapsed} />
        <NavItem icon={Users} label="Users" collapsed={collapsed} />
        <NavItem icon={PieChart} label="Analytics" collapsed={collapsed} />
        <NavItem icon={MessageCircle} label="Messages" collapsed={collapsed} />
        <NavItem icon={UserCog} label="Settings" collapsed={collapsed} />
      </div>

      {/* Footer : bouton collapse */}
      <div className="p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            relative group w-full p-3 rounded-xl transition-all duration-300
            text-white/80 hover:text-white hover:bg-white/10
          `}
        >
          {/* Halo blanc (optionnel) */}
          <div
            className="absolute -inset-1 bg-white rounded-xl blur
                       opacity-0 group-hover:opacity-30 transition duration-700"
          />
          <div className="relative flex items-center justify-center">
            <LogOut
              size={20}
              className={`transform ${collapsed ? 'rotate-180' : ''}`}
            />
          </div>
        </button>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
};

export default Sidebar;
