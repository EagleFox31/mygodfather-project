import React from 'react';
import PropTypes from 'prop-types';
import {
  Gauge,
  Calendar,
  Users,
  Smile,
  AlertCircle,
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
        ${active
          ? 'bg-white/10 text-white border-l-4 border-[#FF294D]'
          : `hover:bg-white/5 ${
              theme === 'dark'
                ? 'text-white/70 hover:text-white'
                : 'text-white/80 hover:text-white'
            }`
        }
      `}
    >
      {/* Halo + icône */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-white blur opacity-30 transition duration-700" />
        <Icon size={20} className="relative text-white" />
      </div>

      {/* Texte */}
      <span
        className={`
          text-sm font-semibold transition-all duration-300
          ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
        `}
      >
        {label}
      </span>

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

export function SidebarRH({ collapsed, setCollapsed }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const brandColor = isDark ? '#FF294D' : '#005795';

  return (
    <div
      className={`
        fixed left-0 top-0 h-screen border-r
        backdrop-blur-2xl transition-all duration-300
        ${collapsed ? 'w-20' : 'w-64'}
        rounded-br-3xl overflow-hidden
        flex flex-col justify-between
        bg-[${brandColor}] text-white
      `}
    >
      {/* En-tête avec logo */}
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
          RH Panel
        </h1>
      </div>

      {/* Navigation */}
      <div className="px-3 space-y-1 flex-1">
        <NavItem icon={Gauge} label="Tableau de bord" active collapsed={collapsed} />
        <NavItem icon={Calendar} label="Suivi des sessions" collapsed={collapsed} />
        <NavItem icon={Users} label="Disponibilité mentors" collapsed={collapsed} />
        <NavItem icon={Smile} label="Satisfaction" collapsed={collapsed} />
        <NavItem icon={AlertCircle} label="Alertes KPI" collapsed={collapsed} />
      </div>

      {/* Bouton collapse */}
      <div className="p-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            relative group w-full p-3 rounded-xl transition-all duration-300
            text-white/80 hover:text-white hover:bg-white/10
          `}
        >
          <div className="absolute -inset-1 bg-white rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-700" />
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

SidebarRH.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
};

export default SidebarRH;
