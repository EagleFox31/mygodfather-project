import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Bell
} from 'lucide-react';
import Layout from '../components/Layout';

const HomeAuthenticated = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  // Cartes de statistiques selon le rôle
  const getStatCards = () => {
    switch (user?.role?.toLowerCase()) {
      case 'mentor':
        return [
          { title: 'Mentorés actifs', value: '3', icon: Users, color: 'bg-secondary-3' },
          { title: 'Sessions ce mois', value: '12', icon: Calendar, color: 'bg-secondary-4' },
          { title: 'Messages non lus', value: '5', icon: MessageSquare, color: 'bg-secondary-5' },
          { title: 'Taux de progression', value: '85%', icon: TrendingUp, color: 'bg-primary' }
        ];
      case 'mentore':
        return [
          { title: 'Sessions réalisées', value: '8', icon: Calendar, color: 'bg-secondary-3' },
          { title: 'Objectifs atteints', value: '4', icon: TrendingUp, color: 'bg-secondary-4' },
          { title: 'Messages non lus', value: '2', icon: MessageSquare, color: 'bg-secondary-5' },
          { title: 'Progression globale', value: '60%', icon: TrendingUp, color: 'bg-primary' }
        ];
      case 'rh':
        return [
          { title: 'Paires actives', value: '15', icon: Users, color: 'bg-secondary-3' },
          { title: 'Sessions ce mois', value: '45', icon: Calendar, color: 'bg-secondary-4' },
          { title: 'Matchings en attente', value: '7', icon: MessageSquare, color: 'bg-secondary-5' },
          { title: 'Taux de satisfaction', value: '92%', icon: TrendingUp, color: 'bg-primary' }
        ];
      default:
        return [];
    }
  };

  // Notifications récentes
  const recentNotifications = [
    {
      id: 1,
      title: 'Nouvelle session planifiée',
      description: 'Session de mentorat prévue pour le 15 mars à 14h00',
      time: 'Il y a 1 heure'
    },
    {
      id: 2,
      title: 'Message reçu',
      description: 'Nouveau message de votre mentor/mentoré',
      time: 'Il y a 3 heures'
    },
    {
      id: 3,
      title: 'Objectif atteint',
      description: 'Félicitations ! Vous avez atteint votre objectif mensuel',
      time: 'Il y a 1 jour'
    }
  ];

  return (
    <Layout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* En-tête de bienvenue */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenue, {user?.prenom} {user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Voici un aperçu de votre activité récente et de vos prochaines actions.
          </p>
        </motion.div>

        {/* Cartes de statistiques */}
        <motion.div 
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {getStatCards().map((card, index) => (
            <div 
              key={index}
              className={`${card.color} bg-opacity-10 p-6 rounded-lg`}
            >
              <div className="flex items-center justify-between">
                <card.icon className={`h-8 w-8 ${card.color.replace('bg-', 'text-')}`} />
                <span className="text-2xl font-bold text-gray-800">{card.value}</span>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-600">{card.title}</h3>
            </div>
          ))}
        </motion.div>

        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Actions rapides */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/sessions/new')}
                  className="p-4 border border-secondary-3 rounded-lg hover:bg-secondary-3 hover:text-white transition-colors"
                >
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Planifier une session</span>
                </button>
                <button 
                  onClick={() => navigate('/messages')}
                  className="p-4 border border-secondary-4 rounded-lg hover:bg-secondary-4 hover:text-white transition-colors"
                >
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <span>Envoyer un message</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Notifications récentes */}
          <motion.div variants={itemVariants}>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Notifications récentes</h2>
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start">
                      <Bell className="h-5 w-5 text-secondary-3 mt-1" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium">{notification.title}</h3>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default HomeAuthenticated;
