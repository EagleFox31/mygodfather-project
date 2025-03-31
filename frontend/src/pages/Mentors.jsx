import React, { useEffect, useState, Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid';
import userService from '../services/userService';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // État pour stocker les ID des mentors sélectionnés
  const [selectedMentors, setSelectedMentors] = useState([]);

  // Récupération du currentUser (pour savoir s'il est admin)
  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = currentUser?.role === 'admin';

  // Récupération des mentors et du currentUser depuis le service
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const mentorsData = await userService.fetchMentors();
        setMentors(mentorsData);
        const user = await userService.fetchCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erreur récupération mentors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Cocher/décocher un mentor
  const handleSelect = (mentorId) => {
    setSelectedMentors((prev) => {
      if (prev.includes(mentorId)) {
        return prev.filter((id) => id !== mentorId);
      } else {
        return [...prev, mentorId];
      }
    });
  };

  // Sélectionner / déselectionner tous les mentors
  const handleSelectAll = () => {
    if (selectedMentors.length === mentors.length) {
      setSelectedMentors([]);
    } else {
      const allIds = mentors.map((m) => m._id);
      setSelectedMentors(allIds);
    }
  };

  // Suppression en masse (bulk delete)
  const handleDeleteSelected = async () => {
    try {
      await userService.deleteUsers(selectedMentors);
      alert('Les mentors sélectionnés ont été supprimés.');
      setMentors((prev) => prev.filter((m) => !selectedMentors.includes(m._id)));
      setSelectedMentors([]);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression.');
    }
  };

  if (loading) return <p className="p-4">Chargement des mentors...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Bandeau de sélection si admin */}
      {isAdmin && selectedMentors.length > 0 && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 p-4 rounded-md">
          <div className="text-gray-700 text-sm font-medium">
            {selectedMentors.length} Selected
          </div>
          <button
            onClick={handleDeleteSelected}
            className="px-4 py-2 rounded bg-pink-500 text-white hover:bg-pink-600 text-sm font-medium"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Breadcrumbs */}
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex items-center space-x-2">
          <li>
            <div className="flex items-center">
              <a href="#" className="text-gray-500 hover:text-gray-700">
                User Management
              </a>
              <svg
                className="h-5 w-5 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </li>
          <li className="text-gray-500">Mentors List</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Liste des mentors</h1>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export
          </button>
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Nouveau matching
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mt-2">
        <input
          type="search"
          placeholder="Search user..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M9 17a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
      </div>

      {/* Tableau des mentors */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              {/* Checkbox globale */}
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedMentors.length === mentors.length && mentors.length > 0}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                UTILISATEUR
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RÔLE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DERNIÈRE CONNEXION
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CONNEXION 2 ÉTAPES ACTIVÉE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DATE DE CRÉATION
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ONBOARDING
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {mentors.map((mentor) => {
              const isChecked = selectedMentors.includes(mentor._id);
              return (
                <tr key={mentor._id}>
                  {/* Checkbox par mentor */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleSelect(mentor._id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </td>
                  {/* Utilisateur (avatar, nom, email) */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {mentor.avatarUrl ? (
                          <img
                            src={mentor.avatarUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-medium">
                            {mentor.prenom ? mentor.prenom[0] : 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {mentor.prenom} {mentor.name}
                        </div>
                        <div className="text-gray-500 text-xs">{mentor.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* Rôle */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-800 capitalize">
                      {mentor.role || 'Mentor'}
                    </span>
                  </td>
                  {/* Dernière connexion */}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {mentor.last_login ? new Date(mentor.last_login).toLocaleString() : 'N/A'}
                  </td>
                  {/* Connexion 2 étapes */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                      Enabled
                    </span>
                  </td>
                  {/* Date de création */}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  {/* Onboarding */}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {mentor.hasCompletedOnboarding ? 'Terminé' : 'En attente'}
                  </td>
                  {/* Actions : 2 icônes inline */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => console.log('Edit mentor', mentor._id)}
                      className="text-gray-500 hover:text-gray-700 mr-2"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => console.log('Delete mentor', mentor._id)}
                      className="text-gray-500 hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
