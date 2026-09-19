import React, { useState } from 'react';
import { MessageSquare, X, Sparkles, ExternalLink, Globe, Code, Copy, Check, Lock, RefreshCw } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { RESA_COMPANY_INFO } from '../../data/brands';

interface WidgetPreviewContainerProps {
  onOpenAdmin: () => void;
  onExitWidgetMode: () => void;
}

export const WidgetPreviewContainer: React.FC<WidgetPreviewContainerProps> = ({
  onOpenAdmin,
  onExitWidgetMode
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<!-- ============================================================== -->
<!-- Resa AI Assistant Widget for resalifescience.in                 -->
<!-- Paste this code inside your WordPress / Elementor HTML widget  -->
<!-- or into Appearance > Theme File Editor > footer.php            -->
<!-- ============================================================== -->
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

  return (
    <div
      id="widget-embedding-simulator"
      className="relative min-h-screen w-full bg-[#EFEBE3] flex flex-col items-center justify-center p-3 sm:p-6"
    >
      {/* Background Mockup Frame indicating existing WordPress site on resalifescience.in */}
      <div className="w-full max-w-5xl bg-white border border-[#DDD5C7] rounded-3xl shadow-xl overflow-hidden flex flex-col relative">
        {/* Browser Chrome Bar */}
        <div className="bg-[#FAF7F2] border-b border-[#E8E1D3] px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#E57373] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFB74D] inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#81C784] inline-block" />
          </div>

          {/* Browser URL bar for resalifescience.in */}
          <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 bg-white border border-[#DDD5C7] rounded-full px-3.5 py-1 text-xs text-[#524C44] shadow-2xs">
            <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-mono text-[11px] sm:text-xs text-[#201E1D] font-medium truncate">
              https://resalifescience.in
            </span>
            <span className="text-[10px] text-[#9C9488] hidden sm:inline">/home</span>
            <a
              href="https://resalifescience.in"
              target="_blank"
              rel="noopener noreferrer"
              title="Open actual website in new tab"
              className="ml-auto p-0.5 text-[#8C7355] hover:text-[#201E1D] transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Top Controls */}
          <div className="flex items-center gap-2">
            <button
              id="get-embed-code-btn"
              onClick={() => setShowEmbedModal(true)}
              className="px-2.5 py-1 bg-[#FAF2E6] border border-[#DFCBB5] text-[#8C7355] text-xs font-semibold rounded-lg hover:bg-[#F4E9D8] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Elementor Embed Code</span>
            </button>
            <button
              id="exit-widget-preview-btn"
              onClick={onExitWidgetMode}
              className="px-2.5 py-1 bg-[#201E1D] text-white text-xs font-medium rounded-lg hover:bg-[#383431] transition-colors cursor-pointer"
            >
              Full App
            </button>
            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1 border border-[#DDD5C7] text-[#403B35] text-xs font-medium rounded-lg hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Website Content Mockup */}
        <div className="p-6 sm:p-12 flex flex-col items-center text-center relative">
          <div className="max-w-2xl my-8 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#8C7355] font-semibold bg-[#FAF5ED] px-3.5 py-1.5 rounded-full border border-[#EBE3D3]">
              <Globe className="w-3.5 h-3.5 text-[#8C7355]" />
              <span>Official Website: resalifescience.in</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#201E1D] tracking-tight">
              Bespoke Cosmetics & Private-Label Manufacturing
            </h2>
            <p className="text-sm sm:text-base text-[#6E6962] leading-relaxed max-w-xl mx-auto">
              Welcome to the live WordPress / Elementor integration preview for <strong>resalifescience.in</strong>. The Resa AI Assistant floats unobtrusively in the bottom-right corner, ready to guide beauty buyers and capture B2B contract manufacturing leads.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
              <a
                href="https://resalifescience.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8C7355] hover:bg-[#786146] text-white font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <span>Visit resalifescience.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowEmbedModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#DDD5C7] hover:bg-[#FAF7F2] text-[#403B35] font-medium rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Code className="w-3.5 h-3.5 text-[#8C7355]" />
                <span>Get WordPress Embed Code</span>
              </button>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-8 border-t border-[#F0ECE4]">
            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#ECE5D8]">
              <span className="text-xs font-semibold text-[#8C7355]">01. Haircare Brands</span>
              <div className="text-sm font-serif font-bold text-[#201E1D] mt-1">Keragraphy & Calveo</div>
              <p className="text-xs text-[#7A746B] mt-1">Specialized restoration, moisture infusion & salon-grade gloss.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#ECE5D8]">
              <span className="text-xs font-semibold text-[#8C7355]">02. Skincare Brands</span>
              <div className="text-sm font-serif font-bold text-[#201E1D] mt-1">PH Professional</div>
              <p className="text-xs text-[#7A746B] mt-1">Targeted facial-care formulations for refreshed radiance.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F4] border border-[#ECE5D8]">
              <span className="text-xs font-semibold text-[#8C7355]">03. Contract Facility</span>
              <div className="text-sm font-serif font-bold text-[#201E1D] mt-1">Bawana, New Delhi</div>
              <p className="text-xs text-[#7A746B] mt-1">Formulation development, packaging sourcing & contract filling.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Widget Launcher (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Floating Chat Modal */}
        {isOpen && (
          <div
            id="floating-chat-window"
            className="mb-3 w-[92vw] sm:w-[420px] h-[640px] max-h-[82vh] bg-white border border-[#DDD5C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
          >
            <div className="bg-[#201E1D] text-white px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs font-semibold tracking-wide">Resa AI Assistant &bull; resalifescience.in</span>
              </div>
              <button
                id="close-floating-widget-btn"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-[#CFC9C0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatInterface
                onOpenAdmin={onOpenAdmin}
                isWidgetMode={true}
                onToggleWidgetMode={onExitWidgetMode}
              />
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          id="floating-ask-resa-ai-btn"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 px-5 bg-[#201E1D] hover:bg-[#34312F] text-white rounded-full shadow-xl flex items-center gap-3 transition-transform active:scale-95 cursor-pointer border border-[#8C7355]/40"
        >
          <div className="w-8 h-8 rounded-full bg-[#8C7355] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left pr-1">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#D4AF37]">
              Ask Resa AI
            </div>
            <div className="text-xs font-bold text-white leading-none">
              Beauty & Manufacturing
            </div>
          </div>
        </button>
      </div>

      {/* Embed Code Modal for resalifescience.in */}
      {showEmbedModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDD5C7] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D8] mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#8C7355]" />
                <h3 className="font-serif font-bold text-[#201E1D]">
                  WordPress & Elementor Embed Snippet
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
              To install Resa AI Assistant onto <strong>resalifescience.in</strong>, paste this code snippet into your WordPress website:
            </p>

            <ol className="text-xs text-[#5A544C] list-decimal list-inside space-y-1 mb-3 bg-[#FAF8F4] p-3 rounded-xl border border-[#ECE4D6]">
              <li>In WordPress, open Elementor Editor or your Theme Customizer.</li>
              <li>Add an <strong>HTML Widget</strong> in your global footer (or use WPCode plugin).</li>
              <li>Paste the code snippet below and click <strong>Publish</strong>.</li>
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
              <span className="text-[11px] text-[#8C7355]">
                Optimized for resalifescience.in &bull; Responsive on Mobile & Desktop
              </span>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-1.5 bg-[#201E1D] text-white text-xs font-medium rounded-xl hover:bg-[#383431] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
