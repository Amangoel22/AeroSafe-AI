import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Wrench, CheckCircle2, Sparkles } from 'lucide-react';
import TopNavbar from '../layout/TopNavbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { switchRole } = useAuth();

  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Full access to safety monitoring, incident oversight, and system analytics',
      icon: Shield,
      gradient: 'from-blue-600 via-indigo-600 to-blue-700',
      hoverBg: 'hover:bg-gradient-to-br hover:from-blue-50/90 hover:via-slate-50 hover:to-indigo-50/80 hover:border-blue-300 hover:shadow-blue-500/15',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
      accentColor: 'text-blue-600',
      checkBg: 'bg-blue-100 text-blue-600',
      ctaGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20',
      features: [
        'Real-time incident monitoring & maps',
        'Assign tasks & inform field engineers',
        'Generate safety analytics & reports',
        'User management & system configurations',
        'Live alert notifications & overrides',
      ],
    },
    {
      id: 'engineer',
      name: 'Field Engineer',
      description: 'On-field incident response, maintenance updates, and resolution reporting',
      icon: Wrench,
      gradient: 'from-emerald-600 via-teal-600 to-emerald-700',
      hoverBg: 'hover:bg-gradient-to-br hover:from-emerald-50/90 hover:via-slate-50 hover:to-teal-50/80 hover:border-emerald-300 hover:shadow-emerald-500/15',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
      accentColor: 'text-emerald-600',
      checkBg: 'bg-emerald-100 text-emerald-600',
      ctaGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20',
      features: [
        'Receive assigned tasks in real-time',
        'Update incident status & maintenance logs',
        'Field diagnostics & image verification',
        'Direct resolution feedback reporting',
        'Instant alert acknowledgments',
      ],
    },
  ];

  const handleSelectRole = (roleId) => {
    switchRole(roleId);
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <TopNavbar />
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="text-center mb-12 animate-slide-down">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              AeroSafe AI
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium mt-2">
              Runway Alert Management System
            </p>
            <p className="text-sm text-slate-400 mt-1 font-medium">
              Select your role to continue
            </p>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() => handleSelectRole(role.id)}
                  className={`group relative bg-white rounded-2xl p-8 border border-slate-200/90 shadow-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl ${role.hoverBg} flex flex-col justify-between overflow-hidden`}
                >
                  {/* Subtle top indicator bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${role.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />

                  <div>
                    {/* Header Icon & Title */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`p-4 rounded-xl ${role.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon size={30} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                          {role.name}
                        </h3>
                        <span className={`text-xs font-bold uppercase tracking-wider ${role.accentColor}`}>
                          {role.id === 'admin' ? 'Management Level' : 'Operational Level'}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 font-medium leading-relaxed mb-6">
                      {role.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Capabilities:</p>
                      {role.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-slate-700 font-medium gap-3">
                          <div className={`p-1 rounded-full ${role.checkBg} flex-shrink-0`}>
                            <CheckCircle2 size={14} />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className={`flex items-center justify-between px-6 py-3.5 rounded-xl text-white font-bold text-sm ${role.ctaGradient} transition-all duration-300 group-hover:shadow-lg`}>
                    <span>Continue as {role.name}</span>
                    <ChevronRight size={18} className="transform transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              © 2026 Airports Authority of India • AeroSafe AI System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;