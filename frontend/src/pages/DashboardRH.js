import React, { useState, useEffect } from "react";
import { FaUsers, FaClock, FaCalendar, FaStar, FaFileImport, FaChartBar } from "react-icons/fa";
import Button from "../components/UI/Button";
import Spinner from "../components/UI/Spinner";

// Components
const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-${color} bg-opacity-10 p-4 rounded-lg`}>
    <div className="flex items-center justify-between mb-2">
      <Icon className={`text-${color} text-2xl`} />
      <span className="text-2xl font-bold text-primary">{value}</span>
    </div>
    <h4 className="text-sm text-gray-600">{title}</h4>
  </div>
);

const MatchingList = () => (
  <div className="space-y-4">
    {[
      { mentee: "Sophie Bernard", skills: ["React", "Node.js"], exp: "2 ans", status: "En attente" },
      { mentee: "Thomas Martin", skills: ["Python", "Data Science"], exp: "3 ans", status: "Suggestion disponible" }
    ].map((match, idx) => (
      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-semibold">{match.mentee}</h4>
          <div className="flex gap-2 mt-1">
            {match.skills.map((skill, i) => (
              <span key={i} className="text-xs bg-secondary-4 bg-opacity-20 text-secondary-4 px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">Expérience: {match.exp}</p>
        </div>
        <div className="text-right">
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
            match.status === "En attente" 
              ? "bg-yellow-100 text-yellow-800" 
              : "bg-green-100 text-green-800"
          }`}>
            {match.status}
          </span>
          <Button color="secondary" className="mt-2">Voir suggestions</Button>
        </div>
      </div>
    ))}
  </div>
);

const MentoratList = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Mentor
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Mentoré
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Progression
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Dernière Session
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Statut
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {[
          { mentor: "Jean Dupont", mentore: "Alice Martin", progression: 85, lastSession: "2024-03-01", status: "Actif" },
          { mentor: "Marie Dubois", mentore: "Lucas Bernard", progression: 60, lastSession: "2024-02-28", status: "En pause" }
        ].map((pair, idx) => (
          <tr key={idx}>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-medium text-gray-900">{pair.mentor}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="font-medium text-gray-900">{pair.mentore}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="w-full h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-secondary-3 rounded-full" 
                  style={{ width: `${pair.progression}%` }}
                />
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {pair.lastSession}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                pair.status === "Actif" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {pair.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const DashboardRH = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => setLoading(false), 1500);
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="d-flex">
      <div className="container mt-3 bg-white shadow-md p-4 rounded-lg">
        {/* En-tête */}
        <h2 className="text-primary text-3xl font-bold mb-6">Tableau de bord RH</h2>

        {/* Stats Globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            title="Paires Actives"
            value="12"
            icon={FaUsers}
            color="secondary-3"
          />
          <StatCard 
            title="En Attente"
            value="5"
            icon={FaClock}
            color="secondary-4"
          />
          <StatCard 
            title="Sessions/Mois"
            value="45"
            icon={FaCalendar}
            color="secondary-5"
          />
          <StatCard 
            title="Taux Satisfaction"
            value="92%"
            icon={FaStar}
            color="primary"
          />
        </div>

        {/* Matching en Attente */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-primary text-xl font-semibold">Matching en Attente</h3>
            <Button color="primary">Nouveau Matching</Button>
          </div>
          <MatchingList />
        </div>

        {/* Liste des Mentorats */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-primary text-xl font-semibold mb-4">Mentorats Actifs</h3>
          <MentoratList />
        </div>

        {/* Actions Rapides */}
        <div className="flex gap-4">
          <Button color="secondary">
            <FaFileImport className="inline-block mr-2" />
            Import Excel
          </Button>
          <Button color="secondary">
            <FaChartBar className="inline-block mr-2" />
            Statistiques
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardRH;
