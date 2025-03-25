import React, { useState } from "react";

const OnboardingMentoree = () => {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    careerGoals: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profil complété !");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Complétez votre profil</h2>
        
        <label className="block mb-2">Nom</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2 border rounded mb-3" />

        <label className="block mb-2">Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full p-2 border rounded mb-3" />

        <label className="block mb-2">Objectifs de carrière</label>
        <textarea name="careerGoals" value={form.careerGoals} onChange={handleChange} className="w-full p-2 border rounded mb-3" />

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Finaliser</button>
      </form>
    </div>
  );
};

export default OnboardingMentoree;
