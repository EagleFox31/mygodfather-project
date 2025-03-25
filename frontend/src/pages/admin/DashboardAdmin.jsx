import React, { useEffect, useState } from 'react';
// Services d'appel HTTP
import statisticsService from '../../services/statisticsService';

// Icônes Lucide
import {
  Users,
  UserCheck,
  Calendar,
  MessageSquare,
  UserPlus,
  Clock,
  Award,
  AlertTriangle
} from 'lucide-react';

// Composants internes (avec CountUp inclus)
import StatCard from '../../components/card/StatCard';
import DoughnutChart from '../../components/charts/DoughnutChart';

// Recharts
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

// Theme Context
import { useTheme } from '../../context/ThemeContext';

// Helper: swirl background
function getThemeClasses(theme) {
  if (theme === 'dark') {
    // Swirl + text blanc + effet vitre
    return `
      min-h-screen
      bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))]
      from-[#FF294D]/10 via-[#005795]/10 to-[#1a1f35]/40
      text-white
      backdrop-blur-2xl
      p-6
    `;
  } else {
    // Swirl plus clair
    return `
      min-h-screen
      bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))]
      from-[#FF294D]/5 via-[#005795]/5 to-slate-50
      text-slate-800
      backdrop-blur-2xl
      p-6
    `;
  }
}

// Petite fonction pour formater la tendance
const formatTrend = (value) => {
  if (value === 0) return "0%";
  return value > 0 ? `+${value}%` : `${value}%`;
};

