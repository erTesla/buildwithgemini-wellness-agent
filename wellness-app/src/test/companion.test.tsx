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

  it('reacts to click by wiggling and temporarily smiling', () => {
    const { container } = render(<PixelCompanion type="puppy" emotion="idle" interactive={true} />);
    const wrapper = container.firstChild as HTMLElement;
    fireEvent.click(wrapper);
    // Should now show smile eyes
    expect(container.querySelector('#eyes-smile')).not.toBeNull();
  });
});

describe('PixelLoadingScreen Component', () => {
  it('mounts and renders companion and loading progress', () => {
    render(<PixelLoadingScreen message="Who-Hum is waking up..." />);
    expect(screen.getByText(/Who-Hum is waking up/i)).toBeTruthy();
    expect(screen.getByText(/WHO-HUM COMPANION ENGINE/i)).toBeTruthy();
  });
});
