import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { 
  HeartHandshake, 
  Users, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare,
  ChevronRight,
  Info,
  MapPin,
  Video
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinSuccessMsg, setJoinSuccessMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dash, groupsData] = await Promise.all([
        api.getDashboard(),
        api.getGroups(),
      ]);
      setDashboardData(dash);
      setGroups(groupsData || []);
    } catch (e) {
      console.error('Failed to load student dashboard', e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId, groupName) => {
    try {
      await api.joinGroup(groupId);
      setJoinSuccessMsg(`You joined "${groupName}"!`);
      setTimeout(() => setJoinSuccessMsg(''), 4000);
      loadData();
    } catch (e) {
      alert(e.message || 'Failed to join group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>Campus Wellbeing Space</span>
              <span>•</span>
              <span>Semester 1</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Welcome back, {dashboardData?.name || user?.name || 'Student'} 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-sm max-w-2xl">
              We're here to help you thrive academically, emotionally, and socially. All services are confidential and student-focused.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/counselling/new"
              className="inline-flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all hover:scale-105"
            >
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              Request Counselling
            </Link>
          </div>
        </div>
      </div>

      {joinSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{joinSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* 3 Core PRD Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — Register for Counselling */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Professional Care
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Request Counselling
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Talk to a qualified university counsellor about anything affecting your wellbeing or academic life.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <Link
                to="/counselling/new"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>Start Intake Form</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2 — Active Help Groups */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                Peer Community
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Active Help Groups
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Join student-led support circles for exam stress, first-year transition, social connection, and peer listening.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <Link
                to="/groups"
                className="w-full inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>Browse {groups.length} Support Groups</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3 — Immediate Support */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group bg-gradient-to-b from-white to-rose-50/30">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                Crisis & Urgent Guidance
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                Immediate Support
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                24/7 crisis hotlines (988 Lifeline), emergency contacts, safe next steps, and conversational AI guidance.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-rose-100/60">
              <Link
                to="/immediate-support"
                className="w-full inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors"
              >
                <span>Get Immediate Support</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Section 2: Recent Counselling Requests (PRD Section 24-26) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                My Counselling Requests
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Track status, expected response timelines, and scheduled appointments
              </p>
            </div>
            {dashboardData?.recent_requests?.length > 0 && (
              <Link
                to="/counselling/new"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                + New Request
              </Link>
            )}
          </div>

          {dashboardData?.recent_requests?.length === 0 ? (
            <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-gray-200">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-3">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">No active counselling requests</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                If you are going through personal, academic, or emotional difficulties, requesting counselling takes less than 3 minutes.
              </p>
              <Link
                to="/counselling/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
              >
                Request Counselling
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.recent_requests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-xl border border-gray-100 bg-white hover:border-indigo-100 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-semibold text-gray-900 text-sm">
                          Request #{req.id}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
                          {req.concern_category ? req.concern_category.replace('_', ' ') : 'General Wellbeing'}
                        </span>
                        
                        {/* Status Badge */}
                        {req.status === 'submitted' && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Awaiting Counsellor Review
                          </span>
                        )}
                        {req.status === 'under_review' && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Under Review
                          </span>
                        )}
                        {req.status === 'appointment_scheduled' && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Appointment Confirmed
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 flex items-center gap-4 flex-wrap">
                        <span>Submitted on: {new Date(req.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-indigo-600 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Expected response: {req.expected_response}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/counselling/request/${req.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-center"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Confirmed Appointment Preview Card (PRD Section 26) */}
                  {req.appointment && (
                    <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-emerald-950 text-sm">
                            Confirmed Counselling Session
                          </div>
                          <div className="text-emerald-800 mt-0.5 flex items-center gap-3">
                            <span>📅 {req.appointment.date} at {req.appointment.time}</span>
                            {req.appointment.location ? (
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {req.appointment.location}</span>
                            ) : (
                              <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Online Session</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/counselling/request/${req.id}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-xs transition-colors self-start sm:self-center"
                      >
                        Session Instructions
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Featured Active Support Groups Preview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Featured Student Support Groups
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Facilitated circles organized by student clubs and psychology peer mentors
              </p>
            </div>
            <Link
              to="/groups"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>See All Groups</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.slice(0, 3).map((g) => {
              const seatsLeft = g.capacity - g.enrolled;
              return (
                <div
                  key={g.id}
                  className="p-4 rounded-xl border border-gray-100 bg-slate-50/50 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {g.is_online ? '🌐 Online' : '📍 Campus Hub'}
                      </span>
                      <span className={`text-[10px] font-semibold ${seatsLeft <= 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {seatsLeft} seats available
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm">{g.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{g.description}</p>
                    
                    <div className="mt-3 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{g.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{g.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">By {g.organiser}</span>
                    <button
                      onClick={() => handleJoinGroup(g.id, g.name)}
                      disabled={seatsLeft <= 0}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {seatsLeft <= 0 ? 'Full' : 'Join Circle'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer / Human-in-the-loop notice */}
        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 text-xs text-indigo-900">
          <Info className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
          <p>
            <strong>Human-in-the-Loop Guarantee:</strong> UniWell uses AI strictly to help university counsellors organize and triage requests. No clinical diagnostic labels or final decisions are made automatically. Every request is reviewed by a qualified counsellor.
          </p>
        </div>
      </div>
    </div>
  );
};
