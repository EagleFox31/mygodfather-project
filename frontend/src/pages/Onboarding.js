import React from 'react';
import { useLocation } from 'react-router-dom';
import OnboardingFlow from '../components/Onboarding/OnboardingFlow';

export default function Onboarding() {
  const location = useLocation();
  // Si location.state n'est pas défini, on peut fournir des valeurs par défaut.
  const { role = 'mentee', theme = 'dark', language = 'en' } = location.state || {};

  return <OnboardingFlow role={role} theme={theme} language={language} />;
}
