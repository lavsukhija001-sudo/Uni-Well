import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { 
  ArrowLeft, 
  User, 
  Sparkles, 
  Calendar, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  HelpCircle, 
  Send,
  MessageSquare,
  ChevronDown,
  MapPin,
  Video,
  AlertOctagon
} from 'lucide-react';

export const CounsellorReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals & Action States
  const [showApptModal, setShowApptModal] = useState(false);
  const [apptDate, setApptDate] = useState('2026-09-24');
  const [apptTime, setApptTime] = useState('02:30 PM');
  const [apptLocation, setApptLocation] = useState('Counselling Centre, Room 204');
  const [apptLink, setApptLink] = useState('');

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePriority, setOverridePriority] = useState('urgent');
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    loadStudentDetail();
  }, [id]);

  const loadStudentDetail = async () => {
    try {
      setLoading(true);
      const res = await api.getStudentDetail(id);
      setData(res);
      if (res.ai_assessment?.suggested_priority) {
        setOverridePriority(res.ai_assessment.suggested_priority);
      }
    } catch (e) {
      setError(e.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async () => {
    try {
      await api.review(id, { action: 'reviewed', notes: 'Reviewed by counsellor' });
      setSuccessMsg('Request marked as reviewed by counsellor.');
      loadStudentDetail();
    } catch (e) {
      setError(e.message || 'Failed to mark reviewed');
    }
  };

  const handleEscalate = async () => {
    if (!window.confirm('Are you sure you want to escalate this case to the Emergency Crisis Protocol?')) return;
    try {
      await api.escalate(id);
      setSuccessMsg('Case has been escalated to Emergency Protocol.');
      loadStudentDetail();
    } catch (e) {
      setError(e.message || 'Failed to escalate');
    }
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    try {
      await api.createAppointment(id, {
        date: apptDate,
        time: apptTime,
        location: apptLocation,
        meeting_link: apptLink || null,
      });
      setShowApptModal(false);
      setSuccessMsg('Appointment scheduled successfully and student notified.');
      loadStudentDetail();
    } catch (e) {
      setError(e.message || 'Failed to schedule appointment');
    }
  };

  const handleOverridePriority = async (e) => {
    e.preventDefault();
    try {
      await api.updatePriority(id, {
        priority: overridePriority,
        reason: overrideReason,
      });
      setShowOverrideModal(false);
      setSuccessMsg(`Priority successfully updated to ${overridePriority.toUpperCase()}.`);
      loadStudentDetail();
    } catch (e) {
      setError(e.message || 'Failed to update priority');
    }
  };

  const handleRequestMoreInfo = async () => {
    try {
      await api.requestMoreInfo(id);
      setSuccessMsg('Request for additional clarification sent to student.');
    } catch (e) {
      setError(e.message || 'Failed to request more info');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Request Error</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">{error}</p>
          <Link to="/counsellor" className="text-xs font-semibold text-indigo-600">
            &larr; Back to Queue
          </Link>
        </div>
      </div>
    );
  }

  const { student, subjective_response, questionnaire_answers, ai_assessment, counsellor_review, appointment } = data;

  const priorityColors = {
    immediate: 'bg-rose-100 text-rose-800 border-rose-300',
    urgent: 'bg-orange-100 text-orange-800 border-orange-300',
    moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    routine: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            to="/counsellor"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Priority Queue</span>
          </Link>

          <span className="text-xs text-gray-400">Request #{data.request_id}</span>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-sm">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </span>
            <button onClick={() => setSuccessMsg('')} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              <span>Student Intake Assessment</span>
              <span>•</span>
              <span className="text-gray-400 font-normal">Submitted {new Date(data.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.name}
            </h1>
            <div className="text-xs text-gray-500 flex items-center gap-3 mt-1 flex-wrap">
              <span>ID: <strong className="text-gray-700">{student.university_id}</strong></span>
              <span>•</span>
              <span>Course: <strong className="text-gray-700">{student.course} (Year {student.year})</strong></span>
              <span>•</span>
              <span>Email: <strong className="text-gray-700">{student.email}</strong></span>
              {student.phone && (
                <>
                  <span>•</span>
                  <span>Phone: <strong className="text-gray-700">{student.phone}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Current Urgency Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">
                Current Urgency
              </span>
              <span className={`inline-block mt-0.5 text-xs font-bold px-3 py-1 rounded-full border capitalize ${priorityColors[counsellor_review?.final_priority || ai_assessment?.suggested_priority || 'routine']}`}>
                {counsellor_review?.final_priority || ai_assessment?.suggested_priority || 'Routine'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Column (Student Responses & Questionnaire) vs Right Column (AI Assessment & Counsellor Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Student Submissions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Original Student Subjective Description (PRD Section 30) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Original Student Free-Text Response
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {data.concern_category ? data.concern_category.replace('_', ' ') : 'General'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                "{subjective_response}"
              </div>
              <p className="text-[11px] text-gray-400 italic">
                * Preserved exactly as written by the student. Never suppressed or modified.
              </p>
            </div>

            {/* Section 2: Structured Questionnaire Answers (PRD Section 30) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  Questionnaire Responses ({questionnaire_answers?.length || 0})
                </h2>
                {ai_assessment?.not_sure_count > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {ai_assessment.not_sure_count} "Not Sure" flags
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {questionnaire_answers && questionnaire_answers.length > 0 ? (
                  questionnaire_answers.map((qa, index) => {
                    const isNotSure = qa.answer === 'Not Sure';
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                          isNotSure ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50/50 border-gray-100'
                        }`}
                      >
                        <div className="space-y-0.5 flex-1">
                          <span className="text-[10px] uppercase font-semibold text-gray-400 block">
                            {qa.category?.replace('_', ' ') || 'General'}
                          </span>
                          <span className="text-gray-800 font-medium">
                            {qa.question}
                          </span>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex-shrink-0 ${
                            isNotSure
                              ? 'bg-amber-500 text-white'
                              : 'bg-white text-indigo-700 border border-gray-200'
                          }`}
                        >
                          {qa.answer}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 italic">No structured answers on record for this demo case.</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI Assessment & Counsellor Action Center (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Assessment Card (PRD Section 30) */}
            <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-50/50 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-gray-900">AI Clinical Triage Summary</h2>
                    <span className="text-[10px] text-gray-400 block">Gemini 2.5 Flash + Rule Engine</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${priorityColors[ai_assessment?.suggested_priority || 'routine']}`}>
                  Suggested: {ai_assessment?.suggested_priority || 'routine'}
                </span>
              </div>

              {/* Safety Warning if triggered */}
              {ai_assessment?.safety_flag && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-start gap-2 animate-pulse">
                  <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">CRISIS SAFETY ALERT:</strong> Safety indicators detected in submission text. Review promptly under emergency protocol.
                  </div>
                </div>
              )}

              {/* AI Summary Text */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Structured Case Summary
                </span>
                <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-gray-100">
                  {ai_assessment?.summary || 'AI summary generated for case review.'}
                </p>
              </div>

              {/* Indicators & Duration */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">Duration</span>
                  <span className="font-semibold text-gray-800 text-xs capitalize">{ai_assessment?.duration || 'Not specified'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block font-medium">Functional Impact</span>
                  <span className="font-semibold text-gray-800 text-xs capitalize">{ai_assessment?.functional_impact || 'Moderate'}</span>
                </div>
              </div>

              {/* Primary Concerns tags */}
              {ai_assessment?.concerns && ai_assessment.concerns.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Identified Concerns
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ai_assessment.concerns.map((c, i) => (
                      <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning Factors */}
              {ai_assessment?.reasoning_factors && ai_assessment.reasoning_factors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Triage Reasoning Factors
                  </span>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    {ai_assessment.reasoning_factors.map((f, i) => (
                      <li key={i} className="text-[11px]">{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Mandatory Human-in-the-Loop label (PRD Section 30) */}
              <div className="pt-2 text-[11px] font-semibold text-indigo-900/70 bg-indigo-50/60 p-2 rounded-lg text-center border border-indigo-100">
                AI-generated recommendation — counsellor review required.
              </div>
            </div>

            {/* Human Decision & Action Center (PRD Section 31 & 32) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Counsellor Actions & Decision
              </h2>

              {/* Existing Review / Appointment State */}
              {counsellor_review && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-950">Review Recorded</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(counsellor_review.reviewed_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">
                    Counsellor Priority: <strong className="capitalize">{counsellor_review.final_priority}</strong> ({counsellor_review.action})
                  </p>
                  {counsellor_review.override_reason && (
                    <p className="text-gray-500 italic">"{counsellor_review.override_reason}"</p>
                  )}
                </div>
              )}

              {appointment && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Scheduled Session
                  </div>
                  <p className="text-emerald-800">
                    {appointment.date} at {appointment.time} ({appointment.location || 'Online'})
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setShowApptModal(true)}
                  className="px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Assign Appointment</span>
                </button>

                <button
                  onClick={() => setShowOverrideModal(true)}
                  className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Change Priority</span>
                </button>

                <button
                  onClick={handleMarkReviewed}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Reviewed</span>
                </button>

                <button
                  onClick={handleRequestMoreInfo}
                  className="px-3 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Request More Info</span>
                </button>

                <button
                  onClick={handleEscalate}
                  className="sm:col-span-2 px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Escalate to Emergency Protocol</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      {showApptModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100 animate-scale-up">
            <h3 className="font-bold text-gray-900 text-base">Schedule Counselling Appointment</h3>
            <form onSubmit={handleScheduleAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="text"
                  required
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  placeholder="e.g. 02:30 PM"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Physical Location</label>
                <input
                  type="text"
                  value={apptLocation}
                  onChange={(e) => setApptLocation(e.target.value)}
                  placeholder="e.g. Counselling Centre, Room 204"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Online Video Link (Optional)</label>
                <input
                  type="url"
                  value={apptLink}
                  onChange={(e) => setApptLink(e.target.value)}
                  placeholder="https://meet.uni.edu/counselling-room"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowApptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Priority Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-100 animate-scale-up">
            <h3 className="font-bold text-gray-900 text-base">Override Priority Recommendation</h3>
            <p className="text-xs text-gray-500">
              AI suggested priority: <strong className="capitalize">{ai_assessment?.suggested_priority || 'Routine'}</strong>. Counsellor judgment supersedes AI recommendation for clinical auditing.
            </p>

            <form onSubmit={handleOverridePriority} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Urgency Priority</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none bg-white"
                >
                  <option value="immediate">Immediate (Safety Concerns)</option>
                  <option value="urgent">Urgent (High Distress/Impairment)</option>
                  <option value="moderate">Moderate (Persistent Distress)</option>
                  <option value="routine">Routine (General Support)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Clinical Rationale (Optional)</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Document why priority was adjusted..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Save Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
