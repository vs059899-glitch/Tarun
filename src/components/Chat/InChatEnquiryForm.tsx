import React, { useState } from 'react';
import { Send, CheckCircle2, Building2, User, Mail, Phone, Layers, Sparkles } from 'lucide-react';
import { apiClient } from '../../services/api';

interface InChatEnquiryFormProps {
  sessionId: string;
  onSubmitted: (leadData: any) => void;
}

export const InChatEnquiryForm: React.FC<InChatEnquiryFormProps> = ({ sessionId, onSubmitted }) => {
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [productCategory, setProductCategory] = useState('Haircare');
  const [requirement, setRequirement] = useState('');
  const [estimatedQuantity, setEstimatedQuantity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      setError('Please provide your name, phone number, and email.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiClient.submitLead({
        fullName: fullName.trim(),
        companyName: companyName.trim() || 'Private Entrepreneur',
        phone: phone.trim(),
        email: email.trim(),
        productCategory,
        requirement: requirement.trim() || 'Cosmetics manufacturing enquiry',
        estimatedQuantity: estimatedQuantity.trim() || undefined,
        sessionId
      });

      setSubmitted(true);
      onSubmitted(res.lead);
    } catch (err: any) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div id="enquiry-success-box" className="bg-[#FAF7F2] border border-[#E5DFD5] rounded-2xl p-5 my-3 shadow-xs">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#8C7355] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-medium text-[#222120] text-base">Enquiry Recorded</h4>
            <p className="text-sm text-[#5C5955] mt-1 leading-relaxed">
              Thank you for your enquiry. Your details have been recorded into our business database. A Resa Life Sci technical manufacturing representative will connect with you shortly.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#8C7355] bg-[#EFECE6] px-2.5 py-1 rounded-full font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Resa B2B Manufacturing Desk</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="business-enquiry-form-card" className="bg-white border border-[#E8E3DA] rounded-2xl p-5 my-3 shadow-xs max-w-lg">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F0ECE4]">
        <Building2 className="w-4 h-4 text-[#8C7355]" />
        <h4 className="font-serif font-semibold text-[#222120] text-base">Start Business & Manufacturing Enquiry</h4>
      </div>

      <p className="text-xs text-[#6B6661] mb-4">
        Direct connection with Resa Life Sci formulation & manufacturing team (Bawana, New Delhi).
      </p>

      {error && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-2.5" />
              <input
                id="enquiry-input-name"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#222120]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
              Company / Brand Name
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-2.5" />
              <input
                id="enquiry-input-company"
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Aura Botanica"
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#222120]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-2.5" />
              <input
                id="enquiry-input-phone"
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#222120]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
              Email *
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-2.5" />
              <input
                id="enquiry-input-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#222120]"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
              Product Category
            </label>
            <div className="relative">
              <Layers className="w-3.5 h-3.5 text-[#9E9891] absolute left-3 top-2.5" />
              <select
                id="enquiry-select-category"
                value={productCategory}
                onChange={e => setProductCategory(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#222120]"
              >
                <option value="Haircare">Haircare & Shampoo</option>
                <option value="Skincare">Skincare & Creams</option>
                <option value="Facial Care">Facial Serums & Care</option>
                <option value="Body Care">Body Care & Bath</option>
                <option value="Custom Formulation">Custom New Formulation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
              Estimated Quantity (Optional)
            </label>
            <input
              id="enquiry-input-quantity"
              type="text"
              value={estimatedQuantity}
              onChange={e => setEstimatedQuantity(e.target.value)}
              placeholder="e.g. 1,000 - 5,000 units"
              className="w-full text-xs px-3 py-2 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#222120]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#66625D] mb-1">
            Manufacturing Requirement Details
          </label>
          <textarea
            id="enquiry-input-requirement"
            rows={2}
            value={requirement}
            onChange={e => setRequirement(e.target.value)}
            placeholder="Describe your desired formulation, ingredients focus, packaging preference, or target market..."
            className="w-full text-xs p-2.5 bg-[#FAF8F5] border border-[#DDD7CD] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#222120]"
          />
        </div>

        <button
          id="enquiry-submit-button"
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#201E1D] text-[#FAF8F5] hover:bg-[#34312F] text-xs font-semibold rounded-lg transition-colors duration-150 disabled:opacity-60 cursor-pointer"
        >
          {submitting ? (
            <span>Recording Enquiry...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Enquiry</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
