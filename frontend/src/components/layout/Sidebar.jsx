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

// Composant NavItem pour un item de navigation
function NavItem({ icon: Icon, label, active, collapsed }) {
  const { theme } = useTheme();

  // Couleur rouge d'entreprise
  const brandColor = '#FF294D';

  // Couleurs du texte (label) : rouge en sombre, bleu en clair
  // => Mais on va ajouter un aspect "premium" en or sur l'état actif
  const goldColor = '#FFD700';

  // Si l’item est actif, on applique un léger background + texte plus flashy
  // + sinon, un style normal
  const activeBg = `bg-[${brandColor}]/10 border-l-4 border-[${goldColor}]`;
  const activeText = `text-[${goldColor}]`; // On force l’or quand c’est actif

  const normalText =
    theme === 'dark'
      ? 'text-[#FF294D]/60 hover:text-[#FF294D]'
      : 'text-[#005795]/60 hover:text-[#005795]';

  return (
    <div
      className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer
                  transition-all duration-300
                  ${
                    active
                      ? `${activeBg} ${activeText} shadow-[inset_0_0_0_2px_rgba(8,129,216,0.69)]`
                      : `hover:bg-[${brandColor}]/5 ${normalText}`
                  }`}
    >
      {/* Icône + halo */}
      <div className="relative flex items-center justify-center">
        {/* Halo rouge derrière l’icône */}
        <div className="absolute inset-0 rounded-full bg-[#FF294D] blur opacity-30 transition duration-700" />
        {/* Icône en rouge, quoi qu’il arrive */}
        <Icon size={20} className="relative text-[#FF294D]" />
      </div>

      <span
        className={`text-sm font-semibold transition-all duration-300 ${
          collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
        }`}
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

// Sidebar
export function Sidebar({ collapsed, setCollapsed }) {
  const { theme } = useTheme();

  // Couleurs principales
  const brandColor = '#FF294D';
  const goldColor = '#005795';

  // Fond swirl premium : rouge + or
  const swirlBg =
    theme === 'dark'
      ? `bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))]
         from-[${brandColor}]/10 via-[${goldColor}]/10 to-[#1a1f35]/40 border-[${goldColor}]/20`
      : `bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))]
         from-[${brandColor}]/5 via-[${goldColor}]/5 to-slate-50 border-slate-300`;

  // Titre en gradient rouge → or pour un effet premium
  const titleGradient = `
    bg-gradient-to-r from-[#FF294D] to-[#005795]
    text-transparent bg-clip-text
  `;

  return (
    <div
      className={`fixed left-0 top-0 h-screen backdrop-blur-2xl border-r
                  shadow-#005795
                  transition-all duration-300
                  ${swirlBg}
                  ${collapsed ? 'w-20' : 'w-64'}
                  rounded-tr-3xl rounded-br-3xl overflow-hidden
                  flex flex-col justify-between`}
    >
      {/* Header : Logo + Titre */}
      <div className="p-6 flex items-center gap-3 relative">
        {/* Remplacez /logo.png par le chemin réel de votre logo */}
        <img
          src="/logo.png"
          alt="Logo"
          className="w-10 h-10 object-contain relative z-10"
        />
        {/* Titre : gradient de couleur pour un look premium */}
        <h1
          className={`font-bold text-2xl transition-all duration-300
                      ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}
                      ${titleGradient}`}
        >
          AdminPro
        </h1>
        {/* Halo doré derrière le logo */}
        <div className="absolute -left-2 -top-2 w-14 h-14 rounded-full bg-[#FFD700]/20 blur-2xl opacity-60 pointer-events-none" />
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
          className={`relative group w-full p-3 rounded-xl transition-all duration-300
                      ${
                        theme === 'dark'
                          ? 'text-white/60 hover:text-white hover:bg-[#FF294D]/10'
                          : 'text-slate-600 hover:text-slate-800 hover:bg-[#FF294D]/10'
                      }`}
        >
          {/* Halo rouge */}
          <div
            className="absolute -inset-1 bg-[#FF294D] rounded-xl blur
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
