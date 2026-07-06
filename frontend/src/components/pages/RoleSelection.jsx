import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Wrench } from 'lucide-react';
import TopNavbar from '../layout/TopNavbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to all systems, monitoring, and reporting',
      icon: Shield,
      color: 'from-blue-500 to-blue-600',
      features: [
        'View all incidents and alerts',
        'Assign tasks to engineers',
        'Generate reports',
        'Manage user accounts',
        'System configuration',
      ],
    },
    {
      id: 'engineer',
      name: 'Field Engineer',
      description: 'On-field incident response and resolution',
      icon: Wrench,
      color: 'from-green-500 to-green-600',
      features: [
        'Receive assigned tasks',
        'Update incident status',
        'Real-time notifications',
        'Field reporting',
        'Equipment diagnostics',
      ],
    },
  ];

  const handleSelectRole = (roleId) => {
    switchRole(roleId);
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopNavbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-slate-900 mb-3">AAI Runway</h1>
            <p className="text-xl text-slate-600">Alert & Incident Management System</p>
            <p className="text-slate-500 mt-2">Select your role to continue</p>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className="text-left transition-all hover:scale-105 active:scale-95"
              >
                <div className="bg-slate-50 rounded-lg shadow-lg p-8 h-full hover:shadow-xl transition-all transform hover:scale-105 border border-slate-200">
                  <div className={`inline-block p-4 rounded-lg bg-gradient-to-br ${role.color} mb-4`}>
                    <role.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{role.name}</h3>
                  <p className="text-slate-600 mb-4">{role.description}</p>

                  {/* Features List */}
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-slate-600">
                        <span className={`w-2 h-2 rounded-full mr-2 ${role.id === 'admin' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className={`flex items-center justify-between px-4 py-2 rounded-lg text-white font-semibold bg-gradient-to-r ${role.color}`}>
                    <span>Continue as {role.name}</span>
                    <ChevronRight size={20} className="ml-2" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-slate-600">© 2026 AAI Runway. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;