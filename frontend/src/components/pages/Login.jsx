import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import TopNavbar from '../layout/TopNavbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopNavbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">AAI Runway</h1>
            <p className="text-slate-600">Sign in to your account</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-50 rounded-lg shadow-lg p-8 border border-slate-200">
            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="my-6"></div>

            {/* Change Role Link */}
            <div className="text-center">
              <button
                onClick={handleChangeRole}
                className="text-blue-600 text-sm font-semibold hover:underline"
              >
                Change Role
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-slate-600 text-sm">
            © 2026 AAI Runway. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;