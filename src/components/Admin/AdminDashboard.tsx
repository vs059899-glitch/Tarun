import React, { useState, useEffect } from 'react';
import {
  Building2,
  ArrowLeft,
  Download,
  Database,
  Trash2,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Layers,
  Users,
  Code,
  Globe,
  ExternalLink,
  Copy,
  Check,
  X
} from 'lucide-react';
import { BusinessLead, ChatSession, DateFilterOption } from '../../types';
import { DateFilterBar } from './DateFilterBar';
import { KpiCards } from './KpiCards';
import { KeyInsightsPanel } from './KeyInsightsPanel';
import { AnalyticsCharts } from './AnalyticsCharts';
import { SessionsTable } from './SessionsTable';
import { LeadsTable } from './LeadsTable';
import { apiClient } from '../../services/api';

interface AdminDashboardProps {
  onBackToChat: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToChat,
  onLogout
}) => {
  const [selectedFilter, setSelectedFilter] = useState<DateFilterOption>('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeTab, setActiveTab] = useState<'sessions' | 'leads'>('sessions');

  const [metrics, setMetrics] = useState<any>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<!-- Resa AI Assistant Widget for resalifescience.in -->
<script>
  (function() {
    var d = document, s = d.createElement('script');
    s.src = '${window.location.origin}/widget.js';
    s.async = true;
    s.dataset.domain = 'resalifescience.in';
    s.dataset.primaryBrand = 'Keragraphy & Calveo';
    d.head.appendChild(s);
  })();
</script>
<div id="resa-ai-assistant-container" data-host="resalifescience.in"></div>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsRes, sessionsRes, leadsRes] = await Promise.all([
        apiClient.getMetrics(selectedFilter, customStart, customEnd),
        apiClient.getSessions(),
        apiClient.getLeads()
      ]);

      setMetrics(metricsRes);
      setSessions(sessionsRes);
      setLeads(leadsRes);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedFilter]);

  const handleApplyCustomDate = () => {
    if (customStart && customEnd) {
      fetchDashboardData();
    }
  };

  const handleGenerateDemoData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.generateDemoData();
      setActionMessage(`Demo data generated: ${res.sessionsCreated} sessions & ${res.leadsCreated} business leads.`);
      await fetchDashboardData();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to generate demo data');
      setLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.clearDemoData();
      setActionMessage(`Demo records removed: ${res.sessionsRemoved} sessions & ${res.leadsRemoved} leads.`);
      await fetchDashboardData();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to clear demo data');
      setLoading(false);
    }
  };

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-[#FBF9F5] text-[#222120] flex flex-col">
      {/* Top Header */}
      <header
        id="admin-dashboard-header"
        className="bg-white border-b border-[#ECE5D8] px-4 py-3 sm:px-8 sticky top-0 z-20 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              id="back-to-chat-btn"
              onClick={onBackToChat}
              className="p-2 rounded-xl border border-[#DDD5C7] hover:bg-[#F9F7F2] text-[#403B35] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Chat</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-[#201E1D] tracking-tight">
                  Resa AI Analytics
                </h1>
                <span className="text-[10px] uppercase font-semibold tracking-wider bg-[#201E1D] text-white px-2 py-0.5 rounded-full">
                  Admin Desk
                </span>
                {metrics?.isDemoDataActive && (
                  <span
                    id="demo-data-active-badge"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full animate-pulse"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Demo Presentation Data Active</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7A746B]">
                Internal analytics, recommendation telemetry & lead generation system
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live site link */}
            <a
              id="admin-site-link"
              href="https://resalifescience.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-white border border-[#DDD5C7] hover:bg-[#F9F7F2] text-[#403B35] text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#8C7355]" />
              <span className="hidden sm:inline">resalifescience.in</span>
              <ExternalLink className="w-3 h-3 text-[#A89F91]" />
            </a>

            {/* Elementor Embed Snippet Button */}
            <button
              id="admin-embed-snippet-btn"
              onClick={() => setShowEmbedModal(true)}
              className="px-2.5 py-1.5 bg-[#FAF2E6] border border-[#DFCBB5] hover:bg-[#F4E9D8] text-[#8C7355] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Embed Code</span>
            </button>

            {/* Demo Data Actions */}
            <div className="flex items-center gap-1 bg-[#FAF7F2] border border-[#DDD5C7] rounded-xl p-1">
              <button
                id="generate-demo-data-btn"
                onClick={handleGenerateDemoData}
                title="Generate realistic sample analytics data for presentations"
                className="px-2.5 py-1 text-xs font-medium text-[#403B35] hover:text-[#201E1D] hover:bg-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-[#8C7355]" />
                <span>Demo Data</span>
              </button>
              {metrics?.isDemoDataActive && (
                <button
                  id="clear-demo-data-btn"
                  onClick={handleClearDemoData}
                  title="Remove all demo data"
                  className="px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  <span>Clear Demo</span>
                </button>
              )}
            </div>

            {/* CSV Export */}
            <div className="flex items-center gap-1">
              <button
                id="export-leads-csv-btn"
                onClick={() => apiClient.exportCsv('leads')}
                className="px-3 py-1.5 bg-white border border-[#DDD5C7] hover:bg-[#F9F7F2] text-[#403B35] text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#8C7355]" />
                <span>Export Leads</span>
              </button>

              <button
                id="export-events-csv-btn"
                onClick={() => apiClient.exportCsv('events')}
                className="px-3 py-1.5 bg-white border border-[#DDD5C7] hover:bg-[#F9F7F2] text-[#403B35] text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#8C7355]" />
                <span>Export Events</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              id="refresh-dashboard-btn"
              onClick={fetchDashboardData}
              title="Refresh Analytics"
              className="p-2 bg-white border border-[#DDD5C7] hover:bg-[#F9F7F2] text-[#524E48] rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Logout */}
            <button
              id="admin-logout-btn"
              onClick={onLogout}
              title="Sign Out"
              className="p-2 bg-[#FAF8F5] border border-[#DDD5C7] hover:bg-red-50 hover:text-red-700 text-[#524E48] rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {actionMessage && (
          <div
            id="action-feedback-banner"
            className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between animate-in fade-in"
          >
            <span>{actionMessage}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Date Filter Bar */}
        <DateFilterBar
          selectedFilter={selectedFilter}
          onSelectFilter={setSelectedFilter}
          customStart={customStart}
          customEnd={customEnd}
          onCustomStartChange={setCustomStart}
          onCustomEndChange={setCustomEnd}
          onApplyCustom={handleApplyCustomDate}
        />

        {metrics && (
          <>
            {/* Top KPI Cards */}
            <KpiCards data={metrics.kpi} />

            {/* Key Insights Panel */}
            <KeyInsightsPanel insights={metrics.insights} />

            {/* Professional Analytics Charts */}
            <AnalyticsCharts charts={metrics.charts} />
          </>
        )}

        {/* Data Tables Navigation */}
        <div className="pt-4 border-t border-[#ECE5D8]">
          <div className="flex items-center gap-2 mb-4">
            <button
              id="tab-btn-sessions"
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-[#201E1D] text-white shadow-xs'
                  : 'bg-white border border-[#DDD5C7] text-[#5C5750] hover:bg-[#F9F7F2]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Session Logs ({sessions.length})</span>
            </button>

            <button
              id="tab-btn-leads"
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                activeTab === 'leads'
                  ? 'bg-[#201E1D] text-white shadow-xs'
                  : 'bg-white border border-[#DDD5C7] text-[#5C5750] hover:bg-[#F9F7F2]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Business Leads ({leads.length})</span>
            </button>
          </div>

          {activeTab === 'sessions' ? (
            <SessionsTable sessions={sessions} />
          ) : (
            <LeadsTable leads={leads} onStatusUpdated={fetchDashboardData} />
          )}
        </div>
      </main>

      {/* Embed Code Modal */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDD5C7] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D8] mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#8C7355]" />
                <h3 className="font-serif font-bold text-[#201E1D]">
                  Embed Widget on resalifescience.in
                </h3>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="p-1 hover:bg-[#FAF7F2] rounded-lg text-[#7A746B] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#6E6962] mb-3 leading-relaxed">
              Use this code snippet to embed the Resa AI Assistant directly on <strong>resalifescience.in</strong>:
            </p>

            <ol className="text-xs text-[#5A544C] list-decimal list-inside space-y-1 mb-3 bg-[#FAF8F4] p-3 rounded-xl border border-[#ECE4D6]">
              <li>In your WordPress dashboard, open Elementor Editor or your Theme Customizer.</li>
              <li>Add an <strong>HTML Widget</strong> to the global footer or template.</li>
              <li>Paste the snippet below and click <strong>Update / Publish</strong>.</li>
            </ol>

            <div className="relative mb-4">
              <pre className="bg-[#1E1C1A] text-[#EBE6DF] p-3.5 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                {embedSnippet}
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-2.5 right-2.5 px-3 py-1.5 bg-[#8C7355] hover:bg-[#A38663] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="https://resalifescience.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#8C7355] hover:underline flex items-center gap-1"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit resalifescience.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-1.5 bg-[#201E1D] text-white text-xs font-medium rounded-xl hover:bg-[#383431] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
