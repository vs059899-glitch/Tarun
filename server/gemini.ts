import { GoogleGenAI } from '@google/genai';
import { RESA_COMPANY_INFO, RESA_BRANDS } from '../src/data/brands';
import { evaluateRecommendation } from '../src/data/rules';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

const SYSTEM_PROMPT = `You are "Resa AI Assistant", the official intelligent beauty & cosmetics assistant for Resa Life Sci.
Tagline: "Your intelligent beauty & cosmetics assistant".

VERIFIED KNOWLEDGE BASE:
- Company: ${RESA_COMPANY_INFO.name} (${RESA_COMPANY_INFO.officialName})
- Official Website: ${RESA_COMPANY_INFO.website} (${RESA_COMPANY_INFO.domain})
- Business Type: ${RESA_COMPANY_INFO.businessType}
- Location: ${RESA_COMPANY_INFO.location}
- Business Areas: Cosmetics manufacturing, Private-label manufacturing, Contract manufacturing, Product development & formulation, Haircare manufacturing, Skincare manufacturing, Personal-care & body-care manufacturing.
- Official Resa Brands ONLY:
  1. Keragraphy: Deep restoration & nourishment for rough, dry, depleted hair textures.
  2. Calveo Professional: Salon-grade smoothness, mirror-like shine, and frizz manageability.
  3. PH Professional: Targeted facial care for revitalizing dull-looking skin and promoting a refreshed glow.
  4. The Body Graph: Holistic botanical personal care & wellness rituals.
- Contact: Email ${RESA_COMPANY_INFO.email}, Phone ${RESA_COMPANY_INFO.phone}, Website ${RESA_COMPANY_INFO.website}

STRICT CONSTRAINTS & ACCURACY:
1. NEVER invent MOQ, pricing, production capacity, certifications, timelines, or unverified technical specs. If a user asks for exact MOQ or pricing, state:
   "I don't have enough verified information to answer that accurately. Please contact the Resa Life Sci team for confirmation."
2. NEVER diagnose skin or medical conditions, and NEVER claim a cosmetic product cures any disease or medical condition.
3. Use gentle, compliant phrasing: "may be suitable", "may be worth exploring", "based on your stated concern".
4. If a user asks about manufacturing their own brand, private-labeling, or contract manufacturing, explain Resa's manufacturing expertise warmly and invite them to submit an inquiry.
5. Keep answers concise, elegant, and professional. Avoid lengthy corporate essays.`;

