// src/pages/rh/DashboardRH.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaClock,
  FaCalendar,
  FaStar,
  FaFileImport,
  FaChartBar,
  FaUserTie,
  FaUserGraduate,
  FaExclamationTriangle,
  FaMedal,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';

import rhService from '../../services/rhService'; // Service pour stats et paires
import statisticsService from '../../services/statisticsService'; // Pour getMatchingDistribution etc.
import Button from '../../components/UI/Button';
import Spinner from '../../components/UI/Spinner';
import BarChart from '../../components/charts/BarChart';

/**
 * HaloIcon : icône entourée d'un halo dégradé
 */
function HaloIcon({ Icon, size = 20 }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF294D] to-[#005795] blur opacity-30" />
      <Icon size={size} className="relative text-blue-900" />
    </div>
  );
}

/**
 * StatCard : carte KPI générique avec animation CountUp
 * + hover:scale-105 pour un léger zoom au survol
 */
const StatCard = ({ title, value, icon: Icon, suffix = '' }) => (
  <div
    className="
      rounded-2xl p-4 shadow-xl border bg-white/40 border-slate-200
      backdrop-blur-xl text-slate-800 flex flex-col gap-2
      transition-transform duration-300 hover:scale-105
    "
  >
    <div className="flex items-center justify-between">
      <HaloIcon Icon={Icon} size={24} />
      <div className="text-2xl font-bold text-blue-900">
        <CountUp end={Number(value)} duration={2} separator="," />
        {suffix}
      </div>
    </div>
    <h4 className="text-sm text-slate-600">{title}</h4>
  </div>
);

/**
 * MatchingList : liste des paires en attente (matching)
 */
