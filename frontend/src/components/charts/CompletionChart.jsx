import React from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CompletionChart = ({ sessions }) => {
  // Vérifier si les données sont valides avant de générer le graphique
  if (!sessions || !Array.isArray(sessions.trends)) {
    return <p className="text-center text-gray-500">Aucune donnée disponible</p>;
  }

  const labels = sessions.trends.map((item) => `Semaine ${item._id.week}`);
  const completionRate = sessions.trends.map((item) =>
    item.sessions > 0 ? (item.completedSessions / item.sessions) * 100 : 0
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Taux de Complétion (%)",
        data: completionRate,
        borderColor: "rgb(230, 34, 68)",
        backgroundColor: "rgba(230, 34, 68, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Taux de Complétion des Sessions" },
    },
  };

return (
  <div className="chart-container" style={{ width: '400px', height: '300px' }}>
    <Line data={data} options={options} />
  </div>
);

};

// Validation des props avec PropTypes
CompletionChart.propTypes = {
  sessions: PropTypes.shape({
    trends: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.shape({
          week: PropTypes.number.isRequired, // Vérifie que week est un nombre
        }).isRequired,
        sessions: PropTypes.number.isRequired, // Vérifie que sessions est un nombre
        completedSessions: PropTypes.number.isRequired, // Vérifie que completedSessions est un nombre
      })
    ).isRequired,
  }).isRequired,
};

export default CompletionChart;
