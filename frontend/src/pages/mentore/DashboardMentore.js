import React, { useState, useEffect } from "react";
import { FaChartLine, FaStar, FaCheckCircle } from "react-icons/fa";
import Button from "../../components/UI/Button";
import Spinner from "../../components/UI/Spinner";

// Components
const ProgressBar = ({ percentage, color }) => (
  <div className="relative pt-1">
    <div className="flex mb-2 items-center justify-between">
      <div>
        <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-${color}`}>
          Progression du parcours
        </span>
      </div>
      <div className="text-right">
        <span className={`text-xs font-semibold inline-block text-${color}`}>
          {percentage}%
        </span>
      </div>
    </div>
    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
      <div
        style={{ width: `${percentage}%` }}
        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-${color}`}
      />
    </div>
  </div>
);

const MentorProfile = () => (
  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
    <div className="w-16 h-16 rounded-full bg-secondary-3 flex items-center justify-center">
      <span className="text-white text-xl font-bold">JD</span>
    </div>
    <div>
      <h4 className="font-semibold text-lg">Jean Dupont</h4>
      <p className="text-gray-600">Senior Developer</p>
      <p className="text-sm text-gray-500 mt-2">10 ans d'expérience</p>
      <div className="flex items-center mt-2">
        <FaStar className="text-yellow-400" />
        <span className="ml-1 text-sm text-gray-600">4.8/5 (15 avis)</span>
      </div>
    </div>
  </div>
);

const NextSession = () => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h4 className="font-semibold">Point de suivi mensuel</h4>
        <p className="text-sm text-gray-600">15 Mars 2024 - 14:00</p>
      </div>
      <Button color="secondary">Voir détails</Button>
    </div>
    <div className="text-sm text-gray-600">
      <p>Objectifs de la session :</p>
      <ul className="list-disc list-inside mt-2">
        <li>Revue des objectifs du mois</li>
        <li>Point sur les difficultés rencontrées</li>
        <li>Définition des prochaines étapes</li>
      </ul>
    </div>
  </div>
);

const ObjectivesList = () => (
  <div className="space-y-4">
    {[
      { title: "Maîtrise de React", progress: 75, status: "En cours" },
      { title: "Gestion de projet", progress: 90, status: "Complété" },
      { title: "Communication d'équipe", progress: 60, status: "En cours" }
    ].map((objective, idx) => (
      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{objective.title}</span>
          <span className={`text-sm ${
            objective.status === "Complété" ? "text-green-500" : "text-secondary-3"
          }`}>
            {objective.status}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-full rounded-full ${
              objective.status === "Complété" ? "bg-green-500" : "bg-secondary-3"
            }`}
            style={{ width: `${objective.progress}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

const DashboardMentore = () => {
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
        <h2 className="text-primary text-3xl font-bold mb-6">Mon Parcours Mentoré</h2>

        {/* Progression */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-primary text-xl font-semibold mb-4">Ma Progression</h3>
          <ProgressBar percentage={65} color="secondary-3" />
        </div>

        {/* Mon Mentor */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-primary text-xl font-semibold mb-4">Mon Mentor</h3>
          <MentorProfile />
        </div>

        {/* Prochaine Session */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-primary text-xl font-semibold mb-4">Prochaine Session</h3>
          <NextSession />
        </div>

        {/* Objectifs */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-primary text-xl font-semibold mb-4">Mes Objectifs</h3>
          <ObjectivesList />
        </div>

        {/* Actions Rapides */}
        <div className="flex gap-4">
          <Button color="primary">Demander une Session</Button>
          <Button color="secondary">Contacter mon Mentor</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardMentore;
