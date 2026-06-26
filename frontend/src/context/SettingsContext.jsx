import React, { createContext, useState, useContext } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundAlert, setSoundAlert] = useState(true);
  const [notificationPreferences, setNotificationPreferences] = useState({
    criticalAlerts: true,
    highPriority: true,
    mediumPriority: false,
    lowPriority: false,
  });

  const updateAutoRefresh = (value) => {

    setAutoRefresh(value);
  };

  const updateSoundAlert = (value) => {

    setSoundAlert(value);
  };

  const updateNotificationPreferences = (prefs) => {

    setNotificationPreferences(prefs);
  };

  const value = {
    autoRefresh,
    soundAlert,
    notificationPreferences,
    updateAutoRefresh,
    updateSoundAlert,
    updateNotificationPreferences,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
