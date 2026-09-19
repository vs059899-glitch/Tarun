import React from 'react';
import { Calendar, Filter } from 'lucide-react';
import { DateFilterOption } from '../../types';

interface DateFilterBarProps {
  selectedFilter: DateFilterOption;
  onSelectFilter: (filter: DateFilterOption) => void;
  customStart: string;
  customEnd: string;
  onCustomStartChange: (val: string) => void;
  onCustomEndChange: (val: string) => void;
  onApplyCustom: () => void;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  selectedFilter,
  onSelectFilter,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustom
}) => {
  const options: { key: DateFilterOption; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: '7days', label: 'Last 7 Days' },
    { key: '30days', label: 'Last 30 Days' },
    { key: 'all', label: 'All Time' },
    { key: 'custom', label: 'Custom Range' }
  ];

  return (
    <div
      id="analytics-date-filter-bar"
      className="bg-white border border-[#ECE5D8] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs"
    >
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[#8C7355]" />
        <span className="text-xs font-semibold text-[#5C5750]">Timeframe:</span>
        <div className="flex flex-wrap gap-1">
          {options.map(opt => (
            <button
              key={opt.key}
              id={`filter-btn-${opt.key}`}
              onClick={() => onSelectFilter(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedFilter === opt.key
                  ? 'bg-[#201E1D] text-white shadow-2xs'
                  : 'bg-[#F9F7F2] text-[#69645E] hover:text-[#201E1D] hover:bg-[#EFEAE0]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {selectedFilter === 'custom' && (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-[#8C7355]" />
            <input
              id="custom-date-start"
              type="date"
              value={customStart}
              onChange={e => onCustomStartChange(e.target.value)}
              className="bg-transparent text-xs text-[#201E1D] focus:outline-none"
            />
          </div>
          <span className="text-[#8C867D]">to</span>
          <div className="flex items-center gap-1 bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-2.5 py-1">
            <Calendar className="w-3.5 h-3.5 text-[#8C7355]" />
            <input
              id="custom-date-end"
              type="date"
              value={customEnd}
              onChange={e => onCustomEndChange(e.target.value)}
              className="bg-transparent text-xs text-[#201E1D] focus:outline-none"
            />
          </div>
          <button
            id="apply-custom-date-btn"
            onClick={onApplyCustom}
            className="px-3 py-1 bg-[#8C7355] hover:bg-[#786145] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};
