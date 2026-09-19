import React from 'react';
import { Sparkles, TrendingUp, CheckCircle } from 'lucide-react';

interface KeyInsightsPanelProps {
  insights: string[];
}

export const KeyInsightsPanel: React.FC<KeyInsightsPanelProps> = ({ insights }) => {
  return (
    <div
      id="key-insights-panel"
      className="bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE4] border border-[#E5DEC] rounded-2xl p-5 shadow-2xs"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#EAE2D2]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#8C7355]/15 flex items-center justify-center text-[#8C7355]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-serif font-bold text-base text-[#201E1D]">
            📊 Key Insights
          </h3>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7355] bg-white border border-[#E2D9C9] px-2.5 py-0.5 rounded-full">
          Calculated from Stored Analytics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-[#ECE5D8] text-xs text-[#3D3934] leading-relaxed shadow-2xs"
          >
            <div className="w-4 h-4 rounded-full bg-[#EAE2D2] text-[#8C7355] flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-2.5 h-2.5" />
            </div>
            <span>{insight}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
