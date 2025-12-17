import { useEffect, useRef, useState } from 'react';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  youtubeKey?: string;
  videoUrl?: string;
  isPlaying?: boolean;
  currentTime?: number;
  onPlayPause?: () => void;
  onTimeUpdate?: (time: number) => void;
  onSeek?: (time: number) => void;
  title?: string;
}

export const VideoPlayer = ({
  youtubeKey,
  videoUrl,
  isPlaying = false,
  currentTime = 0,
  onPlayPause,
  onTimeUpdate,
  onSeek,
  title = 'Movie',
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [internalPlaying, setInternalPlaying] = useState(isPlaying);
  const [internalTime, setInternalTime] = useState(currentTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync external state with internal state
  useEffect(() => {
    setInternalPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    setInternalTime(currentTime);
  }, [currentTime]);

  // Handle video element playback
  useEffect(() => {
    if (videoRef.current && !youtubeKey) {
      if (internalPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [internalPlaying, youtubeKey]);

  // Handle time sync for video element
  useEffect(() => {
    if (videoRef.current && !youtubeKey && Math.abs(videoRef.current.currentTime - currentTime) > 1) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime, youtubeKey]);

  const handlePlayPause = () => {
    const newState = !internalPlaying;
    setInternalPlaying(newState);
    onPlayPause?.();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setInternalTime(time);
      onTimeUpdate?.(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setInternalTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
    onSeek?.(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!document.fullscreenElement && container) {
      container.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // YouTube player
  if (youtubeKey) {
    return (
      <div className={styles.container}>
        <div className={styles.videoWrapper}>
          <iframe
            ref={iframeRef}
            className={styles.iframe}
            src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=${internalPlaying ? 1 : 0}&start=${Math.floor(currentTime)}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  // HTML5 video player or demo mode
  return (
    <div className={styles.container}>
      <div className={styles.videoWrapper}>
        {videoUrl ? (
          <video
            ref={videoRef}
            className={styles.video}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className={styles.demoMode}>
            <div className={styles.demoContent}>
              <h3>🎬 Demo Mode</h3>
              <p>This is a demonstration of the video player.</p>
              <p>In a production environment, this would play the actual movie trailer.</p>
            </div>
          </div>
        )}
        
        <div className={styles.controls}>
          <button
            className={styles.playButton}
            onClick={handlePlayPause}
            aria-label={internalPlaying ? 'Pause' : 'Play'}
          >
            {internalPlaying ? '⏸️' : '▶️'}
          </button>

          <div className={styles.progressContainer}>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={internalTime}
              onChange={handleSeek}
              className={styles.progressBar}
            />
            <div className={styles.timeDisplay}>
              {formatTime(internalTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className={styles.volumeContainer}>
            <span>🔊</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className={styles.volumeBar}
            />
          </div>

          <button
            className={styles.fullscreenButton}
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? '⊗' : '⛶'}
          </button>
        </div>
      </div>
    </div>
  );
};
