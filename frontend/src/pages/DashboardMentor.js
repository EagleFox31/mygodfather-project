import React, { useState, useEffect } from "react";
import { FaUsers, FaCalendar, FaChartLine } from "react-icons/fa";
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

const SessionsList = () => (
  <div className="space-y-4">
    {[
      { date: "2024-03-15", mentore: "Alice Martin", type: "Suivi mensuel" },
      { date: "2024-03-20", mentore: "Marc Durand", type: "Point objectifs" }
    ].map((session, idx) => (
      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="font-semibold">{session.mentore}</p>
          <p className="text-sm text-gray-600">{session.type}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-secondary-3">{session.date}</p>
        </div>
      </div>
    ))}
  </div>
);

const MentoresList = () => (
  <div className="space-y-4">
    {[
      { name: "Alice Martin", progress: "85%", lastSession: "2024-03-01" },
      { name: "Marc Durand", progress: "60%", lastSession: "2024-02-28" },
      { name: "Sophie Bernard", progress: "45%", lastSession: "2024-02-25" }
    ].map((mentore, idx) => (
      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="font-semibold">{mentore.name}</p>
          <div className="w-32 h-2 bg-gray-200 rounded-full mt-2">
            <div 
              className="h-full bg-secondary-3 rounded-full" 
              style={{ width: mentore.progress }}
            />
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Dernière session</p>
          <p className="text-sm text-secondary-3">{mentore.lastSession}</p>
        </div>
      </div>
    ))}
  </div>
);

const DashboardMentor = () => {
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
        <h2 className="text-primary text-3xl font-bold mb-6">Tableau de bord Mentor</h2>

        {/* Stats Rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Mentorés Actifs"
            value="3"
            icon={FaUsers}
            color="secondary-3"
          />
          <StatCard 
            title="Sessions ce mois"
            value="8"
            icon={FaCalendar}
            color="secondary-4"
          />
          <StatCard 
            title="Taux de complétion"
            value="85%"
            icon={FaChartLine}
            color="secondary-5"
          />
        </div>

        {/* Prochaines Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-primary text-xl font-semibold mb-4">Prochaines Sessions</h3>
          <SessionsList />
        </div>

        {/* Liste des Mentorés */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-primary text-xl font-semibold mb-4">Mes Mentorés</h3>
          <MentoresList />
        </div>

        {/* Actions Rapides */}
        <div className="flex gap-4">
          <Button color="primary">Planifier une Session</Button>
          <Button color="secondary">Messages</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardMentor;
