import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { 
  HeartHandshake, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  Sparkles,
  Send
} from 'lucide-react';

const CATEGORIES = [
  { value: 'academic_pressure', label: 'Academic pressure & study load' },
  { value: 'anxiety_stress', label: 'Anxiety or chronic stress' },
  { value: 'relationships', label: 'Relationships & interpersonal conflict' },
  { value: 'family', label: 'Family concerns' },
  { value: 'loneliness', label: 'Loneliness & social isolation' },
  { value: 'sleep', label: 'Sleep difficulties & fatigue' },
  { value: 'financial_concerns', label: 'Financial stress' },
  { value: 'adjustment_to_university', label: 'Adjustment to university life' },
  { value: 'other', label: 'Other concerns' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

const LIKERT_OPTIONS = [
  { value: 'Strongly Disagree', label: 'Strongly Disagree', color: 'hover:border-indigo-400' },
  { value: 'Disagree', label: 'Disagree', color: 'hover:border-indigo-400' },
  { value: 'Slightly Disagree', label: 'Slightly Disagree', color: 'hover:border-indigo-400' },
  { value: 'Slightly Agree', label: 'Slightly Agree', color: 'hover:border-indigo-400' },
  { value: 'Agree', label: 'Agree', color: 'hover:border-indigo-400' },
  { value: 'Not Sure', label: 'Not Sure', badge: 'Uncertain', color: 'hover:border-amber-400' },
];

export const CounsellingIntake = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 Data
  const [subjectiveResponse, setSubjectiveResponse] = useState('');
  const [concernCategory, setConcernCategory] = useState('academic_pressure');

  // Step 2 Data
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { questionId: answerString }

  // Submission result
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    if (step === 2) {
      loadQuestions();
    }
  }, [step, concernCategory]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await api.getQuestions(concernCategory);
      setQuestions(data || []);
    } catch (e) {
      setError('Could not load questionnaire questions');
    } finally {
      setLoading(false);
    }
  };

  const handleNextToStep2 = (e) => {
    e.preventDefault();
    if (!subjectiveResponse.trim() || subjectiveResponse.length < 15) {
      setError('Please provide a brief description (at least 15 characters) to help us understand your situation.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleAnswerSelect = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextToStep3 = () => {
    // Verify all questions are answered
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions before proceeding (${unanswered.length} remaining). Choose 'Not Sure' if unsure.`);
      return;
    }
    setError('');
    setStep(3);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Create counselling request
      const req = await api.createRequest({
        subjective_response: subjectiveResponse,
        concern_category: concernCategory,
      });

      // 2. Submit questionnaire answers
      const answersPayload = Object.entries(answers).map(([qid, ans]) => ({
        question_id: parseInt(qid),
        answer: ans,
      }));

      const submitRes = await api.submitAnswers({
        request_id: req.id,
        answers: answersPayload,
      });

      setSubmissionResult({
        requestId: req.id,
        expectedResponse: submitRes.expected_response || 'Within 24 to 48 hours',
      });
      setStep(4);
    } catch (err) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              <span className={step >= 1 ? 'text-indigo-600 font-bold' : ''}>1. Description</span>
              <span className={step >= 2 ? 'text-indigo-600 font-bold' : ''}>2. Questionnaire</span>
              <span className={step >= 3 ? 'text-indigo-600 font-bold' : ''}>3. Review & Submit</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-2 transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Subjective Description */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Step 1 of 3 — In Your Own Words
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Tell us what you're currently experiencing.
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Describe what's been troubling you recently. You can write as much or as little as you feel comfortable sharing.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                What is this mainly related to? (Optional category)
              </label>
              <select
                value={concernCategory}
                onChange={(e) => setConcernCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Your Experience
              </label>
              <textarea
                rows={6}
                value={subjectiveResponse}
                onChange={(e) => setSubjectiveResponse(e.target.value)}
                placeholder="Describe what's been troubling you recently. For example: 'I've been struggling with academic pressure for the last few weeks. I can't concentrate properly and my sleep has become irregular...'"
                className="w-full p-4 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs text-gray-400 mt-1.5">
                <span>Minimum 15 characters</span>
                <span>{subjectiveResponse.length} characters</span>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-gray-600 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Confidentiality Notice:</strong> Your submission will only be reviewed by certified university counselling staff. Information shared is protected under university mental health confidentiality protocols.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleNextToStep2}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-colors"
              >
                <span>Continue to Questionnaire</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Structured Questionnaire */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Step 2 of 3 — Structured Questionnaire
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Wellbeing & Functioning Questionnaire
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Please indicate how each statement reflects your experience over the past two weeks.
              </p>
            </div>

            {/* "Not Sure" educational callout (PRD Section 18) */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>About "Not Sure":</strong> You are encouraged to select <em>Not Sure</em> if a question is difficult to interpret or doesn't feel applicable. In our system, choosing "Not Sure" simply flags the question for your counsellor to clarify in person — it does <strong>not</strong> classify you as high risk.
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500 text-sm">
                Loading tailored questions...
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-gray-100">
                {questions.map((q, idx) => (
                  <div key={q.id} className="pt-6 first:pt-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        <span className="text-indigo-600 mr-2">{idx + 1}.</span>
                        {q.question_text}
                      </h3>
                      {q.is_adaptive && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex-shrink-0">
                          Tailored Question
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {LIKERT_OPTIONS.map((opt) => {
                        const isSelected = answers[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleAnswerSelect(q.id, opt.value)}
                            className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center flex flex-col items-center justify-center ${
                              isSelected
                                ? opt.value === 'Not Sure'
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                  : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-gray-50/50 text-gray-700 border-gray-200 hover:bg-white hover:border-gray-300'
                            }`}
                          >
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNextToStep3}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-colors"
              >
                <span>Review & Consent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review & Consent */}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6 animate-fade-in">
            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                Step 3 of 3 — Final Review
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">
                Confirm your submission
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Please double-check your summary. Once submitted, our AI triage engine will generate a structured summary for your counsellor.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-gray-200/80 space-y-3 text-sm">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Concern Category
                </span>
                <span className="font-semibold text-gray-800 capitalize">
                  {concernCategory.replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Your Description
                </span>
                <p className="text-gray-700 whitespace-pre-wrap mt-1 text-xs sm:text-sm italic">
                  "{subjectiveResponse}"
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                  Questionnaire Answers
                </span>
                <span className="text-xs text-gray-600">
                  {questions.length} questions completed ({Object.values(answers).filter(a => a === 'Not Sure').length} marked as "Not Sure")
                </span>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p>
                By clicking Submit, your responses will be securely transmitted to university counselling. A human counsellor will review your case and reach out through your university email.
              </p>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Transmitting Request...' : 'Submit Counselling Request'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Success & Confirmation (PRD Section 19 & 24) */}
        {step === 4 && submissionResult && (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-xl text-center space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="max-w-md mx-auto">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Request #{submissionResult.requestId} Confirmed
              </span>
              <h1 className="text-2xl font-bold text-gray-900 mt-3">
                Thank you. Your counselling request has been successfully submitted.
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Your responses are being reviewed so we can connect you with the appropriate support.
              </p>
            </div>

            {/* Expected Response Card (PRD Section 19 & 24) */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 max-w-md mx-auto text-left space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>Expected Response Time</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {submissionResult.expectedResponse}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                A qualified counsellor will review your intake details and email you directly with appointment booking options or next steps.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate(`/counselling/request/${submissionResult.requestId}`)}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
              >
                Track Request Status
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
