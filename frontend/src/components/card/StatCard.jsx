import React from 'react';
import PropTypes from 'prop-types';
import { ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import CountUp from 'react-countup';

/**
 * Détermine la couleur + l’icône du badge de trend
 * en fonction du trend (ex: "+12%", "0%", "-5%")
 */
function getTrendBadgeProps(trendStr) {
  if (!trendStr) return null;

  // Extrait la valeur numérique (ex. "+12%" => 12, "-5%" => -5, "0%" => 0)
  const numericValue = parseFloat(trendStr.replace('%', '').replace('+', ''));

  if (isNaN(numericValue)) {
    // Format inattendu => on n'affiche rien
    return null;
  }

  // Par défaut
  let bgClass = 'bg-gray-200';
  let textClass = 'text-gray-800';
  let Icon = Minus;

  if (numericValue > 0) {
    bgClass = 'bg-green-100';
    textClass = 'text-green-700';
    Icon = ChevronUp;
  } else if (numericValue < 0) {
    bgClass = 'bg-red-100';
    textClass = 'text-red-700';
    Icon = ChevronDown;
  } else {
    // Cas = 0
    bgClass = 'bg-blue-100';
    textClass = 'text-blue-600';
    Icon = Minus;
  }

  return { bgClass, textClass, Icon };
}

/**
 * Composant StatCard
 * - Affiche un titre, une valeur, un badge de trend coloré
 * - Un fond “vitreux” avec un cercle coloré en diagonale
 * - Une icône (remplie) avec un halo
 */
export default function StatCard({ icon: Icon, title, value, trend, color }) {
  // Récupère le thème si besoin
  const { theme } = useTheme();

  // Fond + bordure selon le thème
  const containerClass = theme === 'dark'
    ? 'bg-white/10 border-white/20 text-white'
    : 'bg-slate-100 border-slate-200 text-slate-800';

  // Sous-texte (titre) plus discret
  const subTextClass = theme === 'dark'
    ? 'text-gray-300'
    : 'text-slate-600';

  // Prépare les props du badge de trend
  const badgeProps = getTrendBadgeProps(trend);

  return (
    <div
      className={`
        relative overflow-hidden
        rounded-2xl backdrop-blur-xl p-6
        shadow-xl border hover:shadow-2xl
        transition-all duration-300 group
        ${containerClass}
      `}
    >
      {/* Cercle coloré en diagonale (fond) */}
      <div
        className="absolute -right-6 -top-6 w-24 h-24 blur-3xl rounded-full bg-opacity-50
                   group-hover:scale-150 transition-transform duration-500"
        style={{ backgroundColor: color }}
      />

      {/* Contenu principal */}
      <div className="flex items-start justify-between">
        {/* Titre + Valeur + Trend */}
        <div>
          <p className={`text-sm mb-1 ${subTextClass}`}>{title}</p>
          <h3 className="text-2xl font-bold mb-2">
            <CountUp end={Number(value)} duration={2} separator=" " />
          </h3>

          {/* Badge de trend (si trend existe) */}
          {badgeProps && (
            <div
              className={`
                inline-flex items-center gap-1
                px-2 py-1 rounded-full
                text-sm font-medium
                ${badgeProps.bgClass} ${badgeProps.textClass}
              `}
            >
              <badgeProps.Icon size={14} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Icône + halo */}
        <div className="relative flex items-center justify-center">
          {/* Halo coloré derrière l'icône */}
          <div className="absolute inset-0 rounded-full bg-violet blur opacity-30 transition duration-700" />
          {/* Icône (remplie, colorée) */}
          <Icon size={24} className="relative text-[#8B5CF6]" />
        </div>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired, // ex: FaUsers
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  trend: PropTypes.string,               // ex: "+12%", "-5%", "0%"
  color: PropTypes.string.isRequired     // Couleur pour le petit cercle (fond)
};
