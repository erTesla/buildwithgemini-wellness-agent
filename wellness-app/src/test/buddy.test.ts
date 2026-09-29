import { describe, it, expect } from 'vitest';
import { askAgentAssistant } from '../services/aiService';
import { UserPreferences } from '../types';

describe('AI Chat Buddy Natural Tone & Daily Logging', () => {
  const dummyPrefs: UserPreferences = {
    userId: 'test_user',
    budgetLevel: 'moderate',
    typicalAvailableTimeMinutes: 30,
    preferredLocation: 'San Francisco',
    consentExternalAI: true,
    enableCrisisAssistance: true,
    theme: 'google-light',
    dietaryOrCookingPreferences: 'Healthy',
    readingPreferences: 'Fiction',
    travelPreferences: 'Parks',
    updatedAt: new Date().toISOString()
  };

  it('responds naturally and automatically logs check-in when user says they bought a cycle', async () => {
    const response = await askAgentAssistant("I am so happy today i boud a cyle. ", {
      userId: 'test_user',
      checkins: [],
      tasks: [],
      hobbies: [],
      preferences: dummyPrefs
    });

    expect(response.content).toContain('cycle');
    expect(response.content.toLowerCase()).toContain('congrats');
    expect(response.loggedCheckIn).toBeDefined();
    expect(response.loggedCheckIn?.mood).toBe('thriving');
    expect(response.loggedCheckIn?.energyLevel).toBe(5);
    expect(response.loggedCheckIn?.source).toBe('chat');
    expect(response.suggestedHobbies).toBeDefined();
    expect(response.suggestedHobbies?.[0].name).toContain('Cycling');
  });

  it('responds naturally to general feeling updates and logs a daily entry with source chat', async () => {
    const response = await askAgentAssistant("Today was really productive, I finished all my project milestones!", {
      userId: 'test_user',
      checkins: [],
      tasks: [],
      hobbies: [],
      preferences: dummyPrefs
    });

    expect(response.loggedCheckIn).toBeDefined();
    expect(response.loggedCheckIn?.source).toBe('chat');
    expect(response.content).toBeDefined();
  });
});
