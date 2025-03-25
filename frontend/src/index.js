import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "./i18n";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext"; // Import du contexte de langue
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from "./context/NotificationContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <LanguageProvider> {/* Ajout du LanguageProvider ici */}
      <ThemeProvider>
        <NotificationProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </NotificationProvider>
      </ThemeProvider>
    </LanguageProvider>
  </AuthProvider>
);

reportWebVitals();
