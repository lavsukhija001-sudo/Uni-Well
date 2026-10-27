import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Video, 
  CheckCircle2, 
  ArrowLeft, 
  User, 
  FileText,
  AlertCircle
} from 'lucide-react';

export const RequestStatus = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRequest();
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await api.getRequest(id);
      setRequest(data);
    } catch (e) {
      setError(e.message || 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">{error || 'Could not retrieve this request.'}</p>
          <Link to="/dashboard" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            &larr; Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Status Header Card (PRD Section 24 & 26) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Request #{request.id}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                {request.appointment ? 'Appointment Confirmed' : 'Request Received'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Submitted on {new Date(request.created_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div>
              {request.status === 'submitted' && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Awaiting Review
                </span>
              )}
              {request.status === 'under_review' && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Under Counsellor Review
                </span>
              )}
              {request.status === 'appointment_scheduled' && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Appointment Scheduled
                </span>
              )}
            </div>
          </div>

          {/* If Appointment Confirmed (PRD Section 26) */}
          {request.appointment ? (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Confirmed Session Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white p-4 rounded-xl border border-emerald-100">
                  <span className="text-gray-400 block mb-1 font-medium">Session Date & Time</span>
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    {request.appointment.date} at {request.appointment.time}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-100">
                  <span className="text-gray-400 block mb-1 font-medium">Counsellor</span>
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    {request.appointment.counsellor_name}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-100 sm:col-span-2">
                  <span className="text-gray-400 block mb-1 font-medium">Location</span>
                  {request.appointment.location ? (
                    <span className="font-medium text-gray-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      {request.appointment.location}
                    </span>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-teal-600" />
                        Online Video Consultation
                      </span>
                      {request.appointment.meeting_link && (
                        <a
                          href={request.appointment.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
                        >
                          Join Meeting Link
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-xs text-emerald-800 pt-2 border-t border-emerald-100">
                A confirmation has been dispatched to your university email. If you need to reschedule, please contact counselling support at least 24 hours in advance.
              </p>
            </div>
          ) : (
            /* Expected Response Time (PRD Section 25) */
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Expected Response Window</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {request.expected_response}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                A qualified university counsellor will review your responses and contact you through your registered university email with consultation options.
              </p>
            </div>
          )}

          {/* Submission Recap */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <h3 className="font-semibold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Your Submitted Experience</span>
            </h3>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs text-gray-700 italic leading-relaxed">
              "{request.subjective_response}"
            </div>
            <div className="text-[11px] text-gray-400">
              Primary Category: <span className="text-gray-600 font-medium capitalize">{request.concern_category?.replace('_', ' ') || 'General'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
