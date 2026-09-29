import { describe, it, expect } from 'vitest';
import { 
  ALL_COMPANIONS, 
  COMPANION_REGISTRY, 
  getCompanionMetadata, 
  formatCompanionLabel 
} from '../domain/companions';

describe('Domain Layer: Companions', () => {
  it('contains all 6 registered companions in ALL_COMPANIONS', () => {
    expect(ALL_COMPANIONS).toHaveLength(6);
    const ids = ALL_COMPANIONS.map(c => c.id);
    expect(ids).toContain('cat');
    expect(ids).toContain('racoon');
    expect(ids).toContain('puppy');
    expect(ids).toContain('trex');
    expect(ids).toContain('cloud_potato');
    expect(ids).toContain('cloud_blueberry');
  });

  it('provides complete metadata for Cloud Potato and Cloud Blueberry', () => {
    const potato = COMPANION_REGISTRY['cloud_potato'];
    expect(potato.name).toBe('Cloud Potato');
    expect(potato.emoji).toBe('🥔');
    expect(potato.tagline).toBe('Warm & Fluffy Comfort');

    const blueberry = COMPANION_REGISTRY['cloud_blueberry'];
    expect(blueberry.name).toBe('Cloud Blueberry');
    expect(blueberry.emoji).toBe('🫐');
    expect(blueberry.tagline).toBe('Sweet, Calming Berry Puff');
  });

  it('formats companion labels with emoji and name', () => {
    expect(formatCompanionLabel('cloud_potato')).toBe('🥔 Cloud Potato');
    expect(formatCompanionLabel('cloud_blueberry')).toBe('🫐 Cloud Blueberry');
    expect(formatCompanionLabel('trex')).toBe('🦖 T-Rex');
  });

  it('gracefully falls back to Cat when unknown companion type is passed', () => {
    // @ts-expect-error testing invalid type
    const fallback = getCompanionMetadata('unknown_dragon');
    expect(fallback.id).toBe('cat');
  });
});
