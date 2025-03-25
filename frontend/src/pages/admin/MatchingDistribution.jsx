// /src/pages/admin/MatchingDistribution.jsx
import React, { useEffect, useState } from 'react';
import statisticsService from '../../services/statisticsService';

// Recharts
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function MatchingDistribution() {
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        // ex: distribution sur la dernière semaine
        const data = await statisticsService.getMatchingDistribution({ period: 'month' });
        // data.distribution = [ { range: '0 - 10', count: 5 }, ... ]
        setDistribution(data.distribution);
      } catch (err) {
        setError(err.message || 'Erreur lors de la récupération de la distribution');
      } finally {
        setLoading(false);
      }
    };
    fetchDistribution();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Matching Distribution (scores)</h2>
      <BarChart width={600} height={300} data={distribution}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#8884d8" />
      </BarChart>
    </div>
  );
}
