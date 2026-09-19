import React, { useState } from 'react';
import {
  Search,
  Building,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Eye,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { BusinessLead, LeadStatus } from '../../types';
import { apiClient } from '../../services/api';
import { LeadDetailModal } from './LeadDetailModal';

interface LeadsTableProps {
  leads: BusinessLead[];
  onStatusUpdated: () => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({ leads, onStatusUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [fileFilter, setFileFilter] = useState<'all' | 'has_file' | 'no_file'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [exportingCsv, setExportingCsv] = useState(false);

  // Extract unique sources for filter dropdown
  const uniqueSources = Array.from(
    new Set(leads.map(l => l.source).filter(Boolean))
  ) as string[];

  const filteredLeads = leads.filter(lead => {
    const fullName = lead.full_name || lead.fullName || '';
    const company = lead.company_name || lead.companyName || '';
    const email = lead.email || '';
    const phone = lead.phone || '';
    const req = lead.requirement || '';
    const source = lead.source || '';
    const fileStatus = lead.uploaded_file_status || '';

    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      req.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fileStatus.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' ? true : lead.source === sourceFilter;

    const hasFile = lead.uploaded_file_status && lead.uploaded_file_status !== 'No File Uploaded';
    const matchesFile =
      fileFilter === 'all' ? true : fileFilter === 'has_file' ? hasFile : !hasFile;

    return matchesSearch && matchesStatus && matchesSource && matchesFile;
  });

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      await apiClient.updateLeadStatus(leadId, newStatus);
      onStatusUpdated();
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      apiClient.exportCsv('leads');
    } catch (err) {
      console.error('Failed to export leads CSV:', err);
    } finally {
      setTimeout(() => setExportingCsv(false), 800);
    }
  };

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Qualified':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div id="business-leads-section" className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#F0ECE4]">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#8C7355]" />
            <h3 className="font-serif font-bold text-base text-[#201E1D]">
              Captured Leads & Inquiries
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FAF5EC] text-[#8C7355] border border-[#E9DFCF]">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'Lead' : 'Leads'}
            </span>
          </div>
          <p className="text-xs text-[#7A746B] mt-0.5">
            Real-time prospective brand leads, cosmetic inquiries, and formulation requests
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C867D] absolute left-3 top-2.5" />
            <input
              id="lead-search-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search name, brand, email..."
              className="text-xs pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#201E1D] w-48 sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <select
            id="lead-status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#201E1D] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Source Filter */}
          {uniqueSources.length > 0 && (
            <select
              id="lead-source-filter"
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#201E1D] cursor-pointer max-w-[140px] truncate"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* File Filter */}
          <select
            id="lead-file-filter"
            value={fileFilter}
            onChange={e => setFileFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#201E1D] cursor-pointer"
          >
            <option value="all">All Files</option>
            <option value="has_file">With File Attached</option>
            <option value="no_file">No File</option>
          </select>

          {/* Export to CSV Button (Requirement 9) */}
          <button
            id="export-leads-csv-btn"
            onClick={handleExportCsv}
            disabled={exportingCsv || leads.length === 0}
            className="px-3 py-1.5 bg-[#FAF5ED] hover:bg-[#F2EADB] disabled:opacity-50 text-[#8C7355] border border-[#E0D5C5] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Export all leads with complete fields to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table id="leads-table" className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#ECE5D8] bg-[#FAF8F4] text-[#69645E]">
              <th className="py-2.5 px-3 font-semibold">Created Date</th>
              <th className="py-2.5 px-3 font-semibold">Contact & Brand</th>
              <th className="py-2.5 px-3 font-semibold">Contact Info</th>
              <th className="py-2.5 px-3 font-semibold">Source</th>
              <th className="py-2.5 px-3 font-semibold">File Attached</th>
              <th className="py-2.5 px-3 font-semibold">Requirement</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE4]">
            {filteredLeads.length > 0 ? (
              filteredLeads.map(lead => {
                const fullName = lead.full_name || lead.fullName || 'Anonymous';
                const companyName = lead.company_name || lead.companyName || 'Not specified';
                const createdAt = lead.created_at || lead.createdAt;
                const source = lead.source || 'Chatbot Consultation';
                const uploadedFileStatus = lead.uploaded_file_status || 'No File Uploaded';
                const hasFile = uploadedFileStatus !== 'No File Uploaded';

                return (
                  <tr
                    key={lead.id || lead.lead_id}
                    className="hover:bg-[#FCFAF7] transition-colors group cursor-pointer"
                    onClick={() => setSelectedLeadId(lead.lead_id || lead.id)}
                  >
                    {/* Created Date */}
                    <td className="py-3 px-3 text-[#524E48] whitespace-nowrap">
                      <div>
                        {new Date(createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-[10px] text-[#8C867D]">
                        {new Date(createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Contact & Brand */}
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#201E1D] flex items-center gap-1.5">
                        <span>{fullName}</span>
                        {lead.isDemo && (
                          <span className="text-[9px] uppercase font-bold bg-amber-100 text-amber-800 px-1 rounded">
                            demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#7A746B] flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-[#8C7355]" />
                        <span>{companyName}</span>
                      </div>
                    </td>

                    {/* Contact Channels */}
                    <td className="py-3 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col gap-1 text-[11px]">
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 text-[#8C7355] hover:underline"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </a>
                        {lead.phone && lead.phone !== 'Not provided' && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 text-[#524E48] hover:text-[#201E1D] hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#FAF5ED] border border-[#ECE5D8] text-[10px] font-medium text-[#706B62]">
                        {source}
                      </span>
                    </td>

                    {/* File Attached */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {hasFile ? (
                        <span
                          title={uploadedFileStatus}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="max-w-[120px] truncate">{uploadedFileStatus}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#A0988E]">No File</span>
                      )}
                    </td>

                    {/* Requirement */}
                    <td className="py-3 px-3 text-[#403B35] max-w-xs">
                      <p className="line-clamp-2 text-xs">{lead.requirement || 'General enquiry'}</p>
                    </td>

                    {/* Status Select */}
                    <td className="py-3 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <select
                        id={`lead-status-select-${lead.id || lead.lead_id}`}
                        disabled={updatingId === (lead.id || lead.lead_id)}
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.lead_id || lead.id, e.target.value as LeadStatus)}
                        className={`text-xs px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadgeClass(
                          lead.status
                        )}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLeadId(lead.lead_id || lead.id)}
                        className="p-1.5 text-[#8C867D] hover:text-[#201E1D] hover:bg-[#F2ECE1] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="View Complete Lead Profile & Linked Chat History"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#8C7355]" />
                        <span className="text-[11px] font-medium">Details</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-[#8C867D]">
                  No leads found matching current search or filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Full Lead Detail Modal */}
      {selectedLeadId && (
        <LeadDetailModal
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
          onStatusUpdated={onStatusUpdated}
        />
      )}
    </div>
  );
};
