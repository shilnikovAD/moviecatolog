import { render, screen } from '@testing-library/react';
import { VideoPlayer } from './VideoPlayer';
import { describe, it, expect } from 'vitest';

describe('VideoPlayer', () => {
  it('renders demo mode when no video source is provided', () => {
    render(<VideoPlayer title="Test Movie" />);
    expect(screen.getByText(/Demo Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/demonstration of the video player/i)).toBeInTheDocument();
  });

  it('renders YouTube iframe when youtubeKey is provided', () => {
    render(<VideoPlayer youtubeKey="test123" title="Test Movie" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.src).toContain('youtube.com/embed/test123');
  });

  it('renders play button', () => {
    render(<VideoPlayer title="Test Movie" />);
    const playButton = screen.getByLabelText(/play/i);
    expect(playButton).toBeInTheDocument();
  });

  it('renders fullscreen button', () => {
    render(<VideoPlayer title="Test Movie" />);
    const fullscreenButton = screen.getByLabelText(/fullscreen/i);
    expect(fullscreenButton).toBeInTheDocument();
  });
});
