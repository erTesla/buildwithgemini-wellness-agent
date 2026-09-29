import { describe, it, expect } from 'vitest';
import { detectCrisis, CRISIS_SUPPORT_TEXT } from '../services/aiService';

describe('AI Safety & Wellness Guardrails', () => {
  it('identifies self-harm or crisis keywords accurately', () => {
    expect(detectCrisis('I feel like I want to die')).toBe(true);
    expect(detectCrisis('I am thinking of cutting myself')).toBe(true);
    expect(detectCrisis('I feel a bit tired today but had a good walk')).toBe(false);
  });

  it('supplies official emergency hotlines in crisis support text', () => {
    expect(CRISIS_SUPPORT_TEXT).toContain('988');
    expect(CRISIS_SUPPORT_TEXT).toContain('741741');
    expect(CRISIS_SUPPORT_TEXT).toContain('findahelpline.com');
  });
});
