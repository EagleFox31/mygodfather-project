import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import CountUp from 'react-countup';

export function DoughnutChart({ percentage, size = 120, label }) {
  const { theme } = useTheme();
  
  const strokeWidth = size * 0.2;
  const radius = (size - strokeWidth) / 1;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Couleur du trait principal selon le thème
  const strokeColor = theme === 'dark' ? 'white' : '#005795';


  // Couleur du "cercle" de fond (derrière la barre de progression)
  // Note : Tu peux aussi conditionner la couleur en mode clair si tu veux
  const backgroundStroke = 'rgba(40, 37, 211, 0.1)';

  // Couleurs du texte en fonction du thème
  const mainTextColor = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const subTextColor = theme === 'dark' ? 'text-white/70' : 'text-slate-600';

  return (
    <div className="relative inline-flex items-center justify-center group">
      {/* Halo coloré en fond (optionnel) */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-300 to-blue-300
 rounded-full blur-xl transform group-hover:scale-110 transition-transform duration-500" />
      
      {/* SVG “doughnut” */}
      <svg width={size} height={size} className="transform -rotate-90 relative">
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundStroke}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Cercle “actif” */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Texte au centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${mainTextColor}`}>
           <CountUp end={percentage} duration={2} />%
        </span>
        <span className={`text-sm ${subTextColor}`}>
          {label}
        </span>
      </div>
    </div>
  );
}

DoughnutChart.propTypes = {
  percentage: PropTypes.number.isRequired,
  size: PropTypes.number,
  label: PropTypes.string.isRequired,
};

export default DoughnutChart;
