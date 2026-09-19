import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Mail, User, Building2, Phone, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { apiClient } from '../../services/api';
import { BusinessLead } from '../../types';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  source?: string;
  uploadedFileName?: string | null;
  onSuccess?: (lead: BusinessLead) => void;
  title?: string;
  subtitle?: string;
}

// RFC-compliant email validation on frontend (Requirement 3 & 11)
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return regex.test(trimmed) && trimmed.length <= 254;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  source = 'Chatbot Consultation',
  uploadedFileName,
  onSuccess,
  title = 'Connect with Resa Formulation Desk',
  subtitle = 'Receive customized product specifications, manufacturing brochures, and private consultation.'
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation for email (Requirement 3 & 11)
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

      // Requirement 11: "If submission is successful: 'Thanks! Your details have been saved.'"
      setSuccessMessage(res.message || 'Thanks! Your details have been saved.');
      if (onSuccess && res.lead) {
        onSuccess(res.lead);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Please enter a valid email address.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="lead-capture-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fadeIn"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="lead-capture-modal-dialog"
        className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scaleUp text-[#201E1D]"
      >
        {/* Header */}
        <div className="bg-[#FAF7F2] border-b border-[#ECE5D8] px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8C7355] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              R
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#201E1D] leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-[#7A746C] mt-0.5">
                Resa Life Sci • Cosmetic R&D & Formulation Desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close form"
            className="p-1 rounded-lg text-[#8C867D] hover:text-[#201E1D] hover:bg-[#EFEAE1] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMessage ? (
            <div id="lead-capture-success-panel" className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-[#201E1D]">
                  {successMessage}
                </h4>
                <p className="text-xs text-[#6B6661] mt-2 max-w-xs mx-auto leading-relaxed">
                  Our technical formulation and consulting team has been notified at{' '}
                  <span className="font-medium text-[#201E1D]">vs059899@gmail.com</span>. We will contact you at{' '}
                  <span className="font-medium text-[#8C7355]">{email}</span> shortly.
                </p>
              </div>

              {uploadedFileName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] border border-[#E8E2D6] rounded-lg text-xs text-[#524E48]">
                  <FileText className="w-3.5 h-3.5 text-[#8C7355]" />
                  <span>Specification attached: {uploadedFileName}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  id="lead-capture-success-close-btn"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 bg-[#201E1D] hover:bg-[#383532] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Continue to Assistant
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-[#5C5750] leading-relaxed">
                {subtitle}
              </p>

              {/* Uploaded file status alert if present */}
              {uploadedFileName && (
                <div className="flex items-center gap-2 p-2.5 bg-[#FAF7F2] border border-[#E5DEC9] rounded-xl text-xs text-[#524E48]">
                  <FileText className="w-4 h-4 text-[#8C7355] shrink-0" />
                  <div className="truncate">
                    <span className="font-semibold text-[#201E1D]">File attached: </span>
                    <span className="text-[#8C7355]">{uploadedFileName}</span>
                  </div>
                </div>
              )}

              {/* Error Message (Requirement 11) */}
              {errorMessage && (
                <div
                  id="lead-capture-error-message"
                  className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#9C9488] absolute left-3 top-2.5" />
                  <input
                    id="lead-form-fullname"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl focus:outline-none focus:border-[#8C7355] focus:bg-white text-[#201E1D] transition-colors"
                  />
                </div>
              </div>

              {/* Email Address (Required) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48]">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#8C867D]">Required</span>
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9C9488] absolute left-3 top-2.5" />
                  <input
                    id="lead-form-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="priya@example.com"
                    className={`w-full text-xs pl-9 pr-3 py-2.5 bg-[#FAF8F5] border rounded-xl focus:outline-none focus:bg-white text-[#201E1D] transition-colors ${
                      errorMessage ? 'border-red-400 focus:border-red-500' : 'border-[#DDD5C7] focus:border-[#8C7355]'
                    }`}
                  />
                </div>
              </div>

              {/* Company Name (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48]">
                    Company Name
                  </label>
                  <span className="text-[10px] text-[#8C867D]">Optional</span>
                </div>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#9C9488] absolute left-3 top-2.5" />
                  <input
                    id="lead-form-company"
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Aura Botanics / Salon Luxe"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl focus:outline-none focus:border-[#8C7355] focus:bg-white text-[#201E1D] transition-colors"
                  />
                </div>
              </div>

              {/* Phone Number (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48]">
                    Phone Number
                  </label>
                  <span className="text-[10px] text-[#8C867D]">Optional</span>
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9C9488] absolute left-3 top-2.5" />
                  <input
                    id="lead-form-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl focus:outline-none focus:border-[#8C7355] focus:bg-white text-[#201E1D] transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="lead-form-submit-btn"
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-[#8C7355] hover:bg-[#786144] disabled:bg-[#B0A696] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Submit Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8C867D] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Your information is kept strictly private &bull; No spam</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
