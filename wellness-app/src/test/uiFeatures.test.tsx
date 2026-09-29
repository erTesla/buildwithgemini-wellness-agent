import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  playCompanionBoop, 
  playMessageChime, 
  playTaskSuccess 
} from '../services/soundEffects';
import { AmbientCompanionWidget } from '../components/AmbientCompanionWidget';
import { MobileBottomNav } from '../components/MobileBottomNav';

describe('Web Audio Synthesizer (soundEffects.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults sound to enabled and allows toggling', () => {
    expect(isSoundEnabled()).toBe(true);
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('runs play functions safely without throwing in any environment', () => {
    expect(() => playCompanionBoop()).not.toThrow();
    expect(() => playMessageChime()).not.toThrow();
    expect(() => playTaskSuccess()).not.toThrow();
  });
});

describe('Ambient Companion Widget ("Tamagotchi Mode")', () => {
  it('renders ambient widget with companion and pet button', () => {
    render(<AmbientCompanionWidget companionType="puppy" />);
    
    // Check for title and pet button
    expect(screen.getByText(/Quiet Ambient Buddy/i)).not.toBeNull();
    expect(screen.getByText(/Pet \(0\)/i)).not.toBeNull();
  });

  it('increments pet counter when pet button is clicked', () => {
    render(<AmbientCompanionWidget companionType="cat" />);
    
    const petBtn = screen.getByText(/Pet \(0\)/i);
    fireEvent.click(petBtn);
    expect(screen.getByText(/Pet \(1\)/i)).not.toBeNull();
    
    fireEvent.click(petBtn);
    expect(screen.getByText(/Pet \(2\)/i)).not.toBeNull();
  });

  it('can be minimized and expanded', () => {
    render(<AmbientCompanionWidget companionType="racoon" />);
    
    const minimizeBtn = screen.getByTitle(/Minimize/i);
    fireEvent.click(minimizeBtn);

    // Now in minimized state
    expect(screen.getByTitle(/Click to expand companion/i)).not.toBeNull();

    // Click to expand back
    fireEvent.click(screen.getByTitle(/Click to expand companion/i));
    expect(screen.getByText(/Quiet Ambient Buddy/i)).not.toBeNull();
  });
});

describe('Mobile Bottom Navigation Bar', () => {
  it('renders mobile navigation buttons and fires callbacks', () => {
    const handleSelectTab = vi.fn();
    const handleToggleSimpleMode = vi.fn();

    render(
      <MobileBottomNav 
        currentTab="dashboard" 
        onSelectTab={handleSelectTab} 
        isSimpleMode={true} 
        onToggleSimpleMode={handleToggleSimpleMode} 
      />
    );

    // Chat button
    const chatBtn = screen.getByText(/Chat/i);
    expect(chatBtn).not.toBeNull();

    // Home / Dashboard button
    const homeBtn = screen.getByText(/Home/i);
    expect(homeBtn).not.toBeNull();

    // Click Home button -> toggles out of simple mode and navigates to dashboard
    fireEvent.click(homeBtn);
    expect(handleToggleSimpleMode).toHaveBeenCalledWith(false);
    expect(handleSelectTab).toHaveBeenCalledWith('dashboard');
  });
});

describe('UI Theme Selection & Neo-Brutalism Option', () => {
  it('renders all 3 theme options in Settings: Clean Light, Cozy Ember, and Neo-Brutalism', async () => {
    const { ProfileScreen } = await import('../screens/ProfileScreen');
    const onSelectTheme = vi.fn();
    const mockPrefs = {
      userId: 'test_user',
      budgetLevel: 'moderate' as const,
      typicalAvailableTimeMinutes: 30,
      consentExternalAI: true,
      enableCrisisAssistance: true,
      theme: 'light' as const,
      updatedAt: new Date().toISOString()
    };

    render(
      <ProfileScreen
        userId="test_user"
        preferences={mockPrefs}
        onSavePreferences={vi.fn()}
        onReloadAllData={vi.fn()}
        theme="light"
        onSelectTheme={onSelectTheme}
      />
    );

    // Verify UI Theme header and 3 options
    expect(screen.getByText(/UI Theme & Visual Style/i)).not.toBeNull();
    expect(screen.getAllByText(/Clean Light/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cozy Ember/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Neo-Brutalism/i).length).toBeGreaterThan(0);

    // Click Neo-Brutalism theme
    const brutalistBtn = screen.getByRole('button', { name: /Neo-Brutalism/i });
    fireEvent.click(brutalistBtn);

    expect(onSelectTheme).toHaveBeenCalledWith('brutalist');
  });
});
