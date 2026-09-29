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
