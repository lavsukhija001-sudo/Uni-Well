import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Plus, 
  Search
} from 'lucide-react';

export const SupportGroups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    organiser: '',
    moderator: '',
    schedule: '',
    location: '',
    capacity: 15,
    is_online: false,
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await api.getGroups();
      setGroups(data || []);
    } catch (e) {
      console.error('Failed to load groups', e);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id, name) => {
    try {
      await api.joinGroup(id);
      setSuccessMsg(`You have joined "${name}"! Confirmation sent to your notifications.`);
      loadGroups();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      alert(e.message || 'Failed to join group');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await api.createGroup(newGroup);
      setShowCreateModal(false);
      setSuccessMsg(`Support group "${newGroup.name}" created!`);
      loadGroups();
    } catch (e) {
      alert(e.message || 'Failed to create group');
    }
  };

  const filteredGroups = groups.filter((g) => {
    if (filterType === 'online' && !g.is_online) return false;
    if (filterType === 'in_person' && g.is_online) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return (
        g.name.toLowerCase().includes(s) ||
        g.description.toLowerCase().includes(s) ||
        g.organiser.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">
              <span>Peer Support Network</span>
              <span>•</span>
              <span>Student Clubs & Guilds</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Active Student Support Groups
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
              Connect with fellow students in safe, peer-led spaces moderated by psychology mentors.
            </p>
          </div>

          {(user?.role === 'counsellor' || user?.role === 'admin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-colors self-start md:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Group</span>
            </button>
          )}
        </div>

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Groups ({groups.length})
            </button>
            <button
              onClick={() => setFilterType('in_person')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'in_person' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📍 On Campus
            </button>
            <button
              onClick={() => setFilterType('online')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filterType === 'online' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🌐 Virtual / Zoom
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 outline-none"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-500 text-xs">
            No support groups match your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((g) => {
              const seatsLeft = g.capacity - g.enrolled;
              const fillPct = Math.round((g.enrolled / g.capacity) * 100);

              return (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                        {g.is_online ? '🌐 Virtual Session' : '📍 On Campus'}
                      </span>
                      <span className={`text-[10px] font-semibold ${seatsLeft <= 3 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {seatsLeft > 0 ? `${seatsLeft} seats open` : 'Full'}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base">{g.name}</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{g.description}</p>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-800">{g.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{g.location}</span>
                      </div>
                      {g.moderator && (
                        <div className="text-[11px] text-gray-400">
                          Facilitated by: <span className="text-gray-600">{g.moderator}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Enrollment</span>
                        <span>{g.enrolled} / {g.capacity} filled ({fillPct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${fillPct >= 90 ? 'bg-amber-500' : 'bg-teal-500'}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 truncate max-w-[120px]">
                      By {g.organiser}
                    </span>
                    {user?.role === 'student' ? (
                      <button
                        onClick={() => handleJoin(g.id, g.name)}
                        disabled={seatsLeft <= 0}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                      >
                        {seatsLeft <= 0 ? 'Group Full' : 'Join Group'}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-teal-600">Active</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">Register Student Support Group</h3>
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g. Exam Stress Support Group"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What is the group focus?"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Organiser</label>
                  <input
                    type="text"
                    required
                    value={newGroup.organiser}
                    onChange={(e) => setNewGroup({ ...newGroup, organiser: e.target.value })}
                    placeholder="Psychology Guild"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    value={newGroup.capacity}
                    onChange={(e) => setNewGroup({ ...newGroup, capacity: parseInt(e.target.value) || 15 })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Schedule</label>
                <input
                  type="text"
                  required
                  value={newGroup.schedule}
                  onChange={(e) => setNewGroup({ ...newGroup, schedule: e.target.value })}
                  placeholder="e.g. Thursdays 5:00 PM - 6:30 PM"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location / Meeting URL</label>
                <input
                  type="text"
                  required
                  value={newGroup.location}
                  onChange={(e) => setNewGroup({ ...newGroup, location: e.target.value })}
                  placeholder="Student Lounge 204 or Zoom Link"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="online-check"
                  checked={newGroup.is_online}
                  onChange={(e) => setNewGroup({ ...newGroup, is_online: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <label htmlFor="online-check" className="text-xs text-gray-700">
                  This is an online/virtual session
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 shadow-sm"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
