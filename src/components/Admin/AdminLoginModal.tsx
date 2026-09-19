import React, { useState } from 'react';
import { Lock, ShieldCheck, X, ArrowRight, User, Mail, Building2, Phone, Sparkles, CheckCircle2, BarChart2 } from 'lucide-react';
import { apiClient } from '../../services/api';
import { isValidEmail } from '../LeadCapture/LeadCaptureModal';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'lead_gate' | 'admin_login'>('lead_gate');

  // Admin password state
  const [password, setPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Lead capture state (Requirement 1 & 2: Show lead form when user wants advanced data-analysis features)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadSuccess, setLeadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setAdminLoading(true);
    setAdminError(null);

    const res = await apiClient.loginAdmin(password);
    setAdminLoading(false);

    if (res.success) {
      setPassword('');
      onSuccess();
    } else {
      setAdminError(res.error || 'Invalid password. Try default: admin');
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // RFC frontend email validation (Requirement 3 & 11)
    if (!email || !isValidEmail(email)) {
      setLeadError('Please enter a valid email address.');
      return;
    }

    setLeadError(null);
    setLeadSubmitting(true);

    try {
      const res = await apiClient.captureLead({
        fullName: fullName.trim() || 'Analytics Explorer',
        email: email.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim() || undefined,
        source: 'Advanced Data Analysis Unlock',
        uploadedFileStatus: 'No File Uploaded'
      });

      // Requirement 11
      setLeadSuccess('Thanks! Your details have been saved.');
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setLeadError(err.message || 'Please enter a valid email address.');
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div
      id="admin-login-modal-overlay"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="admin-login-modal"
        className="bg-[#FDFBF7] border border-[#E5DFD3] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleUp text-[#201E1D]"
      >
        {/* Modal Header */}
        <div className="bg-[#FAF7F2] border-b border-[#ECE5D8] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#201E1D] text-[#D4AF37] flex items-center justify-center shadow-xs">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#201E1D] leading-tight">
                Cosmetics Intelligence & Analytics
              </h3>
              <p className="text-[11px] text-[#7A746B]">
                Resa Life Sci Formulation & Market Data
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#88837A] hover:text-[#201E1D] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="px-6 pt-4">
          <div className="flex bg-[#F0EBE1] p-1 rounded-xl">
            <button
              id="tab-unlock-analytics"
              onClick={() => setMode('lead_gate')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'lead_gate'
                  ? 'bg-white text-[#201E1D] shadow-2xs'
                  : 'text-[#6B665F] hover:text-[#201E1D]'
              }`}
            >
              Unlock Analytics Report
            </button>
            <button
              id="tab-admin-login"
              onClick={() => setMode('admin_login')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                mode === 'admin_login'
                  ? 'bg-white text-[#201E1D] shadow-2xs'
                  : 'text-[#6B665F] hover:text-[#201E1D]'
              }`}
            >
              Administrator Login
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {mode === 'lead_gate' ? (
            /* Lead Capture Form for Analytics Access (Requirement 1 & 2) */
            <div>
              <p className="text-xs text-[#5C5750] leading-relaxed mb-4">
                Access live cosmetic formulation analytics, user concern distributions, and brand demand statistics by submitting your details below:
              </p>

              {leadSuccess ? (
                <div id="lead-gate-success" className="py-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#201E1D]">
                    {leadSuccess}
                  </h4>
                  <p className="text-xs text-[#7A746B]">
                    Opening Analytics Dashboard for you now...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  {leadError && (
                    <div
                      id="lead-gate-error"
                      className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl"
                    >
                      {leadError}
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-2.5" />
                      <input
                        id="lead-gate-fullname"
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full text-xs pl-8.5 pr-3 py-2 bg-white border border-[#DDD5C7] rounded-xl focus:outline-none focus:border-[#8C7355] text-[#201E1D]"
                      />
                    </div>
                  </div>

                  {/* Email Address (Required) */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-2.5" />
                      <input
                        id="lead-gate-email"
                        type="email"
                        required
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (leadError) setLeadError(null);
                        }}
                        placeholder="name@company.com"
                        className={`w-full text-xs pl-8.5 pr-3 py-2 bg-white border rounded-xl focus:outline-none text-[#201E1D] ${
                          leadError ? 'border-red-400 focus:border-red-500' : 'border-[#DDD5C7] focus:border-[#8C7355]'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Company Name */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48] mb-1">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="w-3.5 h-3.5 text-[#9E9891] absolute left-2.5 top-2.5" />
                        <input
                          id="lead-gate-company"
                          type="text"
                          value={companyName}
                          onChange={e => setCompanyName(e.target.value)}
                          placeholder="Brand / Enterprise"
                          className="w-full text-xs pl-7.5 pr-2.5 py-2 bg-white border border-[#DDD5C7] rounded-xl focus:outline-none focus:border-[#8C7355] text-[#201E1D]"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#524E48] mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[#9E9891] absolute left-2.5 top-2.5" />
                        <input
                          id="lead-gate-phone"
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full text-xs pl-7.5 pr-2.5 py-2 bg-white border border-[#DDD5C7] rounded-xl focus:outline-none focus:border-[#8C7355] text-[#201E1D]"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    id="lead-gate-submit-btn"
                    type="submit"
                    disabled={leadSubmitting}
                    className="w-full mt-2 py-2.5 bg-[#8C7355] hover:bg-[#786144] disabled:bg-[#B0A696] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    {leadSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Unlock Analytics Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Admin Login Tab */
            <form onSubmit={handleAdminSubmit} className="space-y-3">
              <p className="text-xs text-[#5C5750] leading-relaxed">
                Enter administrator credentials to manage business leads, view full customer sessions, and configure parameters.
              </p>

              {adminError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {adminError}
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-3" />
                  <input
                    id="admin-password-input"
                    type="password"
                    required
                    autoFocus
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter admin password (e.g. admin)"
                    className="w-full text-xs pl-8.5 pr-3.5 py-2.5 bg-white border border-[#DDD7CD] rounded-xl focus:outline-none focus:border-[#8C7355] text-[#201E1D]"
                  />
                </div>
                <p className="text-[10px] text-[#8C867D] mt-1">
                  Default access password: <code className="bg-[#EFEBE4] px-1 py-0.5 rounded text-[#524E48]">admin</code>
                </p>
              </div>

              <button
                id="admin-login-submit-btn"
                type="submit"
                disabled={adminLoading || !password.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#201E1D] hover:bg-[#34312F] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {adminLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Login as Administrator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-[#ECE5D8] flex items-center justify-between text-[10px] text-[#8C867D]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C7355]" />
              <span>Admin notifications: vs059899@gmail.com</span>
            </div>
            <span>Resa Life Sci CRM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
