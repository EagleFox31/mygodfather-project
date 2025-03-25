import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import userService from "../services/userService";

import {
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const WelcomeScreen = () => {
  const navigate = useNavigate();

  // On récupère 'user', 'setHasCompletedOnboarding' ET la valeur 'isAuthenticated'
  const { user, setHasCompletedOnboarding, hasCompletedOnboarding, isAuthenticated } = useAuth(); // CHANGED

  const [currentStep, setCurrentStep] = useState(0);

  // 1) Si pas authentifié, on redirige
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 2) Si déjà terminé côté front, on saute directement l’écran welcome
  //    Exemple : un useEffect qui check hasCompletedOnboarding 
  useEffect(() => {
    if (hasCompletedOnboarding) {
      console.log('🔎 Onboarding déjà terminé localement, redirection...');
      redirectToDashboard();
    }
  }, [hasCompletedOnboarding]);

  const steps = [
    {
      title: "Bienvenue dans My Godfather !",
      description: `Félicitations ${user?.prenom || "Admin"} ! Vous êtes maintenant inscrit(e) sur notre plateforme de mentorat. Découvrons ensemble les fonctionnalités clés qui vous aideront dans votre parcours.`,
      icon: Users
    },
    {
      title: "Votre Tableau de Bord",
      description: "Votre tableau de bord personnalisé vous permet de suivre vos progrès, gérer vos sessions et accéder à toutes les fonctionnalités importantes.",
      icon: CheckCircle
    },
    {
      title: "Sessions de Mentorat",
      description: "Planifiez et gérez facilement vos sessions de mentorat. Gardez une trace de vos objectifs et de votre progression.",
      icon: Calendar
    },
    {
      title: "Communication",
      description: "Restez en contact avec votre mentor/mentoré grâce à notre système de messagerie intégré et nos notifications en temps réel.",
      icon: MessageSquare
    }
  ];

  // Petite fonction pour rediriger selon le rôle
  const redirectToDashboard = () => {
    const role = user?.role?.toLowerCase();
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'rh':
        navigate('/dashboard-rh');
        break;
      case 'mentor':
        navigate('/dashboard-mentor');
        break;
      case 'mentore':
        navigate('/dashboard-mentore');
        break;
      default:
        navigate('/');
    }
  };

  // Au clic sur "suivant" ou "Commencer"
  const handleNext = async () => {
    // Tant qu'on n'est pas au dernier step, on avance
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    // Sinon on tente de valider l'onboarding
    else {
      try {
        await userService.completeOnboarding(); // PATCH /complete-onboarding
        setHasCompletedOnboarding(true); // On dit localement que c'est fini
        redirectToDashboard();           // Et on redirige
      } catch (error) {
        // 3) Si le serveur répond 400 avec "L'onboarding est déjà terminé ✅",
        //    on le traite comme un succès
        const msg = error?.response?.data?.message || '';
        if (msg.includes("L'onboarding est déjà terminé")) {
          console.log("⚠️ Onboarding déjà fait côté serveur. On synchronise localement.");
          setHasCompletedOnboarding(true);
          redirectToDashboard();
        } else {
          console.error('❌ Erreur mise à jour onboarding:', error);
        }
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const CurrentStepIcon = steps[currentStep].icon;

  // Si on arrive ici alors qu'hasCompletedOnboarding est true,
  // le useEffect s'occupera de nous rediriger. 
  // On peut éventuellement afficher un petit "Loading..." si on veut,
  // ou simplement rien.

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary-1 flex items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Indicateur de progression */}
        <div className="flex justify-center mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-16 mx-1 rounded-full transition-colors ${index <= currentStep ? 'bg-secondary-3' : 'bg-gray-200'
                }`}
            />
          ))}
        </div>

        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-secondary-3 bg-opacity-10 flex items-center justify-center">
            <CurrentStepIcon className="h-10 w-10 text-secondary-3" />
          </div>
        </div>

        {/* Contenu */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Boutons de navigation */}
        <div className="flex justify-center space-x-4">
          {currentStep > 0 && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Précédent
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-secondary-3 text-white rounded-lg hover:bg-secondary-2 transition-colors flex items-center"
          >
            <span>{currentStep === steps.length - 1 ? "Commencer" : "Suivant"}</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>

        {/* Bouton "Passer" */}
        {currentStep < steps.length - 1 && (
          <button
            onClick={() => setCurrentStep(steps.length - 1)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Passer l&apos;introduction
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
