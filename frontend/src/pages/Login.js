// src/Login.js
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Sun,
  Moon,
  Globe2,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { translations } from './translations';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupération des traductions
  const t = translations[language] || translations.en;

  // Labels pour le dropdown de langue
  const languageNames = {
    en: 'English',
    fr: 'Français',
    zh: '中文',
    ja: '日本語',
    ar: 'العربية'
  };

  // Réinitialiser l’erreur dès qu’un champ change
  useEffect(() => {
    setFormError('');
  }, [email, password]);

  const validateForm = () => {
    if (!email || !password) {
      setFormError(t.login.allFieldsRequired || "Tous les champs sont requis");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError(t.login.invalidEmail || "Format d'email invalide");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const result = await login(email, password);
      if (result.success) {
        const role = result.user.role.toLowerCase();
        let redirectPath;
        switch (role) {
          case 'admin':
            redirectPath = '/admin/dashboard';
            break;
          case 'rh':
            redirectPath = '/dashboard-rh';
            break;
          case 'mentor':
            redirectPath = '/dashboard-mentor';
            break;
          case 'mentore':
            redirectPath = '/dashboard-mentore';
            break;
          default:
            redirectPath = '/dashboard';
        }
        const intendedPath = location.state?.from?.pathname;
        navigate(intendedPath || redirectPath);
      }
    } catch (error) {
      setFormError(error.message || "Erreur lors de la connexion");
    }
  };

  // Variants d'animation Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const displayError = formError || authError;

  return (
    <div
      className={`min-h-screen ${theme === 'dark'
        ? 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1f35] to-slate-900'
        : 'bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-slate-100 to-slate-50'
        } flex items-center justify-center p-4 ${language === 'ar' ? 'rtl' : 'ltr'}`}
    >
      {/* Bouton de retour */}
      <div className="absolute top-8 left-8 flex items-center space-x-4">
        <Link
          to="/"
          className={`flex items-center space-x-2 ${theme === 'dark'
            ? 'text-white/80 hover:text-white'
            : 'text-slate-600 hover:text-slate-800'
            } transition-all duration-200`}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t.nav.back}</span>
        </Link>
      </div>

      {/* Boutons Thème & Langue */}
      <div className="absolute top-8 right-8 flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full ${theme === 'dark'
            ? 'bg-white/10 hover:bg-white/20'
            : 'bg-slate-200 hover:bg-slate-300'
            } transition-all duration-200`}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 text-white" />
          ) : (
            <Moon className="h-5 w-5 text-slate-800" />
          )}
        </button>
        <div className="relative group">
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${theme === 'dark'
              ? 'text-white/80 hover:text-white bg-white/10 hover:bg-white/20'
              : 'text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300'
              } transition-all`}
          >
            <Globe2 className="h-5 w-5" />
            <span>{languageNames[language] || 'Unknown'}</span>
          </button>
          <div
            className={`absolute right-0 mt-2 w-48 ${theme === 'dark' ? 'bg-white/10' : 'bg-white'
              } backdrop-blur-xl rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}
          >
            {Object.entries(languageNames).map(([code, name]) => (
              <button
                key={code}
                onClick={() => setLanguage(code)}
                className={`w-full px-4 py-2 text-left ${theme === 'dark'
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  } transition-all`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Carte de Login (glassmorphism) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`w-full max-w-md ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-white'
          } backdrop-blur-xl p-8 rounded-2xl border ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'
          } relative overflow-hidden`}
      >
        {/* Pour le thème sombre, on conserve le gradient overlay */}
        {theme === 'dark' && (
          <div className="absolute inset-0 bg-gradient-to-r from-[rgb(230,34,68)]/15 to-[rgb(0,87,149)]/15" />
        )}

        {/* Icône et Titre */}
        {theme === 'dark' ? (
          <>
            {/* Icône en rouge pour le thème sombre */}
            <motion.div variants={itemVariants} className="relative flex justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-[rgb(230,34,68)] rounded-full blur opacity-30"></div>
                <Users className="relative h-12 w-12 text-[rgb(230,34,68)]" />
              </div>
            </motion.div>
            {/* Titre en rouge pour le thème sombre */}
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-center mb-8 text-[rgb(230,34,68)]"
            >
              {t.login.title}
            </motion.h2>
          </>
        ) : (
          <>
            {/* Icône en rouge pour le thème clair */}
            <motion.div variants={itemVariants} className="relative flex justify-center mb-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-[rgb(230,34,68)] rounded-full blur opacity-30"></div>
                <Users className="relative h-12 w-12 text-[rgb(230,34,68)]" />
              </div>
            </motion.div>
            {/* Titre en bleu pour le thème clair */}
            <motion.h2
              variants={itemVariants}
              className="text-2xl font-bold text-center mb-8 text-[rgb(0,87,149)]"
            >
              {t.login.title}
            </motion.h2>
          </>
        )}

        {/* Message d'erreur */}
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800 flex items-center"
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-sm">{displayError}</span>
          </motion.div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6 relative">
          {/* Champ Email */}
          <motion.div variants={itemVariants}>
            <label
              className={`block text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'} mb-2`}
            >
              {t.login.email}
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg ${theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
                  } border focus:ring-2 focus:ring-[rgb(0,87,149)] focus:border-transparent transition-all duration-200`}
                placeholder={t.login.emailPlaceholder}
              />
            </div>
          </motion.div>

          {/* Champ Mot de passe */}
          <motion.div variants={itemVariants}>
            <label
              className={`block text-sm font-medium ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'} mb-2`}
            >
              {t.login.password}
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-2 rounded-lg ${theme === 'dark'
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
                  } border focus:ring-2 focus:ring-[rgb(0,87,149)] focus:border-transparent transition-all duration-200`}
                placeholder={t.login.passwordPlaceholder}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme === 'dark'
                  ? 'text-white/40 hover:text-white/60'
                  : 'text-slate-400 hover:text-slate-600'
                  } transition-colors duration-200`}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </motion.div>

          {/* "Remember me" & "Forgot password?" */}
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-[rgb(0,87,149)] rounded border-gray-300 focus:ring-[rgb(0,87,149)]"
              />
              <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>
                {t.login.rememberMe}
              </span>
            </label>
            <button
              onClick={() => navigate('/forgot-password')}
              className={`text-sm transition-colors duration-200 ${theme === 'dark'
                ? 'text-[rgb(230,34,68)] hover:text-[rgb(230,34,68)]'
                : 'text-[rgb(0,87,149)] hover:text-[rgb(54,60,90)]'
                }`}
            >
              {t.login.forgotPassword}
            </button>
          </motion.div>

          {/* Bouton "Sign In" (gradient rouge → bleu) */}
          <motion.button
            variants={itemVariants}
            type="submit"
            className="w-full relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[rgb(230,34,68)] to-[rgb(0,87,149)] rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative px-6 py-3 bg-gradient-to-r from-[rgb(230,34,68)] to-[rgb(0,87,149)] text-white rounded-lg transition-all duration-200 flex items-center justify-center hover:shadow-xl hover:scale-[1.01]">
              {t.login.signIn}
            </div>
          </motion.button>

          {/* Lien "No Account? Sign up" */}
          <motion.p
            variants={itemVariants}
            className={`text-center text-sm ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}
          >
            {t.login.noAccount}{' '}
            <a
              onClick={() => navigate('/onboarding', { state: { role: 'mentee', theme, language } })}
              className={`cursor-pointer transition-colors duration-200 ${theme === 'dark'
                ? 'text-[rgb(230,34,68)] hover:text-[rgb(230,34,68)]'
                : 'text-[rgb(0,87,149)] hover:text-[rgb(54,60,90)]'
                }`}
            >
              {t.login.signUp}
            </a>
          </motion.p>
        </form>
      </motion.div>
    </div>
  );
}

export default Login;
