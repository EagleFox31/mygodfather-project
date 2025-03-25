import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TestOnboardingSelector() {
  const navigate = useNavigate();

  // Définition des profils de test
  const profiles = [
    { role: 'super_admin', theme: 'dark', language: 'en' },
    { role: 'hr',          theme: 'light', language: 'fr' },
    { role: 'mentor',      theme: 'dark', language: 'en' },
    { role: 'mentee',      theme: 'light', language: 'fr' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Sélectionnez un profil d'onboarding</h1>
      {profiles.map((profile, index) => (
        <button
          key={index}
          onClick={() => navigate('/onboarding', { state: profile })}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {profile.role.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
