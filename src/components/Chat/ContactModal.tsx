import React from 'react';
import { X, Phone, MessageSquare, Mail, MapPin, ExternalLink } from 'lucide-react';
import { RESA_COMPANY_INFO } from '../../data/brands';
import { apiClient } from '../../services/api';

interface ContactModalProps {
  sessionId: string;
  onClose: () => void;
  onActionLogged?: (action: string) => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  sessionId,
  onClose,
  onActionLogged
}) => {
  const handleWhatsApp = () => {
    apiClient.logEvent({
      sessionId,
      eventType: 'WHATSAPP_CLICKED',
      category: 'General',
      metadata: { target: 'whatsapp' }
    });
    if (onActionLogged) onActionLogged('WhatsApp');
    window.open(`https://wa.me/${RESA_COMPANY_INFO.whatsapp}?text=Hello%20Resa%20Life%20Sci%2C%20I%20am%20inquiring%20via%20the%20AI%20Assistant`, '_blank');
  };

  const handleCall = () => {
    apiClient.logEvent({
      sessionId,
      eventType: 'CALL_CLICKED',
      category: 'General',
      metadata: { target: 'phone' }
    });
    if (onActionLogged) onActionLogged('Call');
    window.location.href = `tel:${RESA_COMPANY_INFO.phone}`;
  };

  const handleEmail = () => {
    apiClient.logEvent({
      sessionId,
      eventType: 'CONTACT_CLICKED',
      category: 'General',
      metadata: { target: 'email' }
    });
    if (onActionLogged) onActionLogged('Contact Us');
    window.location.href = `mailto:${RESA_COMPANY_INFO.email}?subject=Resa%20AI%20Assistant%20Inquiry`;
  };

  return (
    <div
      id="contact-modal-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="contact-modal"
        className="bg-[#FDFBF7] border border-[#E8E1D3] rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#EFE8DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8C7355]/10 flex items-center justify-center text-[#8C7355]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#201E1D]">
                Contact Resa Life Sci
              </h3>
              <p className="text-xs text-[#7A746B]">Bawana, New Delhi, India</p>
            </div>
          </div>
          <button
            id="close-contact-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#88837A] hover:text-[#201E1D] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <button
            id="contact-whatsapp-btn"
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F0] hover:bg-[#F3ECE0] border border-[#E2DACB] rounded-xl transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#25D366]/15 flex items-center justify-center text-[#1E9E4B]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#201E1D]">Chat on WhatsApp</div>
                <div className="text-[11px] text-[#6B665F]">Direct chat with technical desk</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8C7355] opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            id="contact-call-btn"
            onClick={handleCall}
            className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F0] hover:bg-[#F3ECE0] border border-[#E2DACB] rounded-xl transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#8C7355]/15 flex items-center justify-center text-[#8C7355]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#201E1D]">Direct Phone Call</div>
                <div className="text-[11px] text-[#6B665F]">{RESA_COMPANY_INFO.phone}</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8C7355] opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            id="contact-email-btn"
            onClick={handleEmail}
            className="w-full flex items-center justify-between p-3.5 bg-[#FAF7F0] hover:bg-[#F3ECE0] border border-[#E2DACB] rounded-xl transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#201E1D]/10 flex items-center justify-center text-[#201E1D]">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[#201E1D]">Email Inquiries</div>
                <div className="text-[11px] text-[#6B665F]">{RESA_COMPANY_INFO.email}</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[#8C7355] opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="pt-3 border-t border-[#EFE8DC] flex items-center gap-2 text-xs text-[#7A746B]">
            <MapPin className="w-4 h-4 text-[#8C7355] shrink-0" />
            <span>Manufacturing Facility: Bawana Industrial Area, New Delhi, India</span>
          </div>
        </div>
      </div>
    </div>
  );
};
