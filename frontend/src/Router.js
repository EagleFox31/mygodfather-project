import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Routes publiques
import Home from "./pages/Home";
import HomeAuthenticated from "./pages/HomeAuthenticated";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import WelcomeScreen from "./pages/WelcomeScreen";

// Layouts
import Layout from "./components/Layout";
import AdminLayout from "./components/layout/AdminLayout";

// Dashboards
import DashboardRH from "./pages/rh/DashboardRH";
import DashboardMentor from "./pages/mentor/DashboardMentor";
import DashboardMentore from "./pages/mentore/DashboardMentore";
import DashboardAdmin from "./pages/admin/DashboardAdmin";

// Nouvelles pages
import Mentors from "./pages/Mentors";
import Mentees from "./pages/Mentees";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

import TestOnboardingSelector from "./TestOnboardingSelector";
import PropTypes from "prop-types";

// Composant de protection des routes avec user passé en prop
const ProtectedRoute = ({ children, roles, user }) => {
  const { isAuthenticated, hasCompletedOnboarding } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Si l'onboarding n'est pas terminé, rediriger vers l'écran Welcome (sauf pour certaines routes)
  if (
    !hasCompletedOnboarding &&
    !["/login", "/", "/onboarding", "/welcome", "/unauthorized"].includes(
      location.pathname
    )
  ) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
  }),
};

const HomeRoute = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    if (user?.role?.toLowerCase() === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <HomeAuthenticated />;
  }
  return <Home />;
};

const Router = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Route d'accueil dynamique */}
      <Route path="/" element={<HomeRoute />} />

      {/* Routes publiques */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/welcome" replace /> : <Login />}
      />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/test-onboarding" element={<TestOnboardingSelector />} />

      {/* Routes Admin */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["admin"]} user={user}>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<DashboardAdmin />} />
                {/* Ajoutez d'autres routes admin ici */}
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Routes RH */}
      <Route
        path="/dashboard-rh"
        element={
          <ProtectedRoute roles={["rh"]} user={user}>
            <Layout>
              <DashboardRH />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Routes Mentor */}
      <Route
        path="/dashboard-mentor"
        element={
          <ProtectedRoute roles={["mentor"]} user={user}>
            <Layout>
              <DashboardMentor />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Routes Mentoré */}
      <Route
        path="/dashboard-mentore"
        element={
          <ProtectedRoute roles={["mentore"]} user={user}>
            <Layout>
              <DashboardMentore />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Nouvelles pages accessibles à tout utilisateur authentifié */}
      <Route
        path="/mentors"
        element={
          <ProtectedRoute user={user}>
            <Layout>
              <Mentors />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentees"
        element={
          <ProtectedRoute user={user}>
            <Layout>
              <Mentees />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute user={user}>
            <Layout>
              <Messages />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute user={user}>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Welcome Screen après onboarding */}
      <Route
        path="/welcome"
        element={
          !isAuthenticated ? <Navigate to="/login" replace /> : <WelcomeScreen />
        }
      />

      {/* Page non autorisée */}
      <Route
        path="/unauthorized"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-4">
                Accès non autorisé
              </h1>
              <p className="text-gray-600 mb-4">
                Vous n&apos;avez pas les permissions nécessaires pour accéder à
                cette page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary-1"
              >
                Retour
              </button>
            </div>
          </div>
        }
      />

      {/* Route 404 */}
      <Route
        path="*"
        element={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Page non trouvée
              </h1>
              <p className="text-gray-600 mb-4">
                La page que vous recherchez n&apos;existe pas.
              </p>
              <button
                onClick={() => window.history.back()}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary-1"
              >
                Retour
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default Router;
