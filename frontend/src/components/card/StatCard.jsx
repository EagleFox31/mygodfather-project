import React from 'react';
import PropTypes from 'prop-types';
import { ChevronUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import CountUp from 'react-countup';

export function StatCard({ icon: Icon, title, value, trend, color }) {
  const { theme } = useTheme();

  // Classes dynamiques pour le conteneur (fond, bordure, texte)
  const containerClass = theme === 'dark'
    ? 'bg-white/10 border-white/20 text-white'
    : 'bg-slate-100 border-slate-200 text-slate-800';

  // Sous-texte (par ex. le titre) un peu plus subtile
  const subTextClass = theme === 'dark'
    ? 'text-gray-300'
    : 'text-slate-600';

  // Couleur de l'icône selon le thème
  const iconClass = theme === 'dark'
    ? 'text-white'
    : 'text-slate-800';

  return (
    <div
      className={`relative overflow-hidden rounded-2xl backdrop-blur-xl p-6 shadow-xl border hover:shadow-2xl transition-all duration-300 group ${containerClass}`}
    >
      {/* Cercle de couleur (en arrière-plan) */}
      <div
        className="absolute -right-6 -top-6 w-24 h-24 blur-3xl rounded-full bg-opacity-50 group-hover:scale-150 transition-transform duration-500"
        style={{ backgroundColor: color }}
      />

      {/* Contenu principal */}
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm mb-1 ${subTextClass}`}>{title}</p>
          <h3 className="text-2xl font-bold mb-2">
            <CountUp end={Number(value)} duration={2} separator="," />
          </h3>
          {trend && (
            <div className="flex items-center text-green-400 text-sm">
              <ChevronUp size={16} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Icône (taille + couleur selon thème) */}
        <Icon
          className={`transform transition-transform duration-300 group-hover:scale-110 ${iconClass}`}
          size={24}
        />
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  trend: PropTypes.string,
  color: PropTypes.string.isRequired,
};

export default StatCard;