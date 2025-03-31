// pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import userService from '../services/userService';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Champs modifiables
  const [prenom, setPrenom] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const currentUser = await userService.fetchCurrentUser();
        setUser(currentUser);
        setPrenom(currentUser.prenom || '');
        setName(currentUser.name || '');
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      const updatedData = { prenom, name };
      // Appel API pour mettre à jour le profil
      await userService.updateProfile(updatedData);
      alert('Profil mis à jour avec succès');
    } catch (err) {
      console.error('Erreur mise à jour du profil:', err);
      alert('Impossible de mettre à jour le profil');
    }
  }

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur introuvable.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
      <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="prenom" className="block font-medium">Prénom</label>
          <input
            type="text"
            id="prenom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="name" className="block font-medium">Nom</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <p className="font-medium">Email :</p>
          <p className="text-gray-700">{user.email || 'Non renseigné'}</p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Mettre à jour
        </button>
      </form>
    </div>
  );
}

export default Profile;
