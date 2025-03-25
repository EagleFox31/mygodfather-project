import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Composant affichant une notification sous forme de toast avec animation.
 * @param {Object} props
 * @param {Object} props.notification - Données de la notification.
 * @param {Function} props.onRemove - Fonction pour retirer la notification.
 */
const NotificationToast = ({ notification, onRemove }) => {
  useEffect(() => {
    // Auto-remove notification après 5 secondes
    const timer = setTimeout(() => {
      onRemove(notification._id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification._id, onRemove]);

  /**
   * Définit la couleur en fonction du type de notification
   * @returns {string} Classes Tailwind CSS pour le style
   */
  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-600 border-green-400';
      case 'error':
        return 'bg-red-600 border-red-400';
      case 'warning':
        return 'bg-yellow-600 border-yellow-400';
      case 'urgent':
        return 'bg-orange-600 border-orange-400';
      default:
        return 'bg-blue-600 border-blue-400';
    }
  };

  return (
    <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`flex items-center justify-between text-white p-4 rounded-lg shadow-lg border ${getTypeStyles()} mb-2 w-full max-w-sm`}
      >
        {/* Contenu de la notification */}
        <div className="flex-1">
          <h4 className="font-semibold">{notification.title}</h4>
          <p className="text-sm">{notification.message}</p>
        </div>

        {/* Bouton de fermeture */}
        <button
          onClick={() => onRemove(notification._id)}
          aria-label="Fermer la notification"
          className="ml-4 text-white hover:text-gray-200 transition-all text-lg"
        >
          ×
        </button>
      </motion.div>
  );
};

// Définition des PropTypes
NotificationToast.propTypes = {
  notification: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.string, // success, error, warning, urgent, info
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default NotificationToast;
