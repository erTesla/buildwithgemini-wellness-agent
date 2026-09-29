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

describe('Non-Unique Username and Persistent Data Synchronization', () => {
  it('correctly derives user ID from non-unique display username', async () => {
    const { sanitizeUsernameToId, setUserNameAndId, getCurrentUserName, getCurrentUserId } = await import('../services/wellnessService');
    
    expect(sanitizeUsernameToId('Alex')).toBe('user_alex');
    expect(sanitizeUsernameToId('Maya Lin')).toBe('user_maya_lin');
    expect(sanitizeUsernameToId('Sam @123!')).toBe('user_sam_123');

    // Setting username updates both display name and Firestore user ID
    const res = setUserNameAndId('Maya Lin');
    expect(res.userName).toBe('Maya Lin');
    expect(res.userId).toBe('user_maya_lin');
    expect(getCurrentUserName()).toBe('Maya Lin');
    expect(getCurrentUserId()).toBe('user_maya_lin');

    // Re-entering the same username connects to the exact same persistent data ID
    const reentered = setUserNameAndId('maya lin');
    expect(reentered.userId).toBe('user_maya_lin');
  });
});
