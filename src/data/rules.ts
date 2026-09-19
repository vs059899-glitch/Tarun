import { RecommendationCardData } from '../types';
import { RESA_BRANDS } from './brands';

export interface ConsultationState {
  category?: 'Haircare' | 'Skincare' | 'Facial Care';
  concern?: string;
  preference?: string;
  step: number;
}

export function evaluateRecommendation(
  category?: string,
  concern?: string,
  preference?: string
): RecommendationCardData | null {
  const normCategory = (category || '').toLowerCase();
  const normConcern = (concern || '').toLowerCase();
  const normPref = (preference || '').toLowerCase();

  // Rule 1: Rough Hair -> Keragraphy
  if (
    normConcern.includes('rough') ||
    normConcern.includes('dry') ||
    normPref.includes('rough') ||
    normPref.includes('replenish')
  ) {
    const brand = RESA_BRANDS.keragraphy;
    return {
      id: 'rec_keragraphy_rough',
      brandName: brand.name,
      productCategory: 'Haircare',
      headline: 'Targeted Restoration for Rough-Looking Hair',
      recommendationWording:
        'Based on your stated concern about rough-looking hair, Keragraphy may be worth exploring.',
      ctaText: 'Explore Keragraphy',
      concernKey: 'ROUGH_HAIR',
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }

  // Rule 2: Smoothness & Shine -> Calveo Professional
  if (
    normConcern.includes('smooth') ||
    normConcern.includes('shine') ||
    normPref.includes('smooth') ||
    normPref.includes('shine')
  ) {
    const brand = RESA_BRANDS.calveo;
    return {
      id: 'rec_calveo_smoothness',
      brandName: brand.name,
      productCategory: 'Haircare',
      headline: 'Salon-Grade Smoothness & Luminous Gloss',
      recommendationWording:
        "Since you're looking for smoother and shinier-looking hair, Calveo Professional may be worth exploring.",
      ctaText: 'Explore Calveo',
      concernKey: 'SMOOTHNESS_SHINE',
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }

  // Rule 3: Dull hair / manageability / frizz -> Calveo Professional
  if (
    normCategory.includes('hair') &&
    (normConcern.includes('dull') ||
      normConcern.includes('frizz') ||
      normConcern.includes('manageab') ||
      normPref.includes('manageab'))
  ) {
    const brand = RESA_BRANDS.calveo;
    return {
      id: 'rec_calveo_manageability',
      brandName: brand.name,
      productCategory: 'Haircare',
      headline: 'Silky Manageability & Anti-Frizz Control',
      recommendationWording:
        'Based on your preference for enhanced manageability and revitalizing dull-looking hair, Calveo Professional may be worth exploring.',
      ctaText: 'Explore Calveo',
      concernKey: 'DULL_HAIR_MANAGEABILITY',
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }

  // Rule 4: Dull-looking skin + facial care / skincare -> PH Professional
  if (
    (normCategory.includes('skin') || normCategory.includes('facial')) &&
    (normConcern.includes('dull') ||
      normConcern.includes('facial') ||
      normConcern.includes('glow') ||
      normConcern.includes('fresh') ||
      normPref.includes('facial') ||
      normPref.includes('glow'))
  ) {
    const brand = RESA_BRANDS.ph_professional;
    return {
      id: 'rec_ph_facial_glow',
      brandName: brand.name,
      productCategory: 'Facial Care',
      headline: 'Revitalizing Radiance & Facial Clarity',
      recommendationWording:
        'Based on your interest in facial care and dull-looking skin, PH Professional facial-care products may be worth exploring.',
      ctaText: 'Explore PH Professional',
      concernKey: 'DULL_LOOKING_SKIN',
      brandTagline: brand.tagline,
      keyBenefits: brand.primaryBenefits
    };
  }

  return null;
}
