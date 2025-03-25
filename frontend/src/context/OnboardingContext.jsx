import React, { createContext, useContext, useState, useEffect } from 'react';

// Création du contexte
const OnboardingContext = createContext();

// Provider qui englobe l’application
export function OnboardingProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(() => {
    return parseInt(localStorage.getItem("onboarding_step")) || 0;
  });

  // Sauvegarde la progression
  useEffect(() => {
    localStorage.setItem("onboarding_step", currentStep.toString());
  }, [currentStep]);

  return (
    <OnboardingContext.Provider value={{ currentStep, setCurrentStep }}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useOnboarding() {
  return useContext(OnboardingContext);
}
