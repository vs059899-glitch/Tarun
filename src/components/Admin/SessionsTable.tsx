import React, { useState } from 'react';
import { Search, ArrowUpDown, Smartphone, Monitor, Tablet } from 'lucide-react';
import { ChatSession } from '../../types';

interface SessionsTableProps {
  sessions: ChatSession[];
}

export const SessionsTable: React.FC<SessionsTableProps> = ({ sessions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'consumer' | 'business'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'messages'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredSessions = sessions
    .filter(s => {
      const matchesSearch =
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.primaryConcern && s.primaryConcern.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.recommendationGiven && s.recommendationGiven.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesMode =
        modeFilter === 'all' ? true : s.userMode === modeFilter;

      return matchesSearch && matchesMode;
    })
    .sort((a, b) => {
      if (sortBy === 'messages') {
        return sortOrder === 'desc' ? b.messageCount - a.messageCount : a.messageCount - b.messageCount;
      }
      return sortOrder === 'desc'
        ? new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        : new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

  const toggleSort = (col: 'date' | 'messages') => {
    if (sortBy === col) {
      setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  const getDeviceIcon = (dev: string) => {
    if (dev === 'Mobile') return <Smartphone className="w-3.5 h-3.5 text-[#8C867D]" />;
    if (dev === 'Tablet') return <Tablet className="w-3.5 h-3.5 text-[#8C867D]" />;
    return <Monitor className="w-3.5 h-3.5 text-[#8C867D]" />;
  };

  return (
    <div id="analytics-sessions-table-card" className="bg-white border border-[#ECE5D8] rounded-2xl p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif font-bold text-base text-[#201E1D]">
            Detailed Session Logs
          </h3>
          <p className="text-xs text-[#7A746B]">
            Anonymous interaction telemetry and consultation outcomes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C867D] absolute left-3 top-2.5" />
            <input
              id="session-search-input"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search session or concern..."
              className="text-xs pl-8 pr-3 py-1.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#201E1D] w-48"
            />
          </div>

          {/* Mode Filter */}
          <select
            id="session-mode-filter"
            value={modeFilter}
            onChange={e => setModeFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg focus:outline-none focus:border-[#8C7355] text-[#201E1D]"
          >
            <option value="all">All Intent Types</option>
            <option value="consumer">Consumer Only</option>
            <option value="business">Business Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table id="sessions-table" className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#ECE5D8] bg-[#FAF8F4] text-[#69645E]">
              <th
                onClick={() => toggleSort('date')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#201E1D]"
              >
                <div className="flex items-center gap-1">
                  <span>Date & Time</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Session ID</th>
              <th className="py-2.5 px-3 font-semibold">User Type</th>
              <th className="py-2.5 px-3 font-semibold">Primary Concern</th>
              <th className="py-2.5 px-3 font-semibold">Recommendation</th>
              <th className="py-2.5 px-3 font-semibold">Business Enquiry</th>
              <th className="py-2.5 px-3 font-semibold">Contact Action</th>
              <th
                onClick={() => toggleSort('messages')}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-[#201E1D]"
              >
                <div className="flex items-center gap-1">
                  <span>Messages</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0ECE4]">
            {filteredSessions.length > 0 ? (
              filteredSessions.map(session => (
                <tr key={session.id} className="hover:bg-[#FCFAF7] transition-colors">
                  <td className="py-2.5 px-3 text-[#524E48] whitespace-nowrap">
                    {new Date(session.startTime).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#706A62]">
                    <div className="flex items-center gap-1.5">
                      {getDeviceIcon(session.deviceType)}
                      <span>{session.id.slice(-8)}</span>
                      {session.isDemo && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-sans">
                          demo
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        session.userMode === 'business'
                          ? 'bg-[#EBF3EF] text-[#2D5A46]'
                          : session.userMode === 'consumer'
                          ? 'bg-[#F9F4EC] text-[#8C7355]'
                          : 'bg-[#EFECE6] text-[#69645E]'
                      }`}
                    >
                      {session.userMode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#403B35]">
                    {session.primaryConcern || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-[#403B35] font-medium">
                    {session.recommendationGiven || '—'}
                  </td>
                  <td className="py-2.5 px-3">
                    {session.enquirySubmitted ? (
                      <span className="text-emerald-700 font-medium">Submitted</span>
                    ) : session.enquiryStarted ? (
                      <span className="text-amber-700">Started</span>
                    ) : (
                      <span className="text-[#8C867D]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-[#524E48]">
                    {session.contactActionTaken || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-[#524E48] text-center">
                    {session.messageCount}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md ${
                        session.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-6 text-center text-xs text-[#8C867D]">
                  No sessions match the current filter or search query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
