import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { fetchMovieDetails } from '../features/movies/moviesSlice.ts';
import { VideoPlayer } from '../components/VideoPlayer.tsx';
import { movieApi } from '../services/movieApi.ts';
import styles from './WatchPartyPage.module.css';

interface SyncMessage {
  type: 'play' | 'pause' | 'seek';
  time?: number;
  senderId: string;
}

export const WatchPartyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { movieDetails, loading, error } = useAppSelector((state) => state.movies);
  const [youtubeKey, setYoutubeKey] = useState<string | undefined>();
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [participants, setParticipants] = useState(1);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const sessionIdRef = useRef(Math.random().toString(36).substring(7));

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieDetails(Number(id)));
      
      // Fetch video trailers
      movieApi.getMovieVideos(Number(id))
        .then((data: { results?: Array<{ type: string; site: string; key: string }> }) => {
          const trailer = data.results?.find(
            (video) => video.type === 'Trailer' && video.site === 'YouTube'
          );
          if (trailer) {
            setYoutubeKey(trailer.key);
          }
          setLoadingVideo(false);
        })
        .catch((err) => {
          console.error('Failed to fetch videos:', err);
          setLoadingVideo(false);
        });
    }
  }, [dispatch, id]);

  // Setup BroadcastChannel for watch party synchronization
  useEffect(() => {
    const channelName = `watch-party-${id}`;
    const channel = new BroadcastChannel(channelName);
    const sessionId = sessionIdRef.current;
    channelRef.current = channel;

    // Announce presence
    channel.postMessage({ type: 'join', senderId: sessionId });

    channel.onmessage = (event: MessageEvent) => {
      const message = event.data as SyncMessage | { type: 'join' | 'leave'; senderId: string };
      
      // Ignore messages from self
      if (message.senderId === sessionId) {
        return;
      }

      switch (message.type) {
        case 'play':
          setIsPlaying(true);
          if ('time' in message && message.time !== undefined) {
            setCurrentTime(message.time);
          }
          break;
        case 'pause':
          setIsPlaying(false);
          if ('time' in message && message.time !== undefined) {
            setCurrentTime(message.time);
          }
          break;
        case 'seek':
          if ('time' in message && message.time !== undefined) {
            setCurrentTime(message.time);
          }
          break;
        case 'join':
          // Count participants
          setParticipants((prev) => prev + 1);
          break;
      }
    };

    return () => {
      channel.postMessage({ type: 'leave', senderId: sessionId });
      channel.close();
    };
  }, [id]);

  const handlePlayPause = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: newState ? 'play' : 'pause',
        time: currentTime,
        senderId: sessionIdRef.current,
      });
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'seek',
        time,
        senderId: sessionIdRef.current,
      });
    }
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  if (loading || loadingVideo) {
    return <div className={styles.loading}>Loading watch party...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!movieDetails) {
    return <div className={styles.error}>Movie not found</div>;
  }

  const year = movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 'N/A';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.playerSection}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
              ← Back
            </button>
            
            <div className={styles.partyInfo}>
              <span className={styles.partyBadge}>🎉 Watch Party</span>
              <span className={styles.participants}>
                {participants} {participants === 1 ? 'viewer' : 'viewers'}
              </span>
            </div>
          </div>
          
          <VideoPlayer
            youtubeKey={youtubeKey}
            title={movieDetails.title}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onPlayPause={handlePlayPause}
            onTimeUpdate={handleTimeUpdate}
            onSeek={handleSeek}
          />

          <div className={styles.instructions}>
            <h3>📖 Watch Party Instructions</h3>
            <ul>
              <li>Open this page in multiple browser tabs to test synchronization</li>
              <li>Play/pause controls are synchronized across all tabs</li>
              <li>Seeking is synchronized across all tabs</li>
              <li>Works on the same computer (BroadcastChannel API)</li>
            </ul>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.movieInfo}>
            <img
              src={movieApi.getImageUrl(movieDetails.poster_path, 'w300')}
              alt={movieDetails.title}
              className={styles.poster}
            />
            
            <h1 className={styles.title}>{movieDetails.title}</h1>
            
            {movieDetails.tagline && (
              <p className={styles.tagline}>"{movieDetails.tagline}"</p>
            )}

            <div className={styles.meta}>
              <div className={styles.metaItem}>
                <span className={styles.rating}>⭐ {movieDetails.vote_average.toFixed(1)}</span>
              </div>
              <div className={styles.metaItem}>📅 {year}</div>
              <div className={styles.metaItem}>
                ⏱️ {Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m
              </div>
            </div>

            {movieDetails.genres.length > 0 && (
              <div className={styles.genres}>
                {movieDetails.genres.map((genre) => (
                  <span key={genre.id} className={styles.genre}>
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.overview}>
              <h3>Overview</h3>
              <p>{movieDetails.overview || 'No overview available.'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
