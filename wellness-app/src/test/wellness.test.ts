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

  it('detects existing account data for a username and restores it for the session', async () => {
    const { checkUserDataExists, saveCheckIn, saveChatMessage, getChatMessages } = await import('../services/wellnessService');
    
    // For a brand new username
    const freshStatus = await checkUserDataExists('BrandNewUser999');
    expect(freshStatus.exists).toBe(false);
    expect(freshStatus.checkInCount).toBe(0);

    // Save check-in and chat message for this user
    await saveCheckIn({
      id: 'chk_test_1',
      userId: freshStatus.userId,
      date: '2026-09-29',
      mood: 4,
      energyLevel: 3,
      notes: 'Feeling productive',
      createdAt: new Date().toISOString()
    });

    await saveChatMessage(freshStatus.userId, {
      id: 'msg_test_1',
      role: 'user',
      content: 'Hello Who-Hum!',
      timestamp: new Date().toISOString()
    });

    // Now checkUserDataExists should report exists: true with data counts
    const existingStatus = await checkUserDataExists('BrandNewUser999');
    expect(existingStatus.exists).toBe(true);
    expect(existingStatus.checkInCount).toBeGreaterThanOrEqual(1);
    expect(existingStatus.messageCount).toBeGreaterThanOrEqual(1);

    // Restoring chat messages should return the saved message
    const restoredMessages = await getChatMessages(freshStatus.userId);
    expect(restoredMessages.some(m => m.content === 'Hello Who-Hum!')).toBe(true);
  });
});
