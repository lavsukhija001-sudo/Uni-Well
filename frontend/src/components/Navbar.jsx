import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { 
  HeartHandshake, 
  Bell, 
  LogOut, 
  User, 
  ShieldAlert, 
  Calendar, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickSwitch = async (email) => {
    try {
      await login({ email, password: 'password123' });
      setShowRoleSwitcher(false);
      if (email.includes('counsellor')) navigate('/counsellor');
      else if (email.includes('admin')) navigate('/analytics');
      else navigate('/dashboard');
    } catch (e) {
      console.error('Quick switch failed', e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const roleColors = {
    student: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    counsellor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
    peer_supporter: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center space-x-3">
            <Link to={user.role === 'counsellor' ? '/counsellor' : '/dashboard'} className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                  UniWell
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                    AI-Assisted
                  </span>
                </span>
                <span className="text-xs text-gray-500 hidden sm:block">Campus Wellbeing & Counselling</span>
              </div>
            </Link>

            {/* Navigation links */}
            <div className="hidden md:flex items-center space-x-1 pl-6">
              {user.role === 'student' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/counselling/new"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/counselling/new' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Request Counselling
                  </Link>
                  <Link
                    to="/groups"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === '/groups' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Support Groups
                  </Link>
                  <Link
                    to="/immediate-support"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 text-rose-600 hover:bg-rose-50 ${
                      location.pathname === '/immediate-support' ? 'bg-rose-50 font-semibold' : ''
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Immediate Support
                  </Link>
                </>
              )}

              {(user.role === 'counsellor' || user.role === 'admin') && (
                <>
                  <Link
                    to="/counsellor"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname === '/counsellor' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Priority Queue
                  </Link>
                  <Link
                    to="/groups"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname === '/groups' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Support Groups
                  </Link>
                  <Link
                    to="/analytics"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      location.pathname === '/analytics' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Quick Role Switcher for Hackathon Demo */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-200"
                title="Switch demo user"
              >
                <span>Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Instant Demo Login
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('student@uni.edu')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span>🎓 Alex (Student)</span>
                    {user.email === 'student@uni.edu' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('counsellor@uni.edu')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span>🩺 Dr. Chen (Counsellor)</span>
                    {user.email === 'counsellor@uni.edu' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('admin@uni.edu')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 flex items-center justify-between"
                  >
                    <span>📊 Marcus (Admin)</span>
                    {user.email === 'admin@uni.edu' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                    <span className="text-xs text-gray-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-3 text-xs transition-colors cursor-pointer hover:bg-gray-50 flex items-start gap-2.5 ${
                            !n.read ? 'bg-indigo-50/50 font-medium' : 'text-gray-600'
                          }`}
                        >
                          <AlertCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-gray-800">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
              <Link
                to={user.role === 'student' ? '/profile' : '#'}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-gray-900 leading-none">{user.name}</div>
                  <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded border capitalize ${roleColors[user.role] || 'bg-gray-100'}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-2 pb-4 space-y-1">
          {user.role === 'student' ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </Link>
              <Link
                to="/counselling/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Request Counselling
              </Link>
              <Link
                to="/groups"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Support Groups
              </Link>
              <Link
                to="/immediate-support"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Immediate Support
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/counsellor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Priority Queue
              </Link>
              <Link
                to="/groups"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Support Groups
              </Link>
              <Link
                to="/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                Analytics
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
