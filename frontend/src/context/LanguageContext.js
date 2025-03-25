import React, { createContext, useState, useContext, useEffect } from "react";

// Création du contexte
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("language") || "en" // Persiste la langue choisie
  );

  useEffect(() => {
    localStorage.setItem("language", language); // Mise à jour automatique
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personnalisé
export function useLanguage() {
  return useContext(LanguageContext);
}
