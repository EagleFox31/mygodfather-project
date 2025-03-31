// src/pages/dashboard/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Services d'appel HTTP
import statisticsService from '../../services/statisticsService';

// Icônes Solid de react-icons
import { 
  FaUsers, 
  FaUserCheck, 
  FaCalendarAlt, 
  FaComments, 
  FaUserPlus, 
  FaClock, 
  FaAward, 
  FaExclamationTriangle,
  FaArrowRight
} from 'react-icons/fa';

// Composants internes
import StatCard from '../../components/card/StatCard';
import DoughnutChart from '../../components/charts/DoughnutChart';
import Loader from '../../components/Loader'; // <-- On importe le Loader !

// Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

function HaloIcon({ Icon, size = 20 }) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Halo en dégradé */}
      <div className="
        absolute inset-0 rounded-full
        bg-gradient-to-r from-[#FF294D] to-[#005795]
        blur opacity-30 transition duration-700
      " />
      {/* Icône avec une couleur unie pour la lisibilité */}
      <Icon size={size} className="relative text-blue-900" />
    </div>
  );
}

function getActivityIcon(type) {
  switch (type) {
    case 'user':
      return FaUsers;
    case 'session':
      return FaClock;
    case 'matching':
      return FaAward;
    case 'message':
      return FaComments;
    default:
      return FaExclamationTriangle;
  }
}

// getThemeClasses : applique le swirl
function getThemeClasses(theme) {
  if (theme === 'dark') {
    return `
      min-h-screen
      bg-gradient-conic-tr
      from-swirl-primary-900/20 via-swirl-secondary-900/20 to-neutral-dark
      text-white
      backdrop-blur-2xl
      p-6
    `;
  } else {
    return `
      min-h-screen
      bg-gradient-conic-tr
      from red to blue
      text-slate-700
      backdrop-blur-2xl
      p-8
    `;
  }
}

// formatTrend : formatte la variation en pourcentage
const formatTrend = (value) => {
  if (value === 0) return "0%";
  return value > 0 ? `+${value}%` : `${value}%`;
};

