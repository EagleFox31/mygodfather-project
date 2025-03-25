import React from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationToast from './NotificationToast';
import { useNotifications } from '../../context/NotificationContext';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification._id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationContainer;
