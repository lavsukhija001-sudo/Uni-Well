import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HeartHandshake, LogIn, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data.user.role === 'counsellor') navigate('/counsellor');
      else if (data.user.role === 'admin') navigate('/analytics');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      const data = await login({ email: demoEmail, password: 'password123' });
      if (data.user.role === 'counsellor') navigate('/counsellor');
      else if (data.user.role === 'admin') navigate('/analytics');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-4">
          <HeartHandshake className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          UniWell Portal
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          AI-Assisted University Counselling & Student Wellbeing
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl shadow-gray-200/50 rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                University Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@uni.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* 1-Click Quick Demo Switcher */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1-Click Demo Logins
              </span>
              <span className="text-[10px] text-gray-400">No typing required</span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student@uni.edu')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 transition-all text-xs font-medium flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold block">🎓 Student (Alex Rivera)</span>
                  <span className="text-[11px] text-emerald-700">Submit requests, intake wizard, support groups</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('counsellor@uni.edu')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/80 text-indigo-900 transition-all text-xs font-medium flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold block">🩺 Counsellor (Dr. Sarah Chen)</span>
                  <span className="text-[11px] text-indigo-700">Priority queue, AI triage review, scheduling</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin@uni.edu')}
                className="w-full text-left px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 text-purple-900 transition-all text-xs font-medium flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold block">📊 Administrator (Dean Marcus)</span>
                  <span className="text-[11px] text-purple-700">Analytics, response times, triage audit</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-600 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </div>
        </div>

        {/* Clinical disclaimer */}
        <p className="mt-6 text-center text-xs text-gray-400 max-w-sm mx-auto">
          UniWell uses AI to assist counsellor triage. All clinical decisions and appointments remain strictly human-controlled.
        </p>
      </div>
    </div>
  );
};
