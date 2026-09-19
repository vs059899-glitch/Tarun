import React, { useEffect, useState } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BusinessLead, ChatSession, AnalyticsEvent, LeadNotificationRecord, LeadStatus } from '../../types';
import { apiClient } from '../../services/api';

interface LeadDetailModalProps {
  leadId: string | null;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  leadId,
  onClose,
  onStatusUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    lead: BusinessLead;
    session?: ChatSession;
    events?: AnalyticsEvent[];
    notifications?: LeadNotificationRecord[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!leadId) return;

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.getLeadDetails(leadId);
        setData(res);
      } catch (err: any) {
        console.error('Failed to load lead details:', err);
        setError(err.message || 'Could not load lead details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [leadId]);

  if (!leadId) return null;

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!data) return;
    setUpdatingStatus(true);
    try {
      await apiClient.updateLeadStatus(leadId, newStatus);
      setData(prev => (prev ? { ...prev, lead: { ...prev.lead, status: newStatus } } : null));
      if (onStatusUpdated) onStatusUpdated();
    } catch (err: any) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const lead = data?.lead;

  return (
    <div
      id="lead-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="lead-detail-modal-dialog"
        className="bg-[#FFFFFF] border border-[#E8E2D6] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#201E1D]"
      >
        {/* Header */}
        <div className="bg-[#FAF7F2] border-b border-[#ECE5D8] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#201E1D] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-base shadow-xs">
              {lead?.full_name ? lead.full_name.charAt(0).toUpperCase() : 'L'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#201E1D] leading-tight">
                  {lead ? lead.full_name || lead.fullName : 'Lead Profile'}
                </h3>
                {lead?.isDemo && (
                  <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Demo Lead
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A746C] mt-0.5">
                Lead ID: <span className="font-mono text-[#8C7355]">{lead?.lead_id || lead?.id || leadId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lead && (
              <select
                disabled={updatingStatus}
                value={lead.status}
                onChange={e => handleStatusChange(e.target.value as LeadStatus)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#DDD5C7] bg-white text-[#201E1D] focus:outline-none focus:border-[#8C7355] cursor-pointer"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Closed">Closed</option>
              </select>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#8C867D] hover:text-[#201E1D] hover:bg-[#EFEAE1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-16 text-center text-[#8C867D] text-xs">
              <div className="w-6 h-6 border-2 border-[#8C7355] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading complete lead profile and linked conversation...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : lead ? (
            <>
              {/* 1. Core Profile Details (Requirement 5: 10 fields) */}
              <div className="bg-[#FAF8F5] border border-[#ECE5D8] rounded-xl p-4">
                <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#8C7355] mb-3">
                  Lead Information & Specification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Full Name</span>
                    <span className="font-medium text-[#201E1D] text-sm mt-0.5 block">{lead.full_name || lead.fullName}</span>
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Email Address</span>
                    <a
                      href={`mailto:${lead.email}`}
                      className="font-medium text-[#8C7355] hover:underline text-sm mt-0.5 flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{lead.email}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Phone Number</span>
                    {lead.phone && lead.phone !== 'Not provided' ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="font-medium text-[#201E1D] hover:underline text-sm mt-0.5 flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-[#8C7355]" />
                        <span>{lead.phone}</span>
                      </a>
                    ) : (
                      <span className="text-[#8C867D] mt-0.5 block">Not provided</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Company / Brand</span>
                    <span className="font-medium text-[#201E1D] mt-0.5 block">
                      {lead.company_name || lead.companyName || 'Not specified'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Source</span>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[#ECE5D8] text-[11px] font-medium text-[#706B62] mt-0.5">
                      {lead.source || 'Chatbot Consultation'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">File Upload Status</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium mt-0.5 ${
                        lead.uploaded_file_status && lead.uploaded_file_status !== 'No File Uploaded'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#F0ECE4] text-[#8C867D]'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>{lead.uploaded_file_status || 'No File Uploaded'}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Created At</span>
                    <span className="text-[#524E48] mt-0.5 block">
                      {new Date(lead.created_at || lead.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Last Activity</span>
                    <span className="text-[#524E48] mt-0.5 block">
                      {new Date(lead.last_activity || lead.lastActivity || lead.created_at).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Linked Session ID</span>
                    <span className="font-mono text-[#7A746C] text-[11px] mt-0.5 block truncate">
                      {lead.session_id || lead.sessionId || 'None'}
                    </span>
                  </div>
                </div>

                {/* Additional Business Details */}
                {(lead.requirement || lead.productCategory) && (
                  <div className="mt-4 pt-3 border-t border-[#ECE5D8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Product Category</span>
                      <span className="font-medium text-[#201E1D] mt-0.5 block">{lead.productCategory || 'General Cosmetics'}</span>
                    </div>
                    <div>
                      <span className="text-[#8C867D] block text-[10px] uppercase font-semibold">Requirement Note</span>
                      <span className="text-[#524E48] mt-0.5 block">{lead.requirement || 'General enquiry'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Linked Chatbot Interaction (Requirement 9 & 14) */}
              <div className="bg-white border border-[#ECE5D8] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#8C7355]" />
                    <h4 className="font-serif font-bold text-sm text-[#201E1D]">
                      Linked Chatbot Interaction & Journey
                    </h4>
                  </div>
                  {data?.session && (
                    <span className="text-[10px] font-semibold text-[#8C7355] bg-[#FAF5EC] border border-[#E8DFCF] px-2 py-0.5 rounded-full">
                      {data.session.userMode.toUpperCase()} &bull; {data.session.messageCount} Messages
                    </span>
                  )}
                </div>

                {data?.session ? (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#FAF8F5] rounded-lg border border-[#F0ECE4]">
                      <div>
                        <span className="text-[10px] uppercase text-[#8C867D] block">Device</span>
                        <span className="font-semibold text-[#201E1D]">{data.session.deviceType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#8C867D] block">Duration</span>
                        <span className="font-semibold text-[#201E1D]">{data.session.durationSeconds}s</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#8C867D] block">Primary Concern</span>
                        <span className="font-semibold text-[#201E1D]">{data.session.primaryConcern || 'Consultation'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#8C867D] block">Brand Recommended</span>
                        <span className="font-semibold text-[#8C7355]">{data.session.recommendationGiven || 'None'}</span>
                      </div>
                    </div>

                    {/* Timeline of events during session */}
                    {data?.events && data.events.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[10px] uppercase font-semibold text-[#8C867D] block mb-2">
                          Interaction Event Log ({data.events.length} events)
                        </span>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {data.events.map(ev => (
                            <div
                              key={ev.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#F0EAE1] text-[11px]"
                            >
                              <div className="flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-[#8C7355]" />
                                <span className="font-medium text-[#201E1D]">{ev.eventType}</span>
                                {ev.brandRecommended && (
                                  <span className="text-[#8C7355]">({ev.brandRecommended})</span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#8C867D]">
                                {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#8C867D] bg-[#FAF8F5] rounded-lg border border-[#F0ECE4]">
                    No linked conversation record found for this lead. Lead was recorded via direct contact form or external source.
                  </div>
                )}
              </div>

              {/* 3. Automatic Email Notification Record (Requirement 7 & 8) */}
              <div className="bg-white border border-[#ECE5D8] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#8C7355]" />
                    <h4 className="font-serif font-bold text-sm text-[#201E1D]">
                      Admin Email Notification
                    </h4>
                  </div>
                  <span className="text-[10px] font-medium text-[#7A746C] bg-[#FAF8F5] border border-[#E8E2D6] px-2 py-0.5 rounded-full">
                    Target: vs059899@gmail.com
                  </span>
                </div>

                <p className="text-xs text-[#5C5750] leading-relaxed">
                  Automatic lead notifications are dispatched to <strong className="text-[#201E1D]">vs059899@gmail.com</strong> on every submission containing full contact details, date/time, source, and file upload status.
                </p>

                {data?.notifications && data.notifications.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {data.notifications.map(notif => (
                      <div
                        key={notif.id}
                        className="p-3 bg-[#FAF8F5] border border-[#ECE5D8] rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#201E1D]">{notif.subject}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              notif.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : notif.status === 'logged'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {notif.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7A746C] flex items-center justify-between pt-1">
                          <span>Recipient: {notif.recipient}</span>
                          <span>{new Date(notif.sentAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 bg-[#FAF8F5] border border-[#EAE4D9] rounded-lg text-[11px] text-[#7A746C] flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8C7355]" />
                    <span>Notification service active. Logged to server transport.</span>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-[#FAF7F2] border-t border-[#ECE5D8] px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#8C867D]">
            Resa Life Sci B2B CRM &bull; Bawana, New Delhi
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#201E1D] hover:bg-[#3A3633] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