export async function processChatMessage(params: {
  message: string;
  history: { role: 'user' | 'model'; parts: { text: string }[] }[];
  sessionId: string;
  userMode?: string;
}) {
  const { message, history, userMode } = params;
  const userText = message.trim().toLowerCase();

  // 1. Structured rule checks for beauty concerns first (adheres to Rule 5 & 6)
  // Check Rough Hair -> Keragraphy
  if (
    userText.includes('rough') ||
    (userText.includes('hair') && userText.includes('rough'))
  ) {
    const rec = evaluateRecommendation('Haircare', 'Rough Hair', 'Smoothness');
    return {
      text: 'Based on your stated concern about rough-looking hair, Keragraphy may be worth exploring for its intensive restoring and nourishing care.',
      recommendation: rec,
      detectedMode: 'consumer' as const,
      detectedCategory: 'Haircare' as const,
      detectedConcern: 'Rough Hair'
    };
  }

  // Check Smooth & Shine -> Calveo
  if (
    (userText.includes('smooth') && userText.includes('shin')) ||
    userText.includes('smooth and shiny') ||
    userText.includes('shiny hair') ||
    userText.includes('smoothness')
  ) {
    const rec = evaluateRecommendation('Haircare', 'Smoothness & Shine', 'Shine');
    return {
      text: "Since you're looking for smoother and shinier-looking hair, Calveo Professional may be worth exploring.",
      recommendation: rec,
      detectedMode: 'consumer' as const,
      detectedCategory: 'Haircare' as const,
      detectedConcern: 'Smoothness & Shine'
    };
  }

  // Check Dull hair / manageability -> Calveo
  if (
    (userText.includes('dull') && userText.includes('hair')) ||
    (userText.includes('frizz') && userText.includes('hair')) ||
    userText.includes('manageable')
  ) {
    const rec = evaluateRecommendation('Haircare', 'Dull Hair', 'Manageability');
    return {
      text: 'Based on your preference for enhanced manageability and revitalizing dull-looking hair, Calveo Professional may be worth exploring.',
      recommendation: rec,
      detectedMode: 'consumer' as const,
      detectedCategory: 'Haircare' as const,
      detectedConcern: 'Dull Hair'
    };
  }

  // Check Dull-Looking Skin + Facial Care -> PH Professional
  if (
    (userText.includes('dull') && (userText.includes('skin') || userText.includes('face'))) ||
    (userText.includes('facial') && (userText.includes('dull') || userText.includes('glow')))
  ) {
    const rec = evaluateRecommendation('Facial Care', 'Dull-Looking Skin', 'Facial Care');
    return {
      text: 'Based on your interest in facial care and dull-looking skin, PH Professional facial-care products may be worth exploring.',
      recommendation: rec,
      detectedMode: 'consumer' as const,
      detectedCategory: 'Facial Care' as const,
      detectedConcern: 'Dull-Looking Skin'
    };
  }

  // Check exact MOQ or pricing question
  if (
    userText.includes('moq') ||
    userText.includes('minimum order') ||
    userText.includes('exact price') ||
    userText.includes('how much does it cost')
  ) {
    return {
      text: "I don't have enough verified information to answer that accurately. Minimum order quantities and pricing depend on custom formulation, packaging specifications, and batch sizes. Please contact the Resa Life Sci team for confirmation or start a business enquiry below.",
      detectedMode: 'business' as const,
      showEnquiryAction: true
    };
  }

  // Check Business intent (start shampoo brand, private label, manufacturing)
  if (
    userText.includes('start my own') ||
    userText.includes('shampoo brand') ||
    userText.includes('private label') ||
    userText.includes('private-label') ||
    userText.includes('contract manufacturing') ||
    userText.includes('manufacture skincare') ||
    userText.includes('launch a cosmetic') ||
    userText.includes('launch my brand') ||
    userText.includes('start a brand')
  ) {
    return {
      text: 'Resa Life Sci specializes in state-of-the-art cosmetics manufacturing and private-label / contract manufacturing out of Bawana, New Delhi. We assist entrepreneurs and established brands across haircare, skincare, and personal-care product development. You can submit your requirements directly to our technical team.',
      detectedMode: 'business' as const,
      showEnquiryAction: true,
      quickActions: [
        { label: 'Start Business Enquiry', action: 'start_enquiry' },
        { label: 'Contact Resa via WhatsApp', action: 'whatsapp' }
      ]
    };
  }

  // Check company info ("What does Resa Life Sci do?", "Who are you?")
  if (
    userText.includes('what does resa life sci do') ||
    userText.includes('what do you do') ||
    userText.includes('about resa') ||
    userText.includes('what does resa do')
  ) {
    return {
      text: 'Resa Life Sci (Resa Lifescience) is a premier cosmetics manufacturing and private-label / contract manufacturing company based in Bawana, New Delhi, India. We specialize in product development, formulation, and manufacturing across haircare, skincare, and personal-care categories, alongside our portfolio of specialized brands.',
      detectedMode: 'general' as const,
      quickActions: [
        { label: '🧴 Find My Beauty Product', action: 'find_beauty' },
        { label: '🏭 Manufacturing & Private Label', action: 'manufacturing' },
        { label: '✨ Explore Resa Brands', action: 'explore_brands' },
        { label: '🌐 Official Website', action: 'visit_website' }
      ]
    };
  }

  // Check resalifescience.in domain and website questions
  if (
    userText.includes('resalifescience.in') ||
    userText.includes('resalifescience') ||
    userText === 'website' ||
    userText.includes('official website') ||
    userText.includes('what is the website') ||
    userText.includes('website link')
  ) {
    return {
      text: '🌐 **resalifescience.in** is the official web portal of **Resa Life Sci (Resa Lifescience)** — specialists in cosmetics manufacturing, private-label formulation, contract filling, and beauty brand stewardship based in Bawana, New Delhi, India.\n\nOn the portal, you can discover our specialized brands (**Keragraphy**, **Calveo Professional**, **PH Professional**, **The Body Graph**), review private-label manufacturing capabilities, or request tailored batch quotes.',
      detectedMode: 'general' as const,
      quickActions: [
        { label: '🌐 Open resalifescience.in', action: 'visit_website' },
        { label: '🏭 Start Manufacturing Enquiry', action: 'start_enquiry' },
        { label: '✨ Explore Resa Brands', action: 'explore_brands' },
        { label: '📞 Contact Technical Team', action: 'contact_resa' }
      ]
    };
  }

  // 2. Fall back to Gemini API (server-side with @google/genai)
  const client = getAiClient();
  if (client) {
    try {
      const formattedContents = [
        ...history.map(h => ({
          role: h.role,
          parts: h.parts
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.4,
          maxOutputTokens: 500
        }
      });

      const responseText = response.text || "Hello! I'm here to assist you with consumer beauty product recommendations or contract manufacturing inquiries for Resa Life Sci.";

      // Detect if user text seems business-oriented
      const isBusiness =
        userText.includes('manufactur') ||
        userText.includes('brand') ||
        userText.includes('contract') ||
        userText.includes('order') ||
        userText.includes('b2b');

      return {
        text: responseText,
        detectedMode: isBusiness ? ('business' as const) : ('consumer' as const)
      };
    } catch (err) {
      console.warn('Gemini API call failed, using graceful fallback:', err);
    }
  }

  // Fallback if Gemini key is missing or failed
  return {
    text: "Welcome to Resa Life Sci. I can help you discover the ideal haircare or facial-care regimen across our official brands (Keragraphy, Calveo Professional, PH Professional, The Body Graph), or guide you through contract cosmetics manufacturing.",
    detectedMode: (userMode as any) || 'general',
    quickActions: [
      { label: '🧴 Find My Beauty Product', action: 'find_beauty' },
      { label: '🏭 Manufacturing & Private Label', action: 'manufacturing' }
    ]
  };
}
