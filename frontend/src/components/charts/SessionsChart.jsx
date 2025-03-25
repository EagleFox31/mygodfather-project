import React from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Enregistrer les composants Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SessionsChart = ({ trends }) => {
  if (!trends || !Array.isArray(trends)) {
    return <p className="text-center text-gray-500">Aucune donnée disponible</p>;
  }

  const labels = trends.map((item) => `Semaine ${item._id.week}`);
  const sessionData = trends.map((item) => item.sessions);

  const data = {
    labels,
    datasets: [
      {
        label: "Sessions de Mentorat",
        data: sessionData,
        backgroundColor: "rgba(230, 34, 68, 0.7)", // Couleur principale RVB
        borderColor: "rgb(230, 34, 68)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Évolution des Sessions" },
    },
  };

return (
  <div className="chart-container" style={{ width: '400px', height: '300px' }}>
    <Bar data={data} options={options} />
  </div>
);




};

// Validation des props avec PropTypes
SessionsChart.propTypes = {
  trends: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.shape({
        week: PropTypes.number.isRequired, // Valide que week est un number
      }).isRequired,
      sessions: PropTypes.number.isRequired, // Valide que sessions est un number
    })
  ).isRequired,
};

export default SessionsChart;
