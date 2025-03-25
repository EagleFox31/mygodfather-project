// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          loginTitle: "Sign In",
          email: "Email",
          password: "Password",
          forgotPassword: "Forgot password?",
          rememberMe: "Remember me",
          signIn: "Sign In",
          or: "OR",
          newUser: "First time?",
          createAccount: "Create your account",
          codeMFA: "Enter 6-digit code",
          verify: "Verify",
          googleSignIn: "Sign in with Google",
          githubSignIn: "Sign in with GitHub",
          recaptcha: "Please confirm you are human",
          joinTitle: "Join MY GODFATHER!",
          joinSubtitle:
            "Accelerate new hires onboarding with an intelligent mentoring program.",
          userTooltip1: "A great mentorship!",
          userTooltip2: "I love being mentored!",
          userTooltip3: "An enriching experience!",
        },
      },
      fr: {
        translation: {
          loginTitle: "Connexion",
          email: "Email",
          password: "Mot de passe",
          forgotPassword: "Mot de passe oublié ?",
          rememberMe: "Se souvenir de moi",
          signIn: "Se connecter",
          or: "OU",
          newUser: "Première connexion ?",
          createAccount: "Créez votre compte",
          codeMFA: "Code à 6 chiffres",
          verify: "Vérifier",
          googleSignIn: "Se connecter avec Google",
          githubSignIn: "Se connecter avec GitHub",
          recaptcha: "Veuillez confirmer que vous êtes humain",
          joinTitle: "Rejoignez MY GODFATHER !",
          joinSubtitle:
            "Accélérez l’intégration des nouvelles recrues avec un programme de mentorat intelligent.",
          userTooltip1: "Un super mentorat !",
          userTooltip2: "J'adore le mentorat !",
          userTooltip3: "Une expérience enrichissante !",
        },
      },
    },
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