export default function DashboardAdmin() {
  // On force le thème à "light" ici
  const theme = 'light';
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les stats, la distribution et les récentes activités
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsData, distData, recentData] = await Promise.all([
          statisticsService.getDashboardStats({ period: 'month' }),
          statisticsService.getMatchingDistribution({ period: 'month' }),
          statisticsService.getRecentActivity({ limit: 5, offset: 0 })
        ]);
        setStats(statsData);
        setDistribution(distData.distribution || []);
        setRecentActivities(recentData.data || []);
      } catch (err) {
        setError(err.message || "Erreur lors de la récupération des statistiques");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    // On affiche le Loader
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500">Erreur : {error}</div>;
  }

  if (!stats) {
    return <div className="text-slate-800">Aucune donnée disponible.</div>;
  }

  // Extraction des données
  const totalUsers = (stats.users?.mentors?.total || 0) + (stats.users?.mentees?.total || 0);
  const activeMentors = stats.users?.mentors?.active || 0;
  const sessionsToday = stats.sessions?.today || 0;
  const messagesCount = stats.messages?.totalToday || 0;
  const matchingRate = stats.matching?.success_rate || 0;
  const sessionCompletion = stats.sessions?.completion_rate || 0;
  const mentorAvailability = stats.users?.mentors?.availability_rate || 0;
  const avgFeedbackScore = Math.round((stats.feedback?.avg_score || 0) * 20);
  const totalMentors = stats.users?.mentors?.total || 0;
  const totalMentees = stats.users?.mentees?.total || 0;
  let ratioText = "N/A";
  if (totalMentors && totalMentees) {
    ratioText = `1:${Math.round(totalMentees / totalMentors)}`;
  }

  const userTrend = stats.trends?.users ?? 0;
  const mentorsTrend = stats.trends?.activeMentors ?? 0;
  const sessionsTrend = stats.trends?.sessionsToday ?? 0;
  const messagesTrend = stats.trends?.messagesToday ?? 0;

  const headingClass = theme === 'dark' ? "text-alert" : "text-secondary-2";
  const subHeadingClass = theme === 'dark' ? "text-alert-light" : "text-secondary-2/70";

  const cardClass = `
    rounded-2xl
    p-6
    shadow-2xl
    border
    backdrop-blur-xl
    ${theme === 'dark'
      ? 'bg-white/10 border-white/20 text-white'
      : 'bg-slate-100 border-slate-200 text-slate-800'
    }
  `;

  return (
    <div className={getThemeClasses(theme)}>
      <div className="space-y-8">
        
        {/* SECTION 1 : StatCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={() => <HaloIcon Icon={FaUsers} size={24} />}
            title="Total Users"
            value={totalUsers.toString()}
            trend={formatTrend(userTrend)}
            color="blue"
          />
          <StatCard
            icon={() => <HaloIcon Icon={FaUserCheck} size={24} />}
            title="Active Mentors"
            value={activeMentors.toString()}
            trend={formatTrend(mentorsTrend)}
            color="blue"
          />
          <StatCard
            icon={() => <HaloIcon Icon={FaCalendarAlt} size={24} />}
            title="Sessions This Month"
            value={sessionsToday.toString()}
            trend={formatTrend(sessionsTrend)}
            color="blue"
          />
          <StatCard
            icon={() => <HaloIcon Icon={FaComments} size={24} />}
            title="Messages"
            value={messagesCount.toString()}
            trend={formatTrend(messagesTrend)}
            color="blue"
          />
        </div>

        {/* SECTION 2 : Matching Distribution + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matching Distribution */}
          <div className="lg:col-span-2">
            <div className={cardClass}>
              <h3 className={`text-xl font-semibold mb-4 ${headingClass}`}>
                Matching Distribution
              </h3>
              {distribution.length === 0 ? (
                <div>No data</div>
              ) : (
                <div className="flex justify-center">
                  <BarChart width={400} height={350} data={distribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme === 'dark' ? "#4A5568" : "#CBD5E1"}
                    />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: theme === 'dark' ? '#fff' : '#475569' }}
                      label={{
                        value: "Plage de scores",
                        position: "insideBottom",
                        offset: -3,
                        fill: theme === 'dark' ? '#fff' : '#475569'
                      }}
                    />
                    <YAxis
                      tick={{ fill: theme === 'dark' ? '#fff' : '#475569' }}
                      allowDecimals={false}
                      label={{
                        value: "Nombre de match",
                        angle: -90,
                        position: "outsideLeft",
                        fill: theme === 'dark' ? '#fff' : '#475569'
                      }}
                    />
                    <Tooltip
                      wrapperStyle={{
                        backgroundColor: theme === 'dark' ? '#1A202C' : '#F1F5F9',
                        border: 'none'
                      }}
                      labelStyle={{
                        color: theme === 'dark' ? '#fff' : '#000'
                      }}
                      itemStyle={{
                        color: theme === 'dark' ? '#fff' : '#000'
                      }}
                      labelFormatter={(label) => `${label}%`}
                      formatter={(value, name) => [
                        value,
                        name === 'count' ? 'Nombre de match' : name
                      ]}
                    />
                    <Bar dataKey="count" fill="indigo" />
                  </BarChart>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={cardClass}>
            <h3 className={`text-xl font-semibold mb-4 ${headingClass} flex items-center justify-between`}>
              <span>Recent Activity</span>
              <button
                onClick={() => navigate('/recent-activity')}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                Voir plus <FaArrowRight className="ml-1" />
              </button>
            </h3>

            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center text-sm">No recent activity</div>
              ) : (
                recentActivities.map((activity, i) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={i}
                      className={`
                        flex items-center gap-3 transition-colors cursor-pointer p-2 rounded-lg
                        ${theme === 'dark' ? 'text-white/80 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-200'}
                      `}
                    >
                      <HaloIcon Icon={ActivityIcon} size={16} />
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 : DoughnutCharts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>
              Matching Rate
            </h3>
            <div className="flex items-center justify-center">
              <DoughnutChart
                percentage={matchingRate}
                color="#10B981"
                label="Success Rate"
              />
            </div>
          </div>
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>
              Session Completion
            </h3>
            <div className="flex items-center justify-center">
              <DoughnutChart
                percentage={sessionCompletion}
                color="#F59E0B"
                label="Completed"
              />
            </div>
          </div>
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>
              Mentor Availability
            </h3>
            <div className="flex items-center justify-center">
              <DoughnutChart
                percentage={mentorAvailability}
                color="#8B5CF6"
                label="Available"
              />
            </div>
          </div>
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>
              Feedback Score
            </h3>
            <div className="flex items-center justify-center">
              <DoughnutChart
                percentage={avgFeedbackScore}
                color="#EC4899"
                label="Positive"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4 : Mentor/Mentee Ratio + KPI Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={cardClass}>
            <h3 className={`text-xl font-semibold mb-4 ${headingClass}`}>
              Mentor/Mentee Ratio
            </h3>
            <div className="relative h-40 w-40 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold">{ratioText}</p>
                  <p className={`text-sm ${subHeadingClass}`}>Current Ratio</p>
                </div>
              </div>
              {/* Cercle décoratif */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '8px solid transparent',
                  background: `
                    linear-gradient(#fff, #fff) content-box,
                    linear-gradient(to bottom, red, #005795) border-box
                  `,
                  mask: 'linear-gradient(#fff, #fff) content-box, linear-gradient(#fff, #fff)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  borderRadius: '50%'
                }}
              />
            </div>
          </div>

          <div className={cardClass}>
            <h3 className={`text-xl font-semibold mb-4 ${headingClass}`}>
              KPI Alerts
            </h3>
            <div className="space-y-4">
              {[
                { label: "Matching Rate", value: matchingRate, color: "bg-green-500" },
                { label: "Session Completion", value: sessionCompletion, color: "bg-yellow-500" },
                { label: "Feedback Rate", value: avgFeedbackScore, color: "bg-blue-500" },
              ].map((kpi, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{kpi.label}</span>
                    <span>{kpi.value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${kpi.color} transition-all duration-500`}
                      style={{ width: `${kpi.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
