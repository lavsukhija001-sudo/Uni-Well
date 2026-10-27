import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { 
  ShieldAlert, 
  Phone, 
  MessageSquare, 
  Send, 
  HeartHandshake, 
  Sparkles, 
  AlertTriangle,
  Info,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const ImmediateSupport = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello, I'm UniWell Assistant. I can help guide you to the right university mental health resources, answer questions about counselling, or listen to what you're currently experiencing.\n\n⚠️ Note: I am an AI support guide, not a therapist or emergency service. If you are in immediate distress or crisis, please see the helpline numbers on this page.",
      resourcesSuggested: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const data = await api.sendMessage({ message: userMsg });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.response,
          resourcesSuggested: data.resources_suggested,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I'm having trouble connecting right now, but please know that support is available. You can call the 988 Crisis Lifeline 24/7 or submit a counselling request on your dashboard.",
          resourcesSuggested: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Emergency Banner (PRD Section 35) */}
        <div className="bg-rose-600 text-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-rose-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-rose-700/80 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4" />
              <span>Emergency Crisis Notice</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Are you or someone else in immediate danger?
            </h1>
            <p className="text-rose-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              If you are feeling overwhelmed, having thoughts of self-harm, or experiencing an emergency, please connect immediately with 24/7 human crisis support. You do not have to carry this alone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0">
            <a
              href="tel:988"
              className="px-5 py-3 bg-white text-rose-700 hover:bg-rose-50 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-rose-600" />
              <span>Call / Text 988 (Lifeline)</span>
            </a>
            <a
              href="tel:911"
              className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-rose-500"
            >
              <span>Campus Security & 911</span>
            </a>
          </div>
        </div>

        {/* Hotlines & Immediate Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">988 Suicide & Crisis Lifeline</h3>
              <p className="text-xs text-gray-500 mt-1">Free, confidential support 24/7 by call or text across the nation.</p>
              <span className="inline-block mt-2 font-bold text-xs text-rose-600">Dial: 988</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">University Crisis Hotline</h3>
              <p className="text-xs text-gray-500 mt-1">Direct link to on-call university mental health counselors 24/7.</p>
              <span className="inline-block mt-2 font-bold text-xs text-indigo-600">Call: +1 (555) 019-HELP</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Crisis Text Line</h3>
              <p className="text-xs text-gray-500 mt-1">Text with a trained crisis volunteer for immediate grounding.</p>
              <span className="inline-block mt-2 font-bold text-xs text-teal-600">Text HOME to 741741</span>
            </div>
          </div>
        </div>

        {/* AI Support Assistant & Resource Navigator (PRD Section 38) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[560px]">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  UniWell AI Navigator
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Online</span>
                </h2>
                <p className="text-[11px] text-gray-500">
                  Supportive guidance, platform navigation & wellbeing information
                </p>
              </div>
            </div>

            <Link
              to="/counselling/new"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-lg border border-indigo-100 shadow-2xs"
            >
              Request Human Counsellor &rarr;
            </Link>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed max-w-2xl ${
                  m.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-gray-200 text-indigo-600 shadow-2xs'
                  }`}
                >
                  {m.role === 'user' ? 'U' : <Sparkles className="w-4 h-4" />}
                </div>

                <div
                  className={`p-4 rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-gray-100 text-gray-800 shadow-2xs rounded-tl-none space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  
                  {m.resourcesSuggested && (
                    <div className="pt-2 border-t border-gray-100 mt-2 flex flex-wrap gap-2">
                      <Link
                        to="/counselling/new"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded"
                      >
                        <HeartHandshake className="w-3 h-3" />
                        Request Counselling Intake
                      </Link>
                      <Link
                        to="/groups"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:underline bg-teal-50 px-2 py-1 rounded"
                      >
                        Explore Support Groups
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 text-xs text-gray-400">
                <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                </div>
                <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-2xs">
                  UniWell Assistant is typing...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything or describe how you are feeling..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
