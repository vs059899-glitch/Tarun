import React, { useState } from 'react';
import { Send, CheckCircle2, User, Mail, Building2, Phone, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { apiClient } from '../../services/api';
import { BusinessLead } from '../../types';
import { isValidEmail } from './LeadCaptureModal';

interface LeadCaptureCardProps {
  sessionId: string;
  source?: string;
  uploadedFileName?: string | null;
  onSubmitted?: (lead: BusinessLead) => void;
  title?: string;
  description?: string;
}

export const LeadCaptureCard: React.FC<LeadCaptureCardProps> = ({
  sessionId,
  source = 'Chatbot Consultation',
  uploadedFileName,
  onSubmitted,
  title = 'Save Consultation & Get Formulation Dossier',
  description = 'Leave your email to receive this consultation summary, formulation insights, and sample requests from Resa Life Sci.'
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend email validation (Requirement 3 & 11)
    if (!email || !isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const uploadedFileStatus = uploadedFileName
        ? `Uploaded: ${uploadedFileName}`
        : 'No File Uploaded';

      const res = await apiClient.captureLead({
        fullName: fullName.trim() || 'Valued Visitor',
        email: email.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim() || undefined,
        source,
        sessionId,
        uploadedFileStatus
      });

      setSubmitted(true);
      if (onSubmitted && res.lead) {
        onSubmitted(res.lead);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Please enter a valid email address.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        id="in-chat-lead-success-card"
        className="mt-3 bg-[#FAF8F5] border border-[#E0D7C9] rounded-xl p-4 text-[#201E1D] shadow-2xs animate-fadeIn"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#8C7355] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-serif font-semibold text-sm text-[#201E1D]">
              Thanks! Your details have been saved.
            </h4>
            <p className="text-xs text-[#5C5750] leading-relaxed">
              We have dispatched your consultation dossier request to our team (vs059899@gmail.com). You will receive our follow-up at <span className="font-semibold text-[#8C7355]">{email}</span>.
            </p>
            {uploadedFileName && (
              <div className="inline-flex items-center gap-1.5 text-[11px] text-[#6B6661] bg-white border border-[#E5DEC9] px-2 py-0.5 rounded-md mt-1">
                <FileText className="w-3 h-3 text-[#8C7355]" />
                <span>Linked brief: {uploadedFileName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="in-chat-lead-capture-card"
      className="mt-3 bg-white border border-[#E2D9CB] rounded-xl p-4 text-[#201E1D] shadow-2xs max-w-md animate-fadeIn"
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#F0EAE0]">
        <div className="w-6 h-6 rounded-md bg-[#FAF5ED] border border-[#E0D5C5] text-[#8C7355] flex items-center justify-center text-xs font-serif font-bold">
          R
        </div>
        <h4 className="font-serif font-semibold text-xs sm:text-sm text-[#201E1D]">
          {title}
        </h4>
      </div>

      <p className="text-xs text-[#5C5750] mb-3 leading-relaxed">
        {description}
      </p>

      {uploadedFileName && (
        <div className="mb-3 flex items-center gap-2 p-2 bg-[#FAF8F5] border border-[#E6DEC9] rounded-lg text-xs text-[#524E48]">
          <FileText className="w-3.5 h-3.5 text-[#8C7355] shrink-0" />
          <span className="truncate">
            File attached: <strong className="text-[#201E1D]">{uploadedFileName}</strong>
          </span>
        </div>
      )}

      {/* Error Message (Requirement 11) */}
      {errorMessage && (
        <div
          id="in-chat-lead-error"
          className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#66625D] mb-0.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#9E9891] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] focus:bg-white text-[#201E1D]"
              />
            </div>
          </div>

          {/* Email Address (Required) */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#66625D] mb-0.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#9E9891] absolute left-2.5 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="name@example.com"
                className={`w-full text-xs pl-8 pr-2.5 py-1.5 bg-[#FAF8F5] border rounded-lg focus:outline-none focus:bg-white text-[#201E1D] ${
                  errorMessage ? 'border-red-400' : 'border-[#DDD7CD] focus:border-[#8C7355]'
                }`}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Company Name (Optional) */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#66625D] mb-0.5">
              Company (Optional)
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-[#9E9891] absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Brand / Salon"
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] focus:bg-white text-[#201E1D]"
              />
            </div>
          </div>

          {/* Phone Number (Optional) */}
          <div>
            <label className="block text-[10px] uppercase font-semibold text-[#66625D] mb-0.5">
              Phone (Optional)
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#9E9891] absolute left-2.5 top-2.5" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] focus:bg-white text-[#201E1D]"
              />
            </div>
          </div>
        </div>

        <div className="pt-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[10px] text-[#8C867D]">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Private & Confidential</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="py-1.5 px-3.5 bg-[#8C7355] hover:bg-[#786144] disabled:bg-[#B0A696] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {submitting ? (
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Save Details</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
