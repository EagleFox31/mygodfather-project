import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import webSocketService from '../services/WebSocketService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Set up notification listener when user is authenticated
      const handleNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        // You could also show a toast/alert here
      };

      webSocketService.onNotification(handleNotification);

      // Cleanup listener on unmount or when user changes
      return () => {
        webSocketService.offNotification(handleNotification);
      };
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
    }
  }, [user]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n._id !== notificationId));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        clearNotifications,
        removeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
