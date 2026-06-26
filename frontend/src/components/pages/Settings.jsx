import React from 'react';
import { Bell, Zap, HelpCircle, Shield, LogOut } from 'lucide-react';
import DashboardLayout from '../layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

const Settings = () => {
  const { user, logout, role } = useAuth();
  const {
    autoRefresh,
    soundAlert,
    notificationPreferences,
    updateAutoRefresh,
    updateSoundAlert,
    updateNotificationPreferences,
  } = useSettings();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      window.location.href = '/';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Email Address</p>
              <p className="mt-1 text-slate-900 font-medium">{user?.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Role</p>
              <p className="mt-1 text-slate-900 font-medium">
                {role === 'admin' ? 'Administrator' : 'Field Engineer'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Last Login</p>
              <p className="mt-1 text-slate-900 font-medium">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Bell size={20} />
            <span>Notification Preferences</span>
          </h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.criticalAlerts}
                onChange={(e) =>
                  updateNotificationPreferences({
                    ...notificationPreferences,
                    criticalAlerts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="font-medium text-slate-900">Critical Alerts</p>
                <p className="text-sm text-slate-600">Receive alerts for critical incidents</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.highPriority}
                onChange={(e) =>
                  updateNotificationPreferences({
                    ...notificationPreferences,
                    highPriority: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="font-medium text-slate-900">High Priority</p>
                <p className="text-sm text-slate-600">Receive alerts for high priority incidents</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notificationPreferences.mediumPriority}
                onChange={(e) =>
                  updateNotificationPreferences({
                    ...notificationPreferences,
                    mediumPriority: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div>
                <p className="font-medium text-slate-900">Medium Priority</p>
                <p className="text-sm text-slate-600">Receive alerts for medium priority incidents</p>
              </div>
            </label>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Zap size={20} />
            <span>Preferences</span>
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Auto-Refresh Dashboard</p>
                <p className="text-sm text-slate-600">Automatically refresh incident data</p>
              </div>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => updateAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-3 hover:bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Sound Alert</p>
                <p className="text-sm text-slate-600">Play sound for new incidents</p>
              </div>
              <input
                type="checkbox"
                checked={soundAlert}
                onChange={(e) => updateSoundAlert(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <HelpCircle size={20} />
            <span>Support & Help</span>
          </h2>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors">
              <p className="font-medium text-slate-900">Contact Support</p>
              <p className="text-sm text-slate-600">support@airunway.com</p>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors">
              <p className="font-medium text-slate-900">Documentation</p>
              <p className="text-sm text-slate-600">View user guides and FAQs</p>
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors">
              <p className="font-medium text-slate-900">Report an Issue</p>
              <p className="text-sm text-slate-600">Help us improve the system</p>
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
