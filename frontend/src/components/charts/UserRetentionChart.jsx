import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const UserRetentionChart = () => {
  const [data, setData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    // Fetch user retention data from the backend
    const fetchRetentionData = async () => {
      try {
        const response = await fetch('/api/user-retention'); // Adjust the API endpoint as necessary
        const result = await response.json();
        
        const labels = result.map(item => item.date); // Assuming the API returns dates
        const retentionRates = result.map(item => item.retentionRate); // Assuming the API returns retention rates

        setData({
          labels,
          datasets: [
            {
              label: "User Retention Rate (%)",
              data: retentionRates,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching retention data:", error);
      }
    };

    fetchRetentionData();
  }, []);

  return (
    <div className="chart-container" style={{ width: '100%', height: '300px' }}>
      <h3 className="text-center text-lg font-semibold mb-4">User Retention Rate Over Time</h3>
      <Line data={data} />
    </div>
  );
};

UserRetentionChart.propTypes = {
  // Define any props if necessary
};

export default UserRetentionChart;