const MatchingList = ({ pendingPairs = [] }) => {
  if (!pendingPairs.length) {
    return <p>Aucun matching en attente pour le moment.</p>;
  }
  return (
    <div className="space-y-4">
      {pendingPairs.map((pair) => {
        const mentor = pair.mentor_id || {};
        const mentee = pair.mentee_id || {};
        return (
          <div
            key={pair._id}
            className="
              flex items-center justify-between p-4 bg-white/50
              backdrop-blur rounded-lg shadow
              transition-transform duration-300 hover:scale-[1.02]
            "
          >
            <div>
              <h4 className="font-semibold text-slate-800">
                {mentee.prenom} {mentee.name}
              </h4>
              {mentor._id ? (
                <p className="text-sm text-slate-500 mt-1">
                  Mentor proposé : {mentor.prenom} {mentor.name}
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  En attente d’un mentor
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                En attente
              </span>
              <Button color="secondary" className="mt-2 text-sm">
                Voir détails
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * MentoratList : tableau des paires actives
 */
const MentoratList = ({ activePairs = [] }) => {
  if (!activePairs.length) {
    return <p>Aucune paire active pour le moment.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase">
            <th className="px-6 py-3">Mentor</th>
            <th className="px-6 py-3">Mentoré</th>
            <th className="px-6 py-3">Création</th>
            <th className="px-6 py-3">Statut</th>
          </tr>
        </thead>
        <tbody className="bg-white/40 backdrop-blur divide-y divide-slate-200 text-slate-800">
          {activePairs.map((pair) => {
            const mentor = pair.mentor_id || {};
            const mentee = pair.mentee_id || {};
            return (
              <tr
                key={pair._id}
                className="
                  transition-transform duration-300 hover:scale-[1.01]
                "
              >
                <td className="px-6 py-4">
                  {mentor.prenom} {mentor.name}
                </td>
                <td className="px-6 py-4">
                  {mentee.prenom} {mentee.name}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(pair.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const DashboardRH = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pendingPairs, setPendingPairs] = useState([]);
  const [activePairs, setActivePairs] = useState([]);
  const [matchingDistribution, setMatchingDistribution] = useState(null);

  // Pour la transition d'apparition (fade-in)
  const [isMounted, setIsMounted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        // 1) Récupérer les statistiques globales du dashboard
        const dashboardStats = await rhService.getDashboardStats({ period: 'month' });
        setStats(dashboardStats);

        // 2) Récupérer les paires en attente (matching)
        const pending = await rhService.getPendingPairs({ limit: 5 });
        setPendingPairs(pending);

        // 3) Récupérer les paires actives
        const active = await rhService.getActivePairs();
        setActivePairs(active);

        // 4) Récupérer la distribution des scores de matching
        const matchingDist = await statisticsService.getMatchingDistribution({ period: 'month' });
        setMatchingDistribution(matchingDist);
      } catch (error) {
        console.error('Erreur chargement Dashboard RH:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Déclenche l'animation au montage du composant
  useEffect(() => {
    // On passe isMounted à true après un cycle pour la transition
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Spinner />;

  // Extraction des KPI pour les paires et sessions
  const activePairCount = activePairs.length;
  const pendingPairCount = pendingPairs.length;
  const sessionsThisMonth = stats?.sessions?.total || 0;
  const satisfactionRate = stats?.feedback?.satisfaction_rate || 0;

  // Extraction des KPI pour les utilisateurs
  const totalMentors = stats?.users?.mentors?.total || 0;
  const totalMentees = stats?.users?.mentees?.total || 0;
  const waitingMentees = stats?.users?.mentees?.waiting || 0;
  const lastMatchingScore = stats?.matching?.last_score ?? 0;

  // Préparation des données pour le BarChart (distribution)
  const distributionLabels = matchingDistribution?.distribution?.map((item) => item.range) || [];
  const distributionData = matchingDistribution?.distribution?.map((item) => item.count) || [];

  return (
    <div
      className={`
        min-h-screen bg-gradient-conic-tr from-red-50 via-blue-50 to-slate-100 
        text-slate-800 p-8 space-y-10 flex flex-col 
        transition-opacity duration-700 ${isMounted ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <h2 className="text-3xl font-bold mb-4">Tableau de bord RH</h2>

      {/* KPI Cards pour paires et sessions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Paires actives" value={activePairCount} icon={FaUsers} />
        <StatCard title="Paires en attente" value={pendingPairCount} icon={FaClock} />
        <StatCard title="Sessions / mois" value={sessionsThisMonth} icon={FaCalendar} />
        <StatCard title="Satisfaction" value={`${satisfactionRate}%`} icon={FaStar} />
      </div>

      {/* KPI Cards pour utilisateurs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Mentors" value={totalMentors} icon={FaUserTie} />
        <StatCard title="Total Mentorés" value={totalMentees} icon={FaUserGraduate} />
        <StatCard
          title="Mentorés sans mentor"
          value={waitingMentees}
          icon={FaExclamationTriangle}
        />
        <StatCard
          title="Dernier score de matching"
          value={`${lastMatchingScore}%`}
          icon={FaMedal}
        />
      </div>

      {/* Bloc Distribution des scores de matching */}
      <div className="p-6 rounded-xl bg-white/50 backdrop-blur shadow-xl space-y-4">
        <h3 className="text-xl font-semibold">Distribution des scores de matching</h3>
        {distributionLabels.length > 0 ? (
          <BarChart labels={distributionLabels} data={distributionData} />
        ) : (
          <p>Aucune donnée de distribution pour le moment.</p>
        )}
      </div>

      {/* Bloc "Matching en attente" */}
      <div className="p-6 rounded-xl bg-white/50 backdrop-blur shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Matching en attente</h3>
          <Button onClick={() => navigate('/matching')} color="primary">
            Nouveau matching
          </Button>
        </div>
        <MatchingList pendingPairs={pendingPairs} />
      </div>

      {/* Bloc "Paires actives" */}
      <div className="p-6 rounded-xl bg-white/50 backdrop-blur shadow-xl space-y-4">
        <h3 className="text-xl font-semibold">Mentorats actifs</h3>
        <MentoratList activePairs={activePairs} />
      </div>

      {/* Actions diverses */}
      <div className="flex gap-4">
        <Button color="secondary">
          <FaFileImport className="inline-block mr-2" />
          Importer un fichier Excel
        </Button>
        <Button color="secondary" onClick={() => navigate('/stats-rh')}>
          <FaChartBar className="inline-block mr-2" />
          Statistiques détaillées
        </Button>
      </div>
    </div>
  );
};

export default DashboardRH;
