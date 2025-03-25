import React from "react";
import PropTypes from "prop-types";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const MatchingChart = ({ matching }) => {
  // Vérifier si les données sont valides avant de générer le graphique
  if (!matching || typeof matching.successful !== "number" || typeof matching.total !== "number") {
    return <p className="text-center text-gray-500">Aucune donnée disponible</p>;
  }

  const data = {
    labels: ["Matchings Réussis", "Matchings Échoués"],
    datasets: [
      {
        data: [matching.successful, matching.total - matching.successful],
        backgroundColor: ["#e62244", "#f5b7b1"], // Couleurs en harmonie avec le thème
        borderWidth: 1,
      },
    ],
  };

  return (
<div className="chart-container" style={{ width: '100%', height: '300px', padding: '10px' }}>

      <h3 className="text-center text-lg font-semibold mb-4">Répartition des Matchings</h3>
      <Doughnut data={data} />
    </div>
  );
};

// Validation des props avec PropTypes
MatchingChart.propTypes = {
  matching: PropTypes.shape({
    successful: PropTypes.number.isRequired, // Vérifie que c'est un nombre
    total: PropTypes.number.isRequired, // Vérifie que c'est un nombre
  }).isRequired,
};

export default MatchingChart;
