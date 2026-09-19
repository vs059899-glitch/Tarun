import React from 'react';
import {
  MessageSquare,
  Users,
  Building2,
  Sparkles,
  ClipboardList,
  CheckCircle,
  PhoneCall,
  Percent
} from 'lucide-react';

interface KpiCardsProps {
  data: {
    totalConversations: number;
    consumerSessions: number;
    businessSessions: number;
    recommendationsShown: number;
    recommendationsClicked: number;
    enquiriesStarted: number;
    enquiriesSubmitted: number;
    totalContactActions: number;
    recommendationConversionRate: number;
    enquiryConversionRate: number;
    contactConversionRate: number;
  };
}

export const KpiCards: React.FC<KpiCardsProps> = ({ data }) => {
  const cards = [
    {
      id: 'kpi-total-conversations',
      label: 'Total Conversations',
      value: data.totalConversations,
      sublabel: 'Active & completed sessions',
      icon: MessageSquare,
      color: '#201E1D',
      bg: '#F5F2EC'
    },
    {
      id: 'kpi-consumer-sessions',
      label: 'Consumer Sessions',
      value: data.consumerSessions,
      sublabel: 'Product discovery inquiries',
      icon: Users,
      color: '#8C7355',
      bg: '#F8F4EE'
    },
    {
      id: 'kpi-business-sessions',
      label: 'Business Sessions',
      value: data.businessSessions,
      sublabel: 'Private-label & manufacturing',
      icon: Building2,
      color: '#4A6B5D',
      bg: '#EDF3F0'
    },
    {
      id: 'kpi-recommendations',
      label: 'Recommendations',
      value: data.recommendationsShown,
      sublabel: `${data.recommendationsClicked} CTA clicks recorded`,
      icon: Sparkles,
      color: '#B38E5D',
      bg: '#FAF6EE'
    },
    {
      id: 'kpi-enquiries-started',
      label: 'Enquiries Started',
      value: data.enquiriesStarted,
      sublabel: 'B2B lead forms initiated',
      icon: ClipboardList,
      color: '#70655B',
      bg: '#F5F1EC'
    },
    {
      id: 'kpi-enquiries-submitted',
      label: 'Enquiries Submitted',
      value: data.enquiriesSubmitted,
      sublabel: `${data.enquiryConversionRate}% completion rate`,
      icon: CheckCircle,
      color: '#2D6A4F',
      bg: '#EBF4F0'
    },
    {
      id: 'kpi-contact-actions',
      label: 'Contact Actions',
      value: data.totalContactActions,
      sublabel: 'WhatsApp, Call, or Email',
      icon: PhoneCall,
      color: '#1B4965',
      bg: '#EEF4F8'
    },
    {
      id: 'kpi-recommendation-rate',
      label: 'Recommendation Conversion',
      value: `${data.recommendationConversionRate}%`,
      sublabel: 'Clicks ÷ Views × 100',
      icon: Percent,
      color: '#8C7355',
      bg: '#F8F4EE'
    }
  ];

  return (
    <div id="kpi-cards-grid" className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(card => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="bg-white border border-[#ECE5D8] rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#706B64] line-clamp-1">
                {card.label}
              </span>
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                <IconComponent className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-serif font-bold text-[#201E1D] tracking-tight">
              {card.value}
            </div>

            <p className="text-[11px] text-[#8C867D] mt-1 line-clamp-1">
              {card.sublabel}
            </p>
          </div>
        );
      })}
    </div>
  );
};
