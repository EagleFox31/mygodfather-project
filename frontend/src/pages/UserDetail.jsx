// src/pages/UserDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../services/userService';
// import scheduleService from '../services/scheduleService'; // si tu as un service pour les sessions

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Par ex. sessions de mentoring
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUser(true);
        // Appel API pour récupérer l'utilisateur
        const fetchedUser = await userService.getUserById(id);
        setUser(fetchedUser);
      } catch (error) {
        console.error('Erreur en récupérant le user :', error);
      } finally {
        setLoadingUser(false);
      }

      try {
        setLoadingSessions(true);
        // Par ex., récupérer le programme de sessions de mentoring
        // const userSessions = await scheduleService.getUserSessions(id);
        // setSessions(userSessions);

        // Adapte selon ton vrai service. Pour l'exemple, on met un mock :
        setSessions([
          {
            _id: 'ses_1',
            date: '2025-04-10T10:00:00Z',
            sujet: 'Préparation CV',
            status: 'Plannifiée',
          },
          {
            _id: 'ses_2',
            date: '2025-04-17T14:00:00Z',
            sujet: 'Simulation d’entretien',
            status: 'Plannifiée',
          },
        ]);
      } catch (error) {
        console.error('Erreur en récupérant les sessions :', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchData();
  }, [id]);

  const handleGoBack = () => {
    navigate(-1); // retour à la page précédente
  };

  if (loadingUser) {
    return <p className="p-4">Chargement de l’utilisateur...</p>;
  }
  if (!user) {
    return (
      <div className="p-4">
        <p className="text-red-500">Utilisateur introuvable ou erreur serveur.</p>
        <button
          onClick={handleGoBack}
          className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb ou Header simple */}
      <div>
        <button
          onClick={handleGoBack}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Retour
        </button>
      </div>

      {/* Carte de profil utilisateur */}
      <div className="bg-white shadow p-6 rounded-md flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <span className="text-3xl text-gray-500">
              {user.prenom ? user.prenom[0] : 'U'}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">
            {user.prenom} {user.name}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-2 flex items-center space-x-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              Role: {user.role}
            </span>
            {user.hasCompletedOnboarding ? (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                Onboarding terminé
              </span>
            ) : (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Onboarding en attente
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section "User Schedule" (programme de session) */}
      <div className="bg-white shadow p-6 rounded-md">
        <h3 className="text-lg font-bold mb-4">Programme de mentoring</h3>
        {loadingSessions ? (
          <p>Chargement des sessions...</p>
        ) : sessions.length === 0 ? (
          <p>Aucune session prévue pour le moment.</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-500 uppercase text-left">
                <th className="py-2 px-4">Date</th>
                <th className="py-2 px-4">Sujet</th>
                <th className="py-2 px-4">Statut</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-200">
              {sessions.map((session) => (
                <tr key={session._id}>
                  <td className="py-2 px-4">
                    {new Date(session.date).toLocaleString()}
                  </td>
                  <td className="py-2 px-4">{session.sujet}</td>
                  <td className="py-2 px-4">
                    <span
                      className={
                        session.status === 'Plannifiée'
                          ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
                          : 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs'
                      }
                    >
                      {session.status}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button className="text-blue-600 hover:text-blue-900 mr-2">
                      Voir
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      Annuler
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
