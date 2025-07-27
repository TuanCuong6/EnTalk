//frontend/src/context/NotificationContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getNotificationList } from '../api/notification';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await getNotificationList();
      const unread = res.data.filter(item => !item.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log('⚠️ Lỗi lấy badge thông báo:', err.message);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
