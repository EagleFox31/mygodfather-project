import React, { useState } from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    title: "Bienvenue sur MY GODFATHER",
    description: "Votre parcours de mentorat commence ici. Nous allons vous guider à travers quelques étapes pour personnaliser votre expérience."
  },
  {
    id: 2,
    title: "Votre Profil",
    description: "Aidez-nous à mieux vous connaître pour vous proposer le meilleur matching possible."
  },
  {
    id: 3,
    title: "Vos Objectifs",
    description: "Définissez vos objectifs de développement professionnel."
  },
  {
    id: 4,
    title: "Préférences de Mentorat",
    description: "Précisez vos attentes concernant la relation de mentorat."
  }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    department: '',
    experience: '',
    interests: [],
    mentorshipGoals: '',
    availability: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              src="../assets/welcome.png"
              alt="Welcome"
              className="w-64 h-64 mx-auto"
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-800">Commençons l'aventure</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                MY GODFATHER va vous aider à trouver le mentor idéal pour votre développement professionnel.
              </p>
            </motion.div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Votre rôle actuel
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Ex: Développeur Full Stack"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              >
                <option value="">Sélectionnez un département</option>
                <option value="tech">Tech</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Commercial</option>
                <option value="hr">Ressources Humaines</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Années d'expérience
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Ex: 3"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectifs de développement
              </label>
              <textarea
                name="mentorshipGoals"
                value={formData.mentorshipGoals}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
                placeholder="Décrivez vos objectifs professionnels..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centres d'intérêt professionnels
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['Leadership', 'Technical Skills', 'Communication', 'Project Management'].map((interest) => (
                  <label key={interest} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      onChange={(e) => {
                        const newInterests = e.target.checked
                          ? [...formData.interests, interest]
                          : formData.interests.filter(i => i !== interest);
                        setFormData({ ...formData, interests: newInterests });
                      }}
                      checked={formData.interests.includes(interest)}
                    />
                    <span className="text-sm text-gray-700">{interest}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilité pour le mentorat
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              >
                <option value="">Sélectionnez votre disponibilité</option>
                <option value="weekly">1 fois par semaine</option>
                <option value="biweekly">1 fois toutes les 2 semaines</option>
                <option value="monthly">1 fois par mois</option>
              </select>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Prochaines étapes</h3>
              <p className="text-sm text-blue-600">
                Une fois votre profil complété, notre algorithme vous proposera les meilleurs matchs de mentors 
                en fonction de vos objectifs et de votre expérience.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center ${step.id === currentStep ? 'text-indigo-600' : 'text-gray-400'}`}
              >
                <span className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                  step.id === currentStep
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : step.id < currentStep
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-gray-300'
                }`}>
                  {step.id < currentStep ? '✓' : step.id}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
            />
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={currentStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>

          <div className="mb-8">
            {renderStepContent(currentStep)}
          </div>

          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              Précédent
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (currentStep < steps.length) {
                  setCurrentStep(currentStep + 1);
                } else {
                  // Fin de l'onboarding : traitement de la complétion
                  console.log('Onboarding completed:', formData);
                }
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90"
            >
              {currentStep === steps.length ? 'Terminer' : 'Suivant'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
