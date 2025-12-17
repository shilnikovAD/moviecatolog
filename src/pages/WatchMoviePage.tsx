import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { fetchMovieDetails } from '../features/movies/moviesSlice.ts';
import { VideoPlayer } from '../components/VideoPlayer.tsx';
import { movieApi } from '../services/movieApi.ts';
import styles from './WatchMoviePage.module.css';

export const WatchMoviePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { movieDetails, loading, error } = useAppSelector((state) => state.movies);
  const [youtubeKey, setYoutubeKey] = useState<string | undefined>();
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(fetchMovieDetails(Number(id)));
      
      // Fetch video trailers
      movieApi.getMovieVideos(Number(id))
        .then((data: { results?: Array<{ type: string; site: string; key: string }> }) => {
          // Find the first YouTube trailer
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

  if (loading || loadingVideo) {
    return <div className={styles.loading}>Loading movie...</div>;
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
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          
          <VideoPlayer
            youtubeKey={youtubeKey}
            title={movieDetails.title}
          />
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

            <button
              className={styles.watchPartyBtn}
              onClick={() => navigate(`/watch-party/${id}`)}
            >
              🎉 Start Watch Party
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
