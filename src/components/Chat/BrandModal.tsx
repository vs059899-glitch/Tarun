import React from 'react';
import { X, Sparkles, Check, Building } from 'lucide-react';
import { RESA_BRANDS } from '../../data/brands';

interface BrandModalProps {
  brandKeyOrName: string | null;
  onClose: () => void;
  onStartEnquiry?: () => void;
}

export const BrandModal: React.FC<BrandModalProps> = ({
  brandKeyOrName,
  onClose,
  onStartEnquiry
}) => {
  if (!brandKeyOrName) return null;

  // Find matching brand in RESA_BRANDS
  const normalized = brandKeyOrName.toLowerCase();
  const brand =
    RESA_BRANDS[normalized] ||
    Object.values(RESA_BRANDS).find(b =>
      b.name.toLowerCase().includes(normalized) || normalized.includes(b.name.toLowerCase())
    ) ||
    RESA_BRANDS.keragraphy;

  return (
    <div
      id="brand-directory-modal-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="brand-directory-modal"
        className="bg-[#FDFBF7] border border-[#E8E1D3] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EFE8DC] bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#8C7355]/10 flex items-center justify-center text-[#8C7355]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C7355]">
                Official Resa Life Sci Brand
              </span>
              <h3 className="font-serif font-bold text-xl text-[#201E1D]">
                {brand.name}
              </h3>
            </div>
          </div>
          <button
            id="close-brand-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#88837A] hover:text-[#201E1D] hover:bg-[#F2ECE1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="bg-[#FAF6EE] p-3.5 rounded-xl border border-[#E9E2D4]">
            <p className="text-xs font-serif italic text-[#4A453F] leading-relaxed">
              "{brand.tagline}"
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#66625B] mb-2">
              Brand Profile & Formulation Focus
            </h4>
            <p className="text-sm text-[#4A453F] leading-relaxed">
              {brand.description}
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#66625B] mb-2">
              Key Formulation Benefits
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {brand.primaryBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#403B35]">
                  <div className="w-4 h-4 rounded-full bg-[#EAE2D2] flex items-center justify-center text-[#8C7355] shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#66625B] mb-2">
              Recommended For Stated Concerns
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {brand.recommendedFor.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 bg-white border border-[#DDD5C7] rounded-full text-[#403B35]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 bg-[#F5EFE3] rounded-xl text-[11px] text-[#7A746B] leading-relaxed border border-[#E5DEC] flex items-start gap-2">
            <Building className="w-4 h-4 shrink-0 text-[#8C7355] mt-0.5" />
            <span>
              Manufactured & developed by Resa Life Sci, Bawana, New Delhi. Dedicated private label and custom brand adaptations available upon enquiry.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EFE8DC] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#66625D] hover:text-[#201E1D] transition-colors cursor-pointer"
          >
            Close
          </button>
          {onStartEnquiry && (
            <button
              onClick={() => {
                onClose();
                onStartEnquiry();
              }}
              className="px-4 py-2 bg-[#201E1D] hover:bg-[#34312F] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Inquire About Manufacturing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
