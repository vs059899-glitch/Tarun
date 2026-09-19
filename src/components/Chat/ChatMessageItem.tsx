import React from 'react';
import { Sparkles, User, CheckCircle2 } from 'lucide-react';
import { ChatMessage } from '../../types';
import { RecommendationCard } from './RecommendationCard';
import { InChatEnquiryForm } from './InChatEnquiryForm';
import { LeadCaptureCard } from '../LeadCapture/LeadCaptureCard';

interface ChatMessageItemProps {
  message: ChatMessage;
  sessionId: string;
  onQuickAction: (action: string) => void;
  onExploreBrand: (brandName: string) => void;
  onLeadSubmitted: (leadData: any) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  sessionId,
  onQuickAction,
  onExploreBrand,
  onLeadSubmitted
}) => {
  const isUser = message.sender === 'user';

  return (
    <div
      id={`message-item-${message.id}`}
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4 transition-all duration-150`}
    >
      <div className={`flex items-start gap-2.5 max-w-[88%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs mt-0.5 ${
            isUser
              ? 'bg-[#2D2A28] text-white'
              : 'bg-gradient-to-br from-[#EAE0D0] to-[#C5A880] text-[#222120] shadow-xs'
          }`}
        >
          {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
        </div>

        {/* Bubble */}
        <div className="flex flex-col">
          <div
            className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
              isUser
                ? 'bg-[#222120] text-[#FBF9F5] rounded-tr-xs'
                : 'bg-white text-[#222120] border border-[#EBE6DC] rounded-tl-xs'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.text}</div>

            {/* Recommendation card inside assistant message */}
            {message.recommendation && (
              <RecommendationCard
                data={message.recommendation}
                onExplore={onExploreBrand}
                onFollowUp={onQuickAction}
              />
            )}

            {/* Business Enquiry Form inside chat */}
            {message.showEnquiryForm && (
              <InChatEnquiryForm
                sessionId={sessionId}
                onSubmitted={onLeadSubmitted}
              />
            )}

            {/* Professional Lead Capture Card inside chat (Requirements 1-3) */}
            {message.showLeadCapture && (
              <LeadCaptureCard
                sessionId={sessionId}
                source={message.leadCaptureData?.source || 'Chatbot Consultation'}
                uploadedFileName={message.leadCaptureData?.uploadedFileName}
                title={message.leadCaptureData?.title}
                description={message.leadCaptureData?.description}
                onSubmitted={onLeadSubmitted}
              />
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-[10px] text-[#9C968F] mt-1 px-1 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp}
          </span>
        </div>
      </div>

      {/* Quick Actions / Suggested Buttons */}
      {message.quickActions && message.quickActions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2 pl-9 pr-2">
          {message.quickActions.map((action, idx) => (
            <button
              key={idx}
              id={`quick-action-btn-${idx}`}
              onClick={() => onQuickAction(action.action || action.label)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DDD5C7] text-[#403B35] hover:text-[#201E1D] text-xs font-medium rounded-full transition-all duration-150 shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
            >
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
