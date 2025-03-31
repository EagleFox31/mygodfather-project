// pages/Mentees.jsx
import React, { useEffect, useState } from 'react';

function Mentees() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentees() {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/users?role=mentee');
        const data = await response.json();
        if (data.success) {
          setMentees(data.data);
        }
      } catch (err) {
        console.error('Erreur fetch mentees:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMentees();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Liste des mentorés</h1>
      {mentees.length === 0 ? (
        <p>Aucun mentoré trouvé.</p>
      ) : (
        <ul className="space-y-2">
          {mentees.map((mentee) => (
            <li key={mentee._id} className="p-2 border-b">
              {mentee.prenom} {mentee.name} – {mentee.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Mentees;
