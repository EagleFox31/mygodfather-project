import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';
import CountUp from 'react-countup';

export function DoughnutChart({ percentage, size = 180, label }) {
  const { theme } = useTheme();

  const strokeWidth = size * 0.18; // plus épais
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // ✅ Couleur dynamique selon score
  let progressColor = '#DC2626'; // Rouge (0-40)
  if (percentage >= 70) progressColor = '#10B981'; // Vert
  else if (percentage >= 41) progressColor = '#F59E0B'; // Orange

  // Couleur de fond du cercle
  const backgroundStroke = theme === 'dark'
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(100, 116, 139, 0.1)'; // slate-500/10

  // Couleurs du texte
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-800';
  const subTextColor = theme === 'dark' ? 'text-white/70' : 'text-slate-600';

  return (
    <div className="relative inline-flex items-center justify-center group w-full">
      {/* Halo (effet de glow) */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-300 via-blue-300 to-indigo-300 rounded-full blur-2xl opacity-30" />

      {/* Cercle SVG */}
      <svg width={size} height={size} className="transform -rotate-90 relative z-10">
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundStroke}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          className="transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>

      {/* Texte au centre */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className={`text-3xl font-bold ${textColor}`}>
          <CountUp start={0} end={percentage} duration={1.8} suffix="%" />
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
