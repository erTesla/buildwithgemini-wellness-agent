import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PixelCompanion } from '../components/PixelCompanion';
import { PixelLoadingScreen } from '../components/PixelLoadingScreen';

describe('PixelCompanion Component', () => {
  it('renders Puppy companion correctly with idle eyes and outline', () => {
    const { container } = render(<PixelCompanion type="puppy" emotion="idle" size="md" />);
    expect(container.querySelector('#puppy-base')).not.toBeNull();
    expect(container.querySelector('#eyes-idle')).not.toBeNull();
  });

  it('renders Cat companion with perked ears and whiskers', () => {
    const { container } = render(<PixelCompanion type="cat" emotion="idle" size="md" />);
    expect(container.querySelector('#cat-base')).not.toBeNull();
  });

  it('renders Raccoon companion with bandit mask', () => {
    const { container } = render(<PixelCompanion type="racoon" emotion="idle" size="md" />);
    expect(container.querySelector('#raccoon-base')).not.toBeNull();
  });

  it('switches eyes and renders thought dots in thinking mode', () => {
    const { container } = render(<PixelCompanion type="puppy" emotion="thinking" size="lg" showThoughtBubble={true} />);
    expect(container.querySelector('#eyes-thinking')).not.toBeNull();
    expect(container.querySelector('#thinking-dots')).not.toBeNull();
  });

  it('renders squeezed happy eyes and blush cheeks in smile mode', () => {
    const { container } = render(<PixelCompanion type="cat" emotion="smile" size="lg" />);
    expect(container.querySelector('#eyes-smile')).not.toBeNull();
    expect(container.querySelector('#mouth-smile')).not.toBeNull();
  });

  it('renders wide glossy empathetic pupils in sad mode', () => {
    const { container } = render(<PixelCompanion type="racoon" emotion="sad" size="lg" />);
    expect(container.querySelector('#eyes-sad')).not.toBeNull();
  });

  it('renders T-Rex companion with dino spikes and arms', () => {
    const { container } = render(<PixelCompanion type="trex" emotion="idle" size="md" />);
    expect(container.querySelector('#trex-base')).not.toBeNull();
    expect(container.querySelector('#eyes-idle')).not.toBeNull();
  });

  it('renders T-Rex teeth in smile mode', () => {
    const { container } = render(<PixelCompanion type="trex" emotion="smile" size="lg" />);
    expect(container.querySelector('#trex-teeth')).not.toBeNull();
  });

  it('renders Cloud Potato with fluffy body and green leafy sprout', () => {
    const { container } = render(<PixelCompanion type="cloud_potato" emotion="idle" size="md" />);
    expect(container.querySelector('#potato-base')).not.toBeNull();
    expect(container.querySelector('#eyes-idle')).not.toBeNull();
  });

  it('renders Cloud Potato steam curls on smile', () => {
    const { container } = render(<PixelCompanion type="cloud_potato" emotion="smile" size="lg" />);
    expect(container.querySelector('#potato-steam')).not.toBeNull();
  });

  it('renders Cloud Blueberry with berry crown calyx and indigo body', () => {
    const { container } = render(<PixelCompanion type="cloud_blueberry" emotion="idle" size="md" />);
    expect(container.querySelector('#blueberry-base')).not.toBeNull();
    expect(container.querySelector('#eyes-idle')).not.toBeNull();
  });

  it('renders Cloud Blueberry sparkles on smile', () => {
    const { container } = render(<PixelCompanion type="cloud_blueberry" emotion="smile" size="lg" />);
    expect(container.querySelector('#blueberry-shine')).not.toBeNull();
  });

  it('reacts to click by wiggling and temporarily smiling', () => {
    const { container } = render(<PixelCompanion type="puppy" emotion="idle" interactive={true} />);
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.click(wrapper);
    // Should now show smile eyes
    expect(container.querySelector('#eyes-smile')).not.toBeNull();
  });
});

describe('PixelLoadingScreen Component', () => {
  it('mounts and renders companion and loading progress without pill selector', () => {
    const { container } = render(<PixelLoadingScreen message="Who-Hum is waking up..." />);
    expect(screen.getByText(/Who-Hum is waking up/i)).toBeTruthy();
    expect(screen.getByText(/WHO-HUM COMPANION ENGINE/i)).toBeTruthy();
    // Verify no interactive pill selectors are rendered
    expect(container.querySelector('button')).toBeNull();
  });
});

describe('CompanionOnboardingModal Component', () => {
  it('renders all 6 companions: Cat, Racoon Dog, Dog, T-Rex, Cloud Potato, and Cloud Blueberry', async () => {
    const { CompanionOnboardingModal } = await import('../components/CompanionOnboardingModal');
    let selectedCompanion = '';
    const { container } = render(
      <CompanionOnboardingModal 
        isOpen={true} 
        onSelectCompanion={(c) => { selectedCompanion = c; }} 
      />
    );

    // Verify companions are presented
    expect(screen.getByText(/Choose Your Quiet Companion/i)).toBeTruthy();
    expect(screen.getByText(/Racoon Dog/i)).toBeTruthy();
    expect(screen.getByText(/T-Rex/i)).toBeTruthy();
    expect(screen.getByText(/Cloud Potato/i)).toBeTruthy();
    expect(screen.getByText(/Cloud Blueberry/i)).toBeTruthy();

    // Select Cloud Potato
    const potatoBtn = screen.getByRole('button', { name: /Cloud Potato/i });
    fireEvent.click(potatoBtn);

    // Confirm selection
    const confirmBtn = screen.getByRole('button', { name: /Bond with Cloud Potato/i });
    fireEvent.click(confirmBtn);

    expect(selectedCompanion).toBe('cloud_potato');
    expect(localStorage.getItem('whohum_companion_chosen')).toBe('true');
    expect(localStorage.getItem('whohum_companion')).toBe('cloud_potato');
  });

  it('does not render when isOpen is false', async () => {
    const { CompanionOnboardingModal } = await import('../components/CompanionOnboardingModal');
    const { container } = render(
      <CompanionOnboardingModal 
        isOpen={false} 
        onSelectCompanion={() => {}} 
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('asks for username on first-time onboarding and persists it', async () => {
    localStorage.clear();
    const { CompanionOnboardingModal } = await import('../components/CompanionOnboardingModal');
    let selectedCompanion = '';
    let selectedUsername = '';
    render(
      <CompanionOnboardingModal 
        isOpen={true} 
        onSelectCompanion={(c, u) => { 
          selectedCompanion = c; 
          selectedUsername = u || '';
        }} 
      />
    );

    // Verify username prompt and non-unique disclaimer
    expect(screen.getByText(/Choose Your Username \(Non-Unique\)/i)).toBeTruthy();
    const usernameInput = screen.getByPlaceholderText(/e\.g\. Alex, Maya, Sam/i);
    expect(usernameInput).toBeTruthy();

    // Type a custom username
    fireEvent.change(usernameInput, { target: { value: 'Alex Walker' } });

    // Confirm selection with Cat (default)
    const confirmBtn = screen.getByRole('button', { name: /Bond with /i });
    fireEvent.click(confirmBtn);

    expect(selectedCompanion).toBe('cat');
    expect(selectedUsername).toBe('Alex Walker');
    expect(localStorage.getItem('whohum_username')).toBe('Alex Walker');
  });
});
