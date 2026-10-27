import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldAlert, 
  Calendar, 
  ArrowRight,
  HelpCircle,
  BarChart3,
  ChevronRight,
  Flame,
  AlertOctagon
} from 'lucide-react';

const PRIORITY_THEMES = {
  immediate: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: AlertOctagon,
    label: 'Immediate',
  },
  urgent: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: Flame,
    label: 'Urgent',
  },
  moderate: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: AlertTriangle,
    label: 'Moderate',
  },
  routine: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: Clock,
    label: 'Routine',
  },
};

export const CounsellorDashboard = () => {
  const [queueData, setQueueData] = useState({ counts: {}, items: [] });
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQueue();
  }, [filterPriority, filterStatus]);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus) params.status = filterStatus;
      if (searchTerm) params.search = searchTerm;
      const data = await api.getQueue(params);
      setQueueData(data || { counts: {}, items: [] });
    } catch (e) {
      console.error('Failed to load counsellor queue', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadQueue();
  };

  const counts = queueData.counts || {};

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              <span>Clinical Triage Queue</span>
              <span>•</span>
              <span>Human-in-the-Loop Oversight</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Counsellor Priority Queue
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              AI-assisted triage rankings. Review summaries, verify urgency recommendations, and manage clinical interventions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors border border-indigo-200"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Priority Counts Metric Bar (PRD Section 27 & 28) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setFilterPriority('')}
            className={`p-4 rounded-2xl border transition-all text-left ${
              filterPriority === ''
                ? 'bg-white border-indigo-600 shadow-sm ring-2 ring-indigo-50'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Queue
            </span>
            <span className="text-2xl font-bold text-gray-900 mt-1 block">
              {counts.total || 0}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">Active requests</span>
          </button>

          <button
            onClick={() => setFilterPriority('immediate')}
            className={`p-4 rounded-2xl border transition-all text-left ${
              filterPriority === 'immediate'
                ? 'bg-rose-50 border-rose-500 shadow-sm ring-2 ring-rose-100'
                : 'bg-white border-gray-100 hover:border-rose-200'
            }`}
          >
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
              Immediate
            </span>
            <span className="text-2xl font-bold text-rose-700 mt-1 block">
              {counts.immediate || 0}
            </span>
            <span className="text-[10px] text-rose-600/70 mt-0.5 block">Safety / Crisis</span>
          </button>

          <button
            onClick={() => setFilterPriority('urgent')}
            className={`p-4 rounded-2xl border transition-all text-left ${
              filterPriority === 'urgent'
                ? 'bg-orange-50 border-orange-500 shadow-sm ring-2 ring-orange-100'
                : 'bg-white border-gray-100 hover:border-orange-200'
            }`}
          >
            <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              Urgent
            </span>
            <span className="text-2xl font-bold text-orange-700 mt-1 block">
              {counts.urgent || 0}
            </span>
            <span className="text-[10px] text-orange-600/70 mt-0.5 block">High distress</span>
          </button>

          <button
            onClick={() => setFilterPriority('moderate')}
            className={`p-4 rounded-2xl border transition-all text-left ${
              filterPriority === 'moderate'
                ? 'bg-amber-50 border-amber-500 shadow-sm ring-2 ring-amber-100'
                : 'bg-white border-gray-100 hover:border-amber-200'
            }`}
          >
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Moderate
            </span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">
              {counts.moderate || 0}
            </span>
            <span className="text-[10px] text-amber-600/70 mt-0.5 block">Persistent issues</span>
          </button>

          <button
            onClick={() => setFilterPriority('routine')}
            className={`p-4 rounded-2xl border transition-all text-left ${
              filterPriority === 'routine'
                ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-100'
                : 'bg-white border-gray-100 hover:border-emerald-200'
            }`}
          >
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Routine
            </span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {counts.routine || 0}
            </span>
            <span className="text-[10px] text-emerald-600/70 mt-0.5 block">General wellbeing</span>
          </button>

          <div className="p-4 rounded-2xl border border-gray-100 bg-white text-left">
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider block">
              Awaiting Review
            </span>
            <span className="text-2xl font-bold text-indigo-700 mt-1 block">
              {counts.awaiting_review || 0}
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5 block">Pending clinical check</span>
          </div>
        </div>

        {/* Filter and Search Bar (PRD Section 29) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 outline-none"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="appointment_scheduled">Appointment Scheduled</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            {(filterPriority || filterStatus || searchTerm) && (
              <button
                onClick={() => {
                  setFilterPriority('');
                  setFilterStatus('');
                  setSearchTerm('');
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Priority Queue Items (PRD Section 28) */}
        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Loading clinical queue...
            </div>
          ) : queueData.items.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-800">No requests match your current filters</h3>
              <p className="text-xs text-gray-500 mt-1">All student intake submissions have been addressed.</p>
            </div>
          ) : (
            queueData.items.map((item) => {
              const priorityConfig = PRIORITY_THEMES[item.suggested_priority] || PRIORITY_THEMES.routine;
              const PriorityIcon = priorityConfig.icon;

              return (
                <div
                  key={item.request_id}
                  className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                    item.suggested_priority === 'immediate'
                      ? 'border-rose-200 ring-1 ring-rose-100'
                      : 'border-gray-100 hover:border-indigo-100'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Student & Urgency */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Priority Badge */}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${priorityConfig.badge}`}>
                          <PriorityIcon className="w-3.5 h-3.5" />
                          <span>{priorityConfig.label}</span>
                        </span>

                        <span className="font-bold text-gray-900 text-sm">
                          {item.student_name}
                        </span>
                        <span className="text-xs font-mono text-gray-400">
                          ({item.student_id})
                        </span>
                        
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium capitalize">
                          {item.concern_category ? item.concern_category.replace('_', ' ') : 'General'}
                        </span>

                        {/* High Not-Sure Flag (PRD Section 18) */}
                        {item.not_sure_count >= 2 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-amber-600" />
                            {item.not_sure_count} "Not Sure" answers (Clarify)
                          </span>
                        )}

                        {/* Safety flag */}
                        {item.ai_assessment?.safety_flag && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white animate-pulse">
                            CRISIS SAFETY FLAG
                          </span>
                        )}
                      </div>

                      {/* AI Summary Snippet */}
                      {item.ai_assessment?.summary && (
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-gray-100">
                          <strong className="text-gray-900 font-semibold">AI Summary: </strong>
                          {item.ai_assessment.summary}
                        </p>
                      )}

                      <div className="text-[11px] text-gray-400 flex items-center gap-4 flex-wrap">
                        <span>Submitted: {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-medium text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          Waiting: {item.waiting_hours} hrs
                        </span>
                        <span className="capitalize">
                          Review status: <strong>{item.review_status}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Right: CTA */}
                    <div className="flex items-center gap-3 self-end lg:self-center">
                      <Link
                        to={`/counsellor/request/${item.request_id}`}
                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all ${
                          item.suggested_priority === 'immediate'
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                        }`}
                      >
                        <span>Open & Review</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
