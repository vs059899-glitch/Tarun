import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  RotateCcw,
  Sparkles,
  Building2,
  Phone,
  Layers,
  HelpCircle,
  Minimize2,
  Maximize2,
  Globe,
  ExternalLink,
  Paperclip,
  FileText,
  X,
  MailCheck,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, ChatSession, EventType, RecommendationCardData } from '../../types';
import { ChatMessageItem } from './ChatMessageItem';
import { BrandModal } from './BrandModal';
import { ContactModal } from './ContactModal';
import { LeadCaptureModal } from '../LeadCapture/LeadCaptureModal';
import { evaluateRecommendation } from '../../data/rules';
import { RESA_COMPANY_INFO } from '../../data/brands';
import { apiClient } from '../../services/api';

interface ChatInterfaceProps {
  onOpenAdmin: () => void;
  isWidgetMode?: boolean;
  onToggleWidgetMode?: () => void;
}

const INITIAL_GREETING_TEXT = `Hello 👋 Welcome to Resa Life Sci.

I’m your AI beauty & cosmetics assistant. How can I help you today?`;

const INITIAL_QUICK_ACTIONS = [
  { label: '🧴 Find My Beauty Product', action: 'find_beauty' },
  { label: '🏭 Manufacturing & Private Label', action: 'manufacturing' },
  { label: '✨ Explore Resa Brands', action: 'explore_brands' },
  { label: '💬 Ask Resa AI', action: 'ask_resa' },
  { label: '📞 Contact Resa', action: 'contact_resa' }
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onOpenAdmin,
  isWidgetMode = false,
  onToggleWidgetMode
}) => {
  const [sessionId, setSessionId] = useState<string>(() => `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userMode, setUserMode] = useState<'consumer' | 'business' | 'general'>('general');

  // Consultation workflow state
  const [consultationState, setConsultationState] = useState<{
    inProgress: boolean;
    category?: 'Haircare' | 'Skincare' | 'Facial Care';
    concern?: string;
    step: number;
  }>({
    inProgress: false,
    step: 0
  });

  // Modals
  const [activeBrandModal, setActiveBrandModal] = useState<string | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadModalSource, setLeadModalSource] = useState('Chatbot Consultation');
  const [leadModalTitle, setLeadModalTitle] = useState('Connect with Resa Formulation Desk');

  // File upload state (Requirement 12)
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [lastUploadedFileName, setLastUploadedFileName] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Session duration timer
  const sessionStartTimeRef = useRef<number>(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize Session and First Greeting
  useEffect(() => {
    const initSession = async () => {
      const device: 'Desktop' | 'Mobile' | 'Tablet' =
        window.innerWidth < 640 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop';

      await apiClient.createSession(sessionId, device, 'general');
      await apiClient.logEvent({
        sessionId,
        eventType: 'CHAT_STARTED',
        category: 'General'
      });

      const initialMessage: ChatMessage = {
        id: 'msg_welcome',
        sender: 'assistant',
        text: INITIAL_GREETING_TEXT,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: INITIAL_QUICK_ACTIONS
      };

      setMessages([initialMessage]);
    };

    initSession();

    // Heartbeat duration update on unload
    const handleBeforeUnload = () => {
      const durationSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
      apiClient.updateSession(sessionId, {
        durationSeconds,
        status: 'completed'
      });
      apiClient.logEvent({
        sessionId,
        eventType: 'CHAT_COMPLETED',
        category: 'General'
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      const durationSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
      apiClient.updateSession(sessionId, { durationSeconds });
    };
  }, [sessionId]);

  // Restart conversation cleanly
  const handleResetConversation = async () => {
    const durationSeconds = Math.round((Date.now() - sessionStartTimeRef.current) / 1000);
    await apiClient.updateSession(sessionId, {
      durationSeconds,
      status: 'completed'
    });
    await apiClient.logEvent({
      sessionId,
      eventType: 'CHAT_COMPLETED',
      category: 'General'
    });

    const newId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    sessionStartTimeRef.current = Date.now();
    setSessionId(newId);
    setUserMode('general');
    setConsultationState({ inProgress: false, step: 0 });

    const device: 'Desktop' | 'Mobile' | 'Tablet' =
      window.innerWidth < 640 ? 'Mobile' : window.innerWidth < 1024 ? 'Tablet' : 'Desktop';

    await apiClient.createSession(newId, device, 'general');
    await apiClient.logEvent({
      sessionId: newId,
      eventType: 'CHAT_STARTED',
      category: 'General'
    });

    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'assistant',
        text: INITIAL_GREETING_TEXT,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: INITIAL_QUICK_ACTIONS
      }
    ]);
  };

  // Helper to add message
  const addAssistantMessage = (
    text: string,
    options?: Partial<Omit<ChatMessage, 'id' | 'sender' | 'text' | 'timestamp'>>
  ) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'assistant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...options
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const addUserMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
  };

  // Handle Quick Actions
  const handleQuickAction = async (action: string) => {
    // 1. Initial actions
    if (action === 'find_beauty') {
      addUserMessage('🧴 Find My Beauty Product');
      setUserMode('consumer');
      setConsultationState({ inProgress: true, step: 1 });

      await apiClient.logEvent({
        sessionId,
        eventType: 'CONSUMER_MODE_SELECTED',
        category: 'General'
      });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage('What are you looking for?', {
          quickActions: [
            { label: 'Haircare', action: 'cat_haircare' },
            { label: 'Skincare', action: 'cat_skincare' },
            { label: 'Facial Care', action: 'cat_facial' }
          ]
        });
      }, 400);
      return;
    }

    if (action === 'manufacturing') {
      addUserMessage('🏭 Manufacturing & Private Label');
      setUserMode('business');

      await apiClient.logEvent({
        sessionId,
        eventType: 'BUSINESS_MODE_SELECTED',
        category: 'Business'
      });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage(
          `Resa Life Sci operates a full-scale cosmetics manufacturing and private-label / contract manufacturing facility in Bawana, New Delhi, India.\n\nWe provide end-to-end product development, formulation, filling, and packaging for cosmetics, haircare, skincare, and personal-care brands.`,
          {
            quickActions: [
              { label: 'Start Business Enquiry', action: 'start_enquiry' },
              { label: 'Chat on WhatsApp', action: 'whatsapp' },
              { label: 'Contact Resa via Phone', action: 'phone' }
            ]
          }
        );
      }, 400);
      return;
    }

    if (action === 'ask_resa') {
      addUserMessage('💬 Ask Resa AI');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage(
          `You can ask me any question! For example:\n• "My hair is rough and dry"\n• "I want smooth and shiny hair"\n• "My face looks dull and tired"\n• "I want to start my own shampoo brand"\n• "What does Resa Life Sci manufacture?"`
        );
      }, 350);
      return;
    }

    if (action === 'explore_brands') {
      addUserMessage('✨ Explore Resa Brands');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage(
          `Here are the official brands under Resa Life Sci:\n\n• **Keragraphy**: Deep restoration & nourishment for rough, depleted hair.\n• **Calveo Professional**: Salon-grade smoothness, mirror-like shine & frizz control.\n• **PH Professional**: Precision facial care for revitalizing dull-looking skin.\n• **The Body Graph**: Holistic botanical personal care & wellness rituals.\n\nSelect a brand to view full profile:`,
          {
            quickActions: [
              { label: 'Explore Keragraphy', action: 'brand_keragraphy' },
              { label: 'Explore Calveo', action: 'brand_calveo' },
              { label: 'Explore PH Professional', action: 'brand_ph' },
              { label: 'Explore The Body Graph', action: 'brand_body' }
            ]
          }
        );
      }, 400);
      return;
    }

    if (action === 'contact_resa') {
      addUserMessage('📞 Contact Resa');
      setShowContactModal(true);
      return;
    }

    // 2. Category selection in Beauty Consultation
    if (action === 'cat_haircare') {
      addUserMessage('Haircare');
      setConsultationState(prev => ({ ...prev, category: 'Haircare', step: 2 }));

      await apiClient.logEvent({
        sessionId,
        eventType: 'HAIRCARE_SELECTED',
        category: 'Haircare'
      });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage('What is your main hair concern?', {
          quickActions: [
            { label: 'Rough Hair', action: 'concern_rough' },
            { label: 'Dry-Looking Hair', action: 'concern_dry' },
            { label: 'Dull-Looking Hair', action: 'concern_dull' },
            { label: 'Frizz / Manageability', action: 'concern_frizz' },
            { label: 'Smoothness & Shine', action: 'concern_smoothness_shine' },
            { label: 'Not Sure', action: 'concern_not_sure' }
          ]
        });
      }, 400);
      return;
    }

    if (action === 'cat_skincare' || action === 'cat_facial') {
      const isFacial = action === 'cat_facial';
      addUserMessage(isFacial ? 'Facial Care' : 'Skincare');
      setConsultationState(prev => ({
        ...prev,
        category: isFacial ? 'Facial Care' : 'Skincare',
        step: 2
      }));

      await apiClient.logEvent({
        sessionId,
        eventType: isFacial ? 'FACIAL_CARE_SELECTED' : 'SKINCARE_SELECTED',
        category: isFacial ? 'Facial Care' : 'Skincare'
      });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage('What are you mainly looking for?', {
          quickActions: [
            { label: 'Dull-Looking Skin', action: 'skin_dull' },
            { label: 'Facial Care', action: 'skin_facial' },
            { label: 'Fresh / Glowing Appearance', action: 'skin_glow' },
            { label: 'General Skincare', action: 'skin_general' },
            { label: 'Not Sure', action: 'skin_not_sure' }
          ]
        });
      }, 400);
      return;
    }

    // 3. Haircare Concern selection
    if (action === 'concern_rough') {
      addUserMessage('Rough Hair');
      handleHaircareEvaluation('Rough Hair', 'ROUGH_HAIR_SELECTED');
      return;
    }

    if (action === 'concern_dry') {
      addUserMessage('Dry-Looking Hair');
      handleHaircareEvaluation('Dry-Looking Hair', 'DRY_HAIR_SELECTED');
      return;
    }

    if (action === 'concern_smoothness_shine') {
      addUserMessage('Smoothness & Shine');
      handleHaircareEvaluation('Smoothness & Shine', 'SMOOTHNESS_SHINE_SELECTED');
      return;
    }

    if (action === 'concern_dull') {
      addUserMessage('Dull-Looking Hair');
      askHaircareFollowUp('Dull-Looking Hair', 'DULL_HAIR_SELECTED');
      return;
    }

    if (action === 'concern_frizz') {
      addUserMessage('Frizz / Manageability');
      askHaircareFollowUp('Frizz / Manageability', 'FRIZZ_SELECTED');
      return;
    }

    if (action === 'concern_not_sure') {
      addUserMessage('Not Sure');
      askHaircareFollowUp('General Care', 'HAIRCARE_SELECTED');
      return;
    }

    // Haircare Follow-up options
    if (action.startsWith('pref_')) {
      const prefName = action.replace('pref_', '');
      const formattedPref =
        prefName === 'smooth'
          ? 'Smoothness'
          : prefName === 'shine'
          ? 'Shine'
          : prefName === 'manage'
          ? 'Manageability'
          : 'General Haircare';

      addUserMessage(formattedPref);
      handleHaircareEvaluation(formattedPref, 'SMOOTHNESS_SHINE_SELECTED', formattedPref);
      return;
    }

    // 4. Skincare Concern selection
    if (action === 'skin_dull' || action === 'skin_facial' || action === 'skin_glow') {
      const label =
        action === 'skin_dull'
          ? 'Dull-Looking Skin'
          : action === 'skin_facial'
          ? 'Facial Care'
          : 'Fresh / Glowing Appearance';

      addUserMessage(label);
      handleSkincareEvaluation(label);
      return;
    }

    if (action === 'skin_general' || action === 'skin_not_sure') {
      addUserMessage(action === 'skin_general' ? 'General Skincare' : 'Not Sure');
      handleSkincareEvaluation('General Skincare');
      return;
    }

    // 5. Business Actions
    if (action === 'start_enquiry') {
      addUserMessage('Start Business Enquiry');
      await apiClient.logEvent({
        sessionId,
        eventType: 'ENQUIRY_STARTED',
        category: 'Business'
      });

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage(
          'Please share your business details below. Our manufacturing desk in Bawana, New Delhi will review your requirements.',
          { showEnquiryForm: true }
        );
      }, 350);
      return;
    }

    if (action === 'whatsapp') {
      setShowContactModal(true);
      return;
    }

    if (action === 'phone') {
      setShowContactModal(true);
      return;
    }

    // 6. Brand Modal openers
    if (action === 'brand_keragraphy') {
      setActiveBrandModal('keragraphy');
      return;
    }
    if (action === 'brand_calveo') {
      setActiveBrandModal('calveo');
      return;
    }
    if (action === 'brand_ph') {
      setActiveBrandModal('ph_professional');
      return;
    }
    if (action === 'brand_body') {
      setActiveBrandModal('body_graph');
      return;
    }

    if (action === 'visit_website') {
      addUserMessage('Open resalifescience.in');
      try {
        window.open('https://resalifescience.in', '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Could not open popup:', e);
      }
      addAssistantMessage(
        'Opening the official portal at **resalifescience.in** in a new tab. You can explore our cosmetic formulations, private-label manufacturing desk, and official brand catalogs directly.'
      );
      return;
    }

    if (action === 'save_consultation') {
      addUserMessage('📬 Save Consultation Dossier');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage(
          `I can email your personalized consultation summary, product specifications, and Resa Life Sci formulation insights directly to you.\n\nPlease enter your contact details below:`,
          {
            showLeadCapture: true,
            leadCaptureData: {
              source: 'Beauty Consultation Follow-up',
              uploadedFileName: lastUploadedFileName || undefined,
              title: 'Save Consultation & Receive Dossier',
              description: 'Enter your email to receive this consultation summary, formulation insights, and sample requests from Resa Life Sci.'
            },
            quickActions: [
              { label: 'Chat on WhatsApp', action: 'whatsapp' },
              { label: 'Ask Another Question', action: 'Ask Another Question' }
            ]
          }
        );
      }, 350);
      return;
    }

    if (action === 'request_dossier') {
      addUserMessage('📄 Request Formulation Catalog');
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addAssistantMessage(
          `Please provide your details below to receive the complete Resa Life Sci manufacturing portfolio, formulation library, and private-label catalog:`,
          {
            showLeadCapture: true,
            leadCaptureData: {
              source: 'Manufacturing Dossier Request',
              uploadedFileName: lastUploadedFileName || undefined,
              title: 'Request Manufacturing Catalog',
              description: 'We will email you our factory capabilities, minimum order quantities (MOQ), and formulation brochures.'
            },
            quickActions: [
              { label: 'Chat on WhatsApp', action: 'whatsapp' },
              { label: 'Contact Resa via Phone', action: 'phone' }
            ]
          }
        );
      }, 350);
      return;
    }

    if (action === 'Ask Another Question') {
      addUserMessage('Ask Another Question');
      addAssistantMessage('Of course! Feel free to ask about haircare, skincare, or contract manufacturing.');
      return;
    }

    if (action === 'Start Again') {
      handleResetConversation();
      return;
    }

    // Fallback: send text as query
    handleSendMessage(action);
  };

  // Helper for Haircare Follow-up question
  const askHaircareFollowUp = (concern: string, eventType: EventType) => {
    setConsultationState(prev => ({ ...prev, concern, step: 3 }));
    apiClient.logEvent({
      sessionId,
      eventType,
      category: 'Haircare',
      concern
    });

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addAssistantMessage('What is more important to you?', {
        quickActions: [
          { label: 'Smoothness', action: 'pref_smooth' },
          { label: 'Shine', action: 'pref_shine' },
          { label: 'Manageability', action: 'pref_manage' },
          { label: 'General Haircare', action: 'pref_general' }
        ]
      });
    }, 350);
  };

  // Helper for Haircare Evaluation
  const handleHaircareEvaluation = async (concern: string, eventType: EventType, preference?: string) => {
    setIsTyping(true);

    await apiClient.logEvent({
      sessionId,
      eventType,
      category: 'Haircare',
      concern
    });

    setTimeout(async () => {
      setIsTyping(false);
      const rec = evaluateRecommendation('Haircare', concern, preference);

      if (rec) {
        await apiClient.logEvent({
          sessionId,
          eventType: 'RECOMMENDATION_SHOWN',
          category: 'Haircare',
          concern,
          brandRecommended: rec.brandName
        });

        addAssistantMessage(rec.recommendationWording, {
          recommendation: rec,
          quickActions: [
            { label: `Explore ${rec.brandName}`, action: `brand_${rec.brandName.toLowerCase().split(' ')[0]}` },
            { label: '📬 Save Routine Dossier', action: 'save_consultation' },
            { label: 'Ask Another Question', action: 'Ask Another Question' },
            { label: 'Start Again', action: 'Start Again' }
          ]
        });
      } else {
        addAssistantMessage(
          'Based on your hair profile, our haircare formulations focus on replenishing moisture and restoring natural texture. Would you like to explore Keragraphy or Calveo Professional?',
          {
            quickActions: [
              { label: 'Explore Keragraphy', action: 'brand_keragraphy' },
              { label: 'Explore Calveo', action: 'brand_calveo' }
            ]
          }
        );
      }
    }, 450);
  };

  // Helper for Skincare Evaluation
  const handleSkincareEvaluation = async (concern: string) => {
    setIsTyping(true);

    await apiClient.logEvent({
      sessionId,
      eventType:
        concern === 'Dull-Looking Skin'
          ? 'DULL_LOOKING_SKIN_SELECTED'
          : concern === 'Fresh / Glowing Appearance'
          ? 'FRESH_GLOWING_SELECTED'
          : 'GENERAL_SKINCARE_SELECTED',
      category: 'Facial Care',
      concern
    });

    setTimeout(async () => {
      setIsTyping(false);
      const rec = evaluateRecommendation('Facial Care', concern);

      if (rec) {
        await apiClient.logEvent({
          sessionId,
          eventType: 'RECOMMENDATION_SHOWN',
          category: 'Facial Care',
          concern,
          brandRecommended: rec.brandName
        });

        addAssistantMessage(rec.recommendationWording, {
          recommendation: rec,
          quickActions: [
            { label: `Explore ${rec.brandName}`, action: 'brand_ph' },
            { label: '📬 Save Routine Dossier', action: 'save_consultation' },
            { label: 'Ask Another Question', action: 'Ask Another Question' },
            { label: 'Start Again', action: 'Start Again' }
          ]
        });
      } else {
        addAssistantMessage(
          'For holistic body nourishment and daily personal care, you can also explore our artisan personal-care line, The Body Graph.',
          {
            quickActions: [
              { label: 'Explore The Body Graph', action: 'brand_body' },
              { label: 'Explore PH Professional', action: 'brand_ph' }
            ]
          }
        );
      }
    }, 450);
  };

  // Handle Freeform Text Send & File Upload
  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    const currentFile = attachedFile;

    if (!textToSend && !currentFile) return;

    if (!customText) {
      setInputValue('');
    }

    if (currentFile) {
      setLastUploadedFileName(currentFile.name);
      setAttachedFile(null);
    }

    const displayText = currentFile
      ? (textToSend ? `${textToSend}\n[📎 Attached: ${currentFile.name}]` : `[📎 Attached Specification: ${currentFile.name}]`)
      : textToSend;

    addUserMessage(displayText);
    setIsTyping(true);

    if (currentFile) {
      await apiClient.logEvent({
        sessionId,
        eventType: 'SPECIFICATION_UPLOADED' as any,
        category: 'Business'
      });
    }

    try {
      if (currentFile && !textToSend) {
        // User attached a file directly
        setTimeout(() => {
          setIsTyping(false);
          addAssistantMessage(
            `Thank you! I have received and logged your specification document: **${currentFile.name}**.\n\nTo connect this brief directly with our cosmetic formulation & manufacturing team at Resa Life Sci (Bawana, New Delhi), please provide your contact details below:`,
            {
              showLeadCapture: true,
              leadCaptureData: {
                source: 'Specification File Upload',
                uploadedFileName: currentFile.name,
                title: 'Connect Document to Formulation Desk',
                description: 'Our R&D team will review your specification and reach out with feasibility, formulation estimates, and sample timelines.'
              },
              quickActions: [
                { label: 'Start Business Enquiry', action: 'start_enquiry' },
                { label: 'Chat on WhatsApp', action: 'whatsapp' }
              ]
            }
          );
        }, 450);
        return;
      }

      const history = messages.map(m => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        parts: [{ text: m.text }]
      }));

      const res = await apiClient.sendChatMessage({
        message: textToSend,
        history,
        sessionId,
        userMode
      });

      setIsTyping(false);

      if (res.detectedMode && res.detectedMode !== userMode) {
        setUserMode(res.detectedMode);
      }

      // If recommendation returned
      if (res.recommendation) {
        await apiClient.logEvent({
          sessionId,
          eventType: 'RECOMMENDATION_SHOWN',
          category: res.detectedCategory || 'Haircare',
          concern: res.detectedConcern,
          brandRecommended: res.recommendation.brandName
        });
      }

      // If file was attached, attach lead capture card to the response
      const leadCaptureConfig = currentFile ? {
        showLeadCapture: true,
        leadCaptureData: {
          source: 'Specification File Upload',
          uploadedFileName: currentFile.name,
          title: 'Connect Document to Formulation Desk'
        }
      } : undefined;

      addAssistantMessage(res.text, {
        recommendation: res.recommendation,
        quickActions: res.quickActions,
        showEnquiryForm: res.showEnquiryAction,
        ...leadCaptureConfig
      });
    } catch (err: any) {
      setIsTyping(false);
      addAssistantMessage(
        "I'm currently unable to reach the server. Please check your connection or contact our team directly.",
        {
          quickActions: [
            { label: '📞 Contact Resa Directly', action: 'contact_resa' },
            { label: 'Start Business Enquiry', action: 'start_enquiry' }
          ]
        }
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBrandExplore = async (brandName: string) => {
    await apiClient.logEvent({
      sessionId,
      eventType: 'RECOMMENDATION_CLICKED',
      brandRecommended: brandName
    });
    await apiClient.logEvent({
      sessionId,
      eventType: 'BRAND_EXPLORE_CLICKED',
      brandRecommended: brandName
    });
    setActiveBrandModal(brandName);
  };

  return (
    <div
      id="resa-ai-assistant-container"
      className="flex flex-col h-full w-full bg-[#FBF9F5] select-text relative"
    >
      {/* Top Header */}
      <header
        id="chatbot-header"
        className="shrink-0 bg-white/95 backdrop-blur-md border-b border-[#ECE6DB] px-4 py-3 sm:px-6 flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#222120] to-[#403C39] text-[#F3EEE6] flex items-center justify-center font-serif text-sm font-bold shadow-xs">
              R
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif font-bold text-sm sm:text-base text-[#201E1D] tracking-tight">
                Resa AI Assistant
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider font-semibold text-[#8C7355] bg-[#FAF5EC] border border-[#E9DFCF] px-2 py-0.5 rounded-full">
                {userMode === 'business'
                  ? 'B2B Manufacturing'
                  : userMode === 'consumer'
                  ? 'Beauty Consultation'
                  : 'Official Assistant'}
              </span>
            </div>
            <p className="text-[11px] text-[#7A746C] hidden xs:block">
              {RESA_COMPANY_INFO.tagline}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Official Website Link */}
          <a
            id="visit-official-site-btn"
            href="https://resalifescience.in"
            target="_blank"
            rel="noopener noreferrer"
            title="Visit official website: resalifescience.in"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#E2D9CB] text-xs font-medium text-[#59544E] hover:text-[#201E1D] hover:bg-[#F7F2E9] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#8C7355]" />
            <span className="hidden lg:inline font-sans text-xs">resalifescience.in</span>
            <ExternalLink className="w-3 h-3 text-[#A89F91]" />
          </a>

          {/* Embedding preview toggle */}
          {onToggleWidgetMode && (
            <button
              id="toggle-widget-mode-btn"
              onClick={onToggleWidgetMode}
              title={isWidgetMode ? 'Switch to Fullscreen Assistant' : 'Preview as Floating Widget'}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#E2D9CB] text-xs font-medium text-[#59544E] hover:text-[#201E1D] hover:bg-[#F7F2E9] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isWidgetMode ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Full App</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Widget Preview</span>
                </>
              )}
            </button>
          )}

          {/* Save Consultation / Request Dossier Button */}
          <button
            id="header-save-consultation-btn"
            onClick={() => {
              setLeadModalSource('Header Consultation Save');
              setLeadModalTitle('Save Consultation & Connect Desk');
              setShowLeadModal(true);
            }}
            title="Save your consultation and get a formulation dossier"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#E2D9CB] text-xs font-medium text-[#59544E] hover:text-[#201E1D] hover:bg-[#F7F2E9] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MailCheck className="w-3.5 h-3.5 text-[#8C7355]" />
            <span className="hidden sm:inline">Save Consultation</span>
          </button>

          {/* New conversation button */}
          <button
            id="reset-chat-btn"
            onClick={handleResetConversation}
            title="New Conversation"
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg border border-[#E2D9CB] text-xs font-medium text-[#59544E] hover:text-[#201E1D] hover:bg-[#F7F2E9] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>

          {/* Admin Analytics button */}
          <button
            id="open-admin-dashboard-btn"
            onClick={onOpenAdmin}
            className="p-1.5 sm:px-3 sm:py-1 rounded-lg bg-[#201E1D] hover:bg-[#34302D] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden xs:inline">Admin Analytics</span>
          </button>
        </div>
      </header>

      {/* Messages Scroll Area with Drag & Drop */}
      <main
        id="chatbot-messages-scroll-area"
        onDragOver={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingFile(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingFile(false);
        }}
        onDrop={e => {
          e.preventDefault();
          e.stopPropagation();
          setIsDraggingFile(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setAttachedFile(file);
            setLastUploadedFileName(file.name);
          }
        }}
        className={`flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 space-y-2 overscroll-contain transition-colors ${
          isDraggingFile ? 'bg-[#FAF3E8] border-2 border-dashed border-[#8C7355]' : ''
        }`}
      >
        <div className="max-w-3xl mx-auto w-full">
          {isDraggingFile && (
            <div className="p-4 mb-3 rounded-xl bg-white border border-[#8C7355] text-center text-xs text-[#8C7355] font-semibold flex items-center justify-center gap-2 animate-pulse">
              <FileText className="w-4 h-4" />
              <span>Drop cosmetic specification, formulation brief, or image here to upload</span>
            </div>
          )}

          {messages.map(message => (
            <ChatMessageItem
              key={message.id}
              message={message}
              sessionId={sessionId}
              onQuickAction={handleQuickAction}
              onExploreBrand={handleBrandExplore}
              onLeadSubmitted={() => {
                addAssistantMessage(
                  'Thanks! Your details have been saved. Our team at vs059899@gmail.com has been notified and will coordinate with you promptly.',
                  {
                    quickActions: [
                      { label: 'Chat on WhatsApp', action: 'whatsapp' },
                      { label: 'Direct Call', action: 'phone' },
                      { label: 'Start New Consultation', action: 'Start Again' }
                    ]
                  }
                );
              }}
            />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div id="typing-indicator" className="flex items-center gap-2 pl-2 mb-4 animate-in fade-in duration-200">
              <div className="w-7 h-7 rounded-full bg-[#EAE0D0] flex items-center justify-center text-[#222120] text-xs">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="bg-white border border-[#EBE6DC] rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-2xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E978D] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E978D] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#9E978D] animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Bar */}
      <footer
        id="chatbot-input-bar-container"
        className="shrink-0 bg-white/95 backdrop-blur-md border-t border-[#ECE6DB] p-3 sm:p-4 z-10"
      >
        <div className="max-w-3xl mx-auto w-full">
          {/* File Attachment Chip */}
          {attachedFile && (
            <div
              id="attached-file-chip"
              className="mb-2.5 flex items-center justify-between px-3 py-2 bg-[#FAF6F0] border border-[#E2D8C9] rounded-xl text-xs text-[#201E1D] shadow-2xs animate-fadeIn"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-[#8C7355] shrink-0" />
                <span className="font-semibold truncate">{attachedFile.name}</span>
                <span className="text-[11px] text-[#8C867D]">
                  ({(attachedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="p-1 text-[#8C867D] hover:text-red-600 rounded-md transition-colors cursor-pointer"
                title="Remove attached file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  setAttachedFile(file);
                  setLastUploadedFileName(file.name);
                }
              }}
            />

            {/* Paperclip Button for File Upload (Requirement 12) */}
            <button
              id="upload-specification-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach cosmetic specification, brief, or formula"
              className="h-11 px-3 text-[#706B63] hover:text-[#201E1D] bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#DDD7CD] rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <div className="relative flex-1">
              <input
                id="chatbot-text-input"
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  attachedFile
                    ? `Add a note with ${attachedFile.name} or click send...`
                    : 'Type your question... (e.g. My hair is rough, or I want to start a shampoo brand)'
                }
                className="w-full text-xs sm:text-sm pl-4 pr-10 py-3 bg-[#FAF8F5] border border-[#DDD7CD] rounded-xl focus:outline-none focus:border-[#8C7355] text-[#201E1D] placeholder:text-[#9C968F] shadow-2xs transition-all"
              />
            </div>

            <button
              id="chatbot-send-button"
              type="submit"
              disabled={(!inputValue.trim() && !attachedFile) || isTyping}
              className="h-11 px-4 bg-[#201E1D] hover:bg-[#34312F] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-[#8C867D] px-1">
            <span className="hidden xs:inline">
              Official Resa Life Sci AI Assistant • Bawana, New Delhi
            </span>
            <span className="xs:hidden">Resa Life Sci AI</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setLeadModalSource('Footer Contact');
                  setLeadModalTitle('Connect with Resa Formulation Desk');
                  setShowLeadModal(true);
                }}
                className="hover:text-[#201E1D] transition-colors underline cursor-pointer"
              >
                Contact Desk
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveBrandModal('keragraphy')}
                className="hover:text-[#201E1D] transition-colors underline cursor-pointer"
              >
                Brand Directory
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BrandModal
        brandKeyOrName={activeBrandModal}
        onClose={() => setActiveBrandModal(null)}
        onStartEnquiry={() => {
          setActiveBrandModal(null);
          handleQuickAction('start_enquiry');
        }}
      />

      {showContactModal && (
        <ContactModal
          sessionId={sessionId}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {/* Professional Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        sessionId={sessionId}
        source={leadModalSource}
        title={leadModalTitle}
        uploadedFileName={lastUploadedFileName}
        onSuccess={() => {
          addAssistantMessage('Thanks! Your details have been saved.', {
            quickActions: [
              { label: 'Chat on WhatsApp', action: 'whatsapp' },
              { label: 'Direct Call', action: 'phone' }
            ]
          });
        }}
      />
    </div>
  );
};
