export type UserMode = 'consumer' | 'business' | 'general';

export type EventType =
  | 'CHAT_STARTED'
  | 'CHAT_COMPLETED'
  | 'CONSUMER_MODE_SELECTED'
  | 'BUSINESS_MODE_SELECTED'
  | 'HAIRCARE_SELECTED'
  | 'SKINCARE_SELECTED'
  | 'FACIAL_CARE_SELECTED'
  | 'ROUGH_HAIR_SELECTED'
  | 'DRY_HAIR_SELECTED'
  | 'DULL_HAIR_SELECTED'
  | 'FRIZZ_SELECTED'
  | 'SMOOTHNESS_SHINE_SELECTED'
  | 'DULL_LOOKING_SKIN_SELECTED'
  | 'FRESH_GLOWING_SELECTED'
  | 'GENERAL_SKINCARE_SELECTED'
  | 'RECOMMENDATION_SHOWN'
  | 'RECOMMENDATION_CLICKED'
  | 'ENQUIRY_STARTED'
  | 'ENQUIRY_SUBMITTED'
  | 'WHATSAPP_CLICKED'
  | 'CALL_CLICKED'
  | 'CONTACT_CLICKED'
  | 'BRAND_EXPLORE_CLICKED';

export interface AnalyticsEvent {
  id: string;
  sessionId: string;
  eventType: EventType;
  category?: 'Haircare' | 'Skincare' | 'Facial Care' | 'Business' | 'General';
  concern?: string;
  brandRecommended?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  isDemo?: boolean;
}

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Closed';

export interface BusinessLead {
  // Primary standardized fields (Requirement 5)
  lead_id: string;
  full_name: string;
  email: string;
  company_name: string;
  phone: string;
  created_at: string;
  last_activity: string;
  source: string;
  session_id: string;
  uploaded_file_status: string;

  // Compatibility aliases
  id: string;
  fullName: string;
  companyName: string;
  createdAt: string;
  lastActivity?: string;
  sessionId?: string;

  // Business & Manufacturing extensions
  productCategory?: string;
  requirement?: string;
  estimatedQuantity?: string;
  status: LeadStatus;
  isDemo?: boolean;
}

export interface LeadCapturePayload {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  source?: string;
  sessionId?: string;
  uploadedFileStatus?: string;
  fileName?: string;
  productCategory?: string;
  requirement?: string;
  estimatedQuantity?: string;
}

export interface LeadNotificationRecord {
  id: string;
  leadId: string;
  recipient: string;
  subject: string;
  sentAt: string;
  status: 'delivered' | 'logged' | 'failed';
  error?: string;
  content: {
    fullName: string;
    email: string;
    companyName: string;
    phone: string;
    dateTime: string;
    source: string;
    uploadedFileStatus: string;
  };
}

export interface ChatSession {
  id: string;
  startTime: string;
  endTime?: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet';
  userMode: UserMode;
  messageCount: number;
  durationSeconds: number;
  status: 'active' | 'completed' | 'abandoned';
  primaryConcern?: string;
  recommendationGiven?: string;
  enquiryStarted: boolean;
  enquirySubmitted: boolean;
  contactActionTaken?: 'WhatsApp' | 'Call' | 'Contact Us';
  isDemo?: boolean;
  leadId?: string;
  leadEmail?: string;
  leadName?: string;
}

export interface RecommendationCardData {
  id: string;
  brandName: string;
  productCategory: string;
  headline: string;
  recommendationWording: string;
  ctaText: string;
  concernKey: string;
  brandTagline: string;
  keyBenefits: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string; icon?: string }[];
  recommendation?: RecommendationCardData;
  showEnquiryForm?: boolean;
  showLeadCapture?: boolean;
  leadCaptureData?: {
    source?: string;
    uploadedFileName?: string;
    title?: string;
    description?: string;
  };
}

export interface BrandInfo {
  id: string;
  name: string;
  category: 'Haircare' | 'Skincare' | 'Facial Care' | 'Body Care';
  tagline: string;
  description: string;
  primaryBenefits: string[];
  recommendedFor: string[];
  accentColor: string;
}

export type DateFilterOption = 'today' | '7days' | '30days' | 'all' | 'custom';
