import { BrandInfo } from '../types';

export const RESA_COMPANY_INFO = {
  name: 'Resa Life Sci',
  officialName: 'Resa Lifescience',
  website: 'https://resalifescience.in',
  domain: 'resalifescience.in',
  tagline: 'Your intelligent beauty & cosmetics assistant',
  businessType: 'Cosmetics manufacturing, private-label & contract manufacturing',
  location: 'Bawana, New Delhi, India',
  phone: '+91 79718 91443',
  email: 'info@resalifescience.in',
  whatsapp: '+917971891443',
  businessAreas: [
    'Cosmetics manufacturing',
    'Private-label manufacturing',
    'Contract manufacturing & filling',
    'Product development & formulation',
    'Haircare manufacturing (Keragraphy, Calveo Professional)',
    'Skincare manufacturing (PH Professional)',
    'Personal-care & body-care manufacturing (The Body Graph, Missfit)',
    'Cosmetic packaging & container sourcing'
  ],
  verifiedNote: 'For specific MOQ, production capacities, timelines, and tailored pricing quotes, please connect directly with the Resa Life Sci technical sales team via resalifescience.in or start an enquiry.'
};

export const RESA_BRANDS: Record<string, BrandInfo> = {
  keragraphy: {
    id: 'keragraphy',
    name: 'Keragraphy',
    category: 'Haircare',
    tagline: 'Deep restoration & nourishment for rough, depleted hair',
    description: 'Specialized professional haircare system designed for intensive restoration, replenishing dry textures, and infusing resilience into rough-feeling hair fibers.',
    primaryBenefits: [
      'Targeted rough texture replenishment',
      'Advanced moisture lock technology',
      'Fiber smoothing & cuticle alignment'
    ],
    recommendedFor: ['Rough Hair', 'Dry-Looking Hair', 'Tangled Textures'],
    accentColor: '#9C7A5B'
  },
  calveo: {
    id: 'calveo',
    name: 'Calveo Professional',
    category: 'Haircare',
    tagline: 'Salon-grade smoothness, luminous shine & frizz control',
    description: 'High-performance salon formula engineered to deliver ultra-reflective mirror shine, silk-like touch, and effortless daily manageability.',
    primaryBenefits: [
      'Glass-like luminous shine',
      'Long-lasting frizz shielding',
      'Effortless comb-through & styling control'
    ],
    recommendedFor: ['Smoothness & Shine', 'Dull-Looking Hair', 'Frizz / Manageability'],
    accentColor: '#B38E5D'
  },
  ph_professional: {
    id: 'ph_professional',
    name: 'PH Professional',
    category: 'Facial Care',
    tagline: 'Precision facial care for a refreshed, balanced radiance',
    description: 'Dermatologically inspired facial-care formulations designed to revitalize tired, dull-looking skin and promote a clarified, glowing appearance.',
    primaryBenefits: [
      'Radiance revitalization for dull-looking skin',
      'Non-greasy hydration barrier support',
      'Refreshed, balanced skin appearance'
    ],
    recommendedFor: ['Dull-Looking Skin', 'Facial Care', 'Fresh / Glowing Appearance'],
    accentColor: '#4A6B5D'
  },
  body_graph: {
    id: 'body_graph',
    name: 'The Body Graph',
    category: 'Body Care',
    tagline: 'Holistic botanical personal care & wellness rituals',
    description: 'Artisanal body care and personal wellness formulas crafted for everyday rejuvenation, gentle nourishment, and sensorial care.',
    primaryBenefits: [
      'Deep body skin hydration',
      'Gentle soothing botanical profiles',
      'Daily personal-care nourishment'
    ],
    recommendedFor: ['General Body Care', 'Skin Softening', 'Daily Care'],
    accentColor: '#7D6357'
  }
};