export default function DashboardAdmin() {
  const { theme } = useTheme();

  const [stats, setStats] = useState(null);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [statsData, distData] = await Promise.all([
          statisticsService.getDashboardStats({ period: 'month' }),
          statisticsService.getMatchingDistribution({ period: 'month' })
        ]);
        setStats(statsData);
        setDistribution(distData.distribution || []);
      } catch (err) {
        setError(err.message || "Erreur lors de la récupération des statistiques");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return <div className={theme === 'dark' ? "text-white" : "text-slate-800"}>Chargement des stats...</div>;
  }
  if (error) {
    return <div className={theme === 'dark' ? "text-red-400" : "text-red-700"}>Erreur : {error}</div>;
  }
  if (!stats) {
    return <div className={theme === 'dark' ? "text-white" : "text-slate-800"}>Aucune donnée disponible.</div>;
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

  // Tendance
  const userTrend = stats.trends?.users ?? 0;
  const mentorsTrend = stats.trends?.activeMentors ?? 0;
  const sessionsTrend = stats.trends?.sessionsToday ?? 0;
  const messagesTrend = stats.trends?.messagesToday ?? 0;

  // Titres : rouge en dark, bleu en light
  const headingClass = theme === 'dark' ? "text-[#FF294D]" : "text-[#005795]";
  const subHeadingClass = theme === 'dark' ? "text-[#FF294D]/70" : "text-[#005795]/70";

  // Classes “carte” (fond blanc/clair ou vitreux)
  const cardClass = `
    rounded-2xl
    p-6
    shadow-xl
    border
    backdrop-blur-xl
    ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'}
  `;

  return (
    <div className={getThemeClasses(theme)}>
      <div className="space-y-8">

        {/* SECTION 1 : StatCards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            title="Total Users"
            value={totalUsers.toString()}
            trend={formatTrend(userTrend)}
            color="#FF294D"
          />
          <StatCard
            icon={UserCheck}
            title="Active Mentors"
            value={activeMentors.toString()}
            trend={formatTrend(mentorsTrend)}
            color="#FF294D"
          />
          <StatCard
            icon={Calendar}
            title="Sessions This Month"
            value={sessionsToday.toString()}
            trend={formatTrend(sessionsTrend)}
            color="#FF294D"
          />
          <StatCard
            icon={MessageSquare}
            title="Messages"
            value={messagesCount.toString()}
            trend={formatTrend(messagesTrend)}
            color="#FF294D"
          />
        </div>

        {/* SECTION 2 : Matching Distribution + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Matching Distribution */}
          <div className="lg:col-span-2">
            <div className={cardClass}>
              <h3 className={`text-xl font-semibold mb-4 ${headingClass}`}>Matching Distribution</h3>
              {distribution.length === 0 ? (
                <div>No data</div>
              ) : (
                <div className="flex justify-center">
                  <BarChart width={400} height={350} data={distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#4A5568" : "#CBD5E1"} />
                    <XAxis
                      dataKey="range"
                      tick={{ fill: theme === 'dark' ? '#fff' : '#475569' }}
                      label={{
                        value: "Plage de scores",
                        position: "insideBottom",
                        offset: -3,
                        fill: theme === 'dark' ? '#fff' : '#475569',
                      }}
                    />
                    <YAxis
                      tick={{ fill: theme === 'dark' ? '#fff' : '#475569' }}
                      allowDecimals={false}
                      label={{
                        value: "Nombre de match",
                        angle: -90,
                        position: "outsideLeft",
                        fill: theme === 'dark' ? '#fff' : '#475569',
                      }}
                    />
                    <Tooltip
                      wrapperStyle={{
                        backgroundColor: theme === 'dark' ? '#1A202C' : '#F1F5F9',
                        border: 'none'
                      }}
                      labelStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                      itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                      labelFormatter={(label) => `${label}%`}
                      formatter={(value, name) => [value, name === 'count' ? 'Nombre de match' : name]}
                    />
                    <Bar dataKey="count" fill="#FF294D" />
                  </BarChart>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className={cardClass}>
            <h3 className={`text-xl font-semibold mb-4 ${headingClass}`}>Recent Activity</h3>
            <div className="space-y-4">
              {[
                { icon: UserPlus, text: "New mentor joined: Sarah Miller", time: "2m ago" },
                { icon: Clock, text: "Session completed: Web Development", time: "15m ago" },
                { icon: Award, text: "New matching score: 95%", time: "1h ago" },
                { icon: AlertTriangle, text: "Mentee waiting for 48h", time: "2h ago" }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-colors cursor-pointer p-2 rounded-lg
                    ${theme === 'dark'
                      ? 'text-white/80 hover:bg-white/5'
                      : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  <item.icon size={16} />
                  <div className="flex-1">
                    <p className="text-sm">{item.text}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 3 : DoughnutCharts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Matching Rate */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>Matching Rate</h3>
            <div className="flex items-center justify-center">
              <DoughnutChart percentage={matchingRate} color="#10B981" label="Success Rate" />
            </div>
          </div>
          {/* Session Completion */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>Session Completion</h3>
            <div className="flex items-center justify-center">
              <DoughnutChart percentage={sessionCompletion} color="#F59E0B" label="Completed" />
            </div>
          </div>
          {/* Mentor Availability */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>Mentor Availability</h3>
            <div className="flex items-center justify-center">
              <DoughnutChart percentage={mentorAvailability} color="#8B5CF6" label="Available" />
            </div>
          </div>
          {/* Feedback Score */}
          <div className={cardClass}>
            <h3 className={`text-lg font-semibold mb-6 ${headingClass}`}>Feedback Score</h3>
            <div className="flex items-center justify-center">
              <DoughnutChart percentage={avgFeedbackScore} color="#EC4899" label="Positive" />
            </div>
          </div>
        </div>

       {/* SECTION 4 : Mentor/Mentee Ratio + KPI Alerts */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Mentor/Mentee Ratio */}
  <div className={cardClass}>
    <h3 className={`text-xl font-semibold mb-4 ${headingClass}`}>Mentor/Mentee Ratio</h3>
    <div className="relative h-40 w-40 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-bold">{ratioText}</p>
          <p className={`text-sm ${subHeadingClass}`}>Current Ratio</p>
        </div>
      </div>
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
  {/* KPI Alerts */}
  <div className={cardClass}>
    <h3 className={`text-xl font-semibold mb-4 ${headingClass}`}>KPI Alerts</h3>
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
  