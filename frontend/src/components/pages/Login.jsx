import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, Shield, Wrench, ArrowLeft, Loader2, Plane } from 'lucide-react';
import TopNavbar from '../layout/TopNavbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const isAdmin = role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password, role);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  const handleChangeRole = () => {
    navigate('/');
  };

  const accentColor = isAdmin ? 'blue' : 'emerald';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 relative">
      {/* Subtle background grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(100 116 139) 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <TopNavbar />

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              AeroSafe AI
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1.5">
              Runway Alert Management System
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 overflow-hidden">
            {/* Role-themed card header */}
            <div className={`px-8 py-5 border-b border-slate-100 ${
              isAdmin ? 'bg-gradient-to-r from-blue-50/80 to-indigo-50/50' : 'bg-gradient-to-r from-emerald-50/80 to-teal-50/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  isAdmin ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {isAdmin ? <Shield size={18} /> : <Wrench size={18} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {isAdmin ? 'Administrator' : 'Field Engineer'} Login
                  </p>
                  <p className="text-xs text-slate-500">
                    Enter your credentials to access the portal
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div className="p-8">
              <form onSubmit={handleSubmit}>
                {/* Error Alert */}
                {error && (
                  <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-red-700 leading-snug">{error}</p>
                  </div>
                )}

                {/* Email Field */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-3.5 transition-colors duration-200 ${
                      focusedField === 'email' ? (isAdmin ? 'text-blue-500' : 'text-emerald-500') : 'text-slate-400'
                    }`} size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="your@email.com"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm bg-slate-50/50 focus:bg-white shadow-sm ${
                        isAdmin ? 'focus:ring-blue-500/40' : 'focus:ring-emerald-500/40'
                      } border-slate-200`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-3.5 transition-colors duration-200 ${
                      focusedField === 'password' ? (isAdmin ? 'text-blue-500' : 'text-emerald-500') : 'text-slate-400'
                    }`} size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm bg-slate-50/50 focus:bg-white shadow-sm ${
                        isAdmin ? 'focus:ring-blue-500/40' : 'focus:ring-emerald-500/40'
                      } border-slate-200`}
                    />
                  </div>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 ${
                    isAdmin
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              <div className="my-6 border-t border-slate-100" />

              {/* Change Role Link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleChangeRole}
                  className="inline-flex items-center gap-2 text-slate-400 text-xs font-bold hover:text-slate-700 transition-all duration-200 group"
                >
                  <ArrowLeft size={14} className="transition-transform duration-200 group-hover:-translate-x-1" />
                  <span>Switch Role Selection</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-slate-400 text-xs font-medium tracking-wide">
            © 2026 Airports Authority of India • AeroSafe AI System
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;