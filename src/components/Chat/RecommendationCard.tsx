import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { RecommendationCardData } from '../../types';

interface RecommendationCardProps {
  data: RecommendationCardData;
  onExplore: (brandName: string) => void;
  onFollowUp: (action: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  data,
  onExplore,
  onFollowUp
}) => {
  return (
    <div
      id={`recommendation-card-${data.id}`}
      className="my-3 bg-gradient-to-b from-[#FFFDF9] to-[#FBF8F2] border border-[#E8E1D3] rounded-2xl p-5 shadow-sm max-w-lg transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#F0EAE1]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#8C7355]/10 flex items-center justify-center text-[#8C7355]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8C7355]">
            Configured Recommendation
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#7A756E] bg-[#EFEBE3] px-2 py-0.5 rounded-md">
          {data.productCategory}
        </span>
      </div>

      <h3 className="font-serif font-bold text-[#201E1D] text-lg mb-1 tracking-tight">
        {data.brandName}
      </h3>
      <p className="text-xs text-[#7A746C] italic mb-3">
        "{data.brandTagline}"
      </p>

      <div className="bg-[#FAF7F0] border border-[#ECE5D8] rounded-xl p-3 mb-3 text-xs leading-relaxed text-[#403C38]">
        {data.recommendationWording}
      </div>

      <div className="space-y-1.5 mb-4">
        {data.keyBenefits.map((benefit, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-[#524E48]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#8C7355]" />
            <span>{benefit}</span>
          </div>
        ))}
      </div>

      {/* Primary CTA button */}
      <button
        id={`cta-explore-${data.brandName.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => onExplore(data.brandName)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#8C7355] hover:bg-[#786145] text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
      >
        <span>{data.ctaText}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>

      {/* Follow-up actions */}
      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#F0ECE4] text-[11px]">
        <button
          onClick={() => onFollowUp('Ask Another Question')}
          className="text-[#69645E] hover:text-[#201E1D] transition-colors py-1 cursor-pointer"
        >
          Ask Another Question
        </button>
        <button
          onClick={() => onFollowUp('Start Again')}
          className="text-[#8C7355] hover:underline transition-colors py-1 cursor-pointer"
        >
          Start New Consultation
        </button>
      </div>

      {/* Non-medical disclaimer */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-[#8C877F]">
        <ShieldCheck className="w-3 h-3 text-[#A8A39A] shrink-0" />
        <span>Cosmetic discovery guidance. Does not diagnose or treat medical conditions.</span>
      </div>
    </div>
  );
};
