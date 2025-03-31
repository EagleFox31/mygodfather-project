// src/components/charts/BarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ labels, data, totalCount }) => {
  // Si totalCount est fourni, on calcule les pourcentages pour chaque bucket,
  // puis on divise par 10 pour que l'axe Y soit de 0 à 10.
  const datasetData = totalCount
    ? data.map((count) => Math.round((count / totalCount) * 100) / 10)
    : data;

  const chartData = {
    labels,
    datasets: [
      {
        label: totalCount ? 'Pourcentage de matchs (0-10)' : 'Nombre de matchs',
        data: datasetData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: totalCount
          ? 'Distribution des scores de matching (en échelle 0-10)'
          : 'Distribution des scores de matching',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10, // Axe Y fixé de 0 à 10
        ticks: {
          callback: (value) => value,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
