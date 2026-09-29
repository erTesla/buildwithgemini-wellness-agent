/**
 * Clean Architecture - Domain Layer
 * Companion Definitions, Types & Metadata Registry
 */

export type CompanionType = 
  | 'puppy' 
  | 'cat' 
  | 'racoon' 
  | 'trex' 
  | 'cloud_potato' 
  | 'cloud_blueberry';

export type CompanionEmotion = 'idle' | 'thinking' | 'smile' | 'sad';

export interface CompanionMetadata {
  id: CompanionType;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  accentBg: string;
  colorName: string;
}

export const COMPANION_REGISTRY: Record<CompanionType, CompanionMetadata> = {
  cat: {
    id: 'cat',
    name: 'Cat',
    emoji: '🐱',
    tagline: 'Quiet & Observant',
    description: 'Purrs softly, listens without judgment, and brings calm to your day.',
    accentBg: '#fed7aa',
    colorName: 'Warm Peach'
  },
  racoon: {
    id: 'racoon',
    name: 'Racoon Dog',
    emoji: '🦝',
    tagline: 'Curious & Thoughtful',
    description: 'Gentle bandit mask, playful spirit, and deeply attentive companion.',
    accentBg: '#cbd5e1',
    colorName: 'Slate Grey'
  },
  puppy: {
    id: 'puppy',
    name: 'Dog',
    emoji: '🐶',
    tagline: 'Loyal & Cheerful',
    description: 'Floppy ears, warm heart, and always ready to celebrate small wins.',
    accentBg: '#fef08a',
    colorName: 'Golden Amber'
  },
  trex: {
    id: 'trex',
    name: 'T-Rex',
    emoji: '🦖',
    tagline: 'Tiny Arms, Big Heart',
    description: 'Fiercely encouraging, retro dino spikes, and toothy joyful smiles.',
    accentBg: '#bbf7d0',
    colorName: 'Emerald Dino'
  },
  cloud_potato: {
    id: 'cloud_potato',
    name: 'Cloud Potato',
    emoji: '🥔',
    tagline: 'Warm & Fluffy Comfort',
    description: 'Gentle, starchy potato puff with tiny leafy sprout. Peak coziness and unconditional acceptance.',
    accentBg: '#fde68a',
    colorName: 'Russet Cloud'
  },
  cloud_blueberry: {
    id: 'cloud_blueberry',
    name: 'Cloud Blueberry',
    emoji: '🫐',
    tagline: 'Sweet, Calming Berry Puff',
    description: 'Plump indigo berry cloud with a leafy green crown. Radiates tranquility and sweet serene vibes.',
    accentBg: '#c7d2fe',
    colorName: 'Indigo Mist'
  }
};

export const ALL_COMPANIONS: CompanionMetadata[] = Object.values(COMPANION_REGISTRY);

export function getCompanionMetadata(type?: CompanionType): CompanionMetadata {
  if (!type || !COMPANION_REGISTRY[type]) {
    return COMPANION_REGISTRY.cat;
  }
  return COMPANION_REGISTRY[type];
}

export function formatCompanionLabel(type?: CompanionType): string {
  const meta = getCompanionMetadata(type);
  return `${meta.emoji} ${meta.name}`;
}
