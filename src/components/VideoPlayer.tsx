import { useEffect, useRef, useState } from 'react';
import styles from './VideoPlayer.module.css';

interface VideoPlayerProps {
  videoUrl?: string;
  youtubeKey?: string;
  isPlaying: boolean;
  currentTime: number;
  onPlayPause: () => void;
  onTimeUpdate?: (time: number) => void;
  onSeek?: (time: number) => void;
  title?: string;
}

// Declare YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const VideoPlayer = ({
  videoUrl,
  youtubeKey,
  isPlaying,
  currentTime,
  onPlayPause,
  onTimeUpdate,
  onSeek,
  title = 'Movie'
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  // Загрузка YouTube API
  useEffect(() => {
    if (!youtubeKey) return;

    // Проверяем, загружен ли уже YouTube API
    if (window.YT && window.YT.Player) {
      setYoutubeReady(true);
      return;
    }

    // Загружаем YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setYoutubeReady(true);
    };
  }, [youtubeKey]);

  // Инициализация YouTube Player
  useEffect(() => {
    if (!youtubeKey || !youtubeReady || !iframeRef.current || youtubePlayerRef.current) return;

    const playerId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`;
    iframeRef.current.id = playerId;

    youtubePlayerRef.current = new window.YT.Player(playerId, {
      height: '100%',
      width: '100%',
      videoId: youtubeKey,
      playerVars: {
        autoplay: isPlaying ? 1 : 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          console.log('🎬 [VideoPlayer] YouTube player ready');
          if (isPlaying) {
            event.target.playVideo();
          }
        },
        onStateChange: (event: any) => {
          // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
          if (event.data === 1 && onTimeUpdate) {
            // Начинаем обновлять время при воспроизведении
            const interval = setInterval(() => {
              if (youtubePlayerRef.current) {
                const time = youtubePlayerRef.current.getCurrentTime();
                onTimeUpdate(time);
              }
            }, 500);
            (youtubePlayerRef.current as any).timeInterval = interval;
          } else {
            // Останавливаем обновление времени
            if ((youtubePlayerRef.current as any).timeInterval) {
              clearInterval((youtubePlayerRef.current as any).timeInterval);
            }
          }
        },
      },
    });

    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [youtubeKey, youtubeReady]);

  // Синхронизация YouTube плеера
  useEffect(() => {
    if (!youtubePlayerRef.current || !youtubePlayerRef.current.getPlayerState) return;

    const playerState = youtubePlayerRef.current.getPlayerState();

    if (isPlaying && playerState !== 1) {
      console.log('▶️ [VideoPlayer] YouTube play');
      youtubePlayerRef.current.playVideo();
    } else if (!isPlaying && playerState === 1) {
      console.log('⏸️ [VideoPlayer] YouTube pause');
      youtubePlayerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  // Синхронизация времени YouTube
  useEffect(() => {
    if (!youtubePlayerRef.current || !youtubePlayerRef.current.getCurrentTime) return;

    // Очищаем предыдущий таймаут
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Задержка для предотвращения слишком частых обновлений
    syncTimeoutRef.current = setTimeout(() => {
      const currentYoutubeTime = youtubePlayerRef.current.getCurrentTime();
      const diff = Math.abs(currentYoutubeTime - currentTime);

      if (diff > 2) { // Синхронизируем если разница больше 2 секунд
        console.log(`⏩ [VideoPlayer] YouTube seek: ${currentTime}s (diff: ${diff.toFixed(2)}s)`);
        youtubePlayerRef.current.seekTo(currentTime, true);
      }
    }, 100);
  }, [currentTime]);

  // Синхронизация воспроизведения с внешним состоянием (для обычного видео)
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  // Синхронизация времени (для обычного видео)
  useEffect(() => {
    if (!videoRef.current) return;

    const diff = Math.abs(videoRef.current.currentTime - currentTime);
    if (diff > 0.5) { // Синхронизируем если разница больше 0.5 секунды
      console.log(`⏩ [VideoPlayer] Video seek: ${currentTime}s (diff: ${diff.toFixed(2)}s)`);
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (onSeek) {
        onSeek(time);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Если есть YouTube ключ, показываем YouTube плеер
  if (youtubeKey) {
    return (
      <div className={styles.player}>
        <div ref={iframeRef} className={styles.youtubePlayer} />
        {!youtubeReady && (
          <div className={styles.loading}>
            <p>Loading YouTube Player...</p>
          </div>
        )}
      </div>
    );
  }

  // Если есть прямая ссылка на видео
  if (videoUrl) {
    return (
      <div className={styles.player}>
        <video
          ref={videoRef}
          className={styles.video}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={onPlayPause}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className={styles.controls}>
          <button className={styles.controlBtn} onClick={onPlayPause}>
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <input
            type="range"
            min="0"
            max={duration || 0}
            value={videoRef.current?.currentTime || 0}
            onChange={handleSeek}
            className={styles.seekBar}
          />

          <span className={styles.time}>
            {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
          </span>

          <button className={styles.controlBtn} onClick={toggleMute}>
            {isMuted || volume === 0 ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeBar}
          />

          <button className={styles.controlBtn} onClick={toggleFullscreen}>
            {isFullscreen ? '⛶' : '⛶'}
          </button>
        </div>
      </div>
    );
  }

  // Демо-режим с симуляцией видео
  return (
    <div className={styles.player}>
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <div className={styles.demoVideo}>
            <h2>🎬 {title}</h2>
            <div className={styles.demoScreen}>
              <div className={styles.statusIndicator}>
                {isPlaying ? '▶️ PLAYING' : '⏸️ PAUSED'}
              </div>
              <div className={styles.timeDisplay}>
                {formatTime(currentTime)} / 1:30:00
              </div>
              <div className={styles.syncInfo}>
                {isPlaying && (
                  <span className={styles.syncing}>🔄 Synced</span>
                )}
              </div>
            </div>
          </div>

          <div className={styles.demoControls}>
            <button className={styles.demoBtn} onClick={onPlayPause}>
              {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
            {onSeek && (
              <input
                type="range"
                min="0"
                max="5400"
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className={styles.demoSeekBar}
              />
            )}
          </div>

          <div className={styles.demoInfo}>
            <p>💡 Demo Mode - Simulating video playback</p>
            <p className={styles.hint}>Watch Party sync is working! Try it with 2 tabs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

