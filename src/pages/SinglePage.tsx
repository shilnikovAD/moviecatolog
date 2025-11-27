import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { fetchPopularMovies, searchMovies, clearSearchResults, fetchMovieDetails } from '../features/movies/moviesSlice.ts';
import { clearFavorites } from '../features/favorites/favoritesSlice.ts';
import { MovieCard } from '../components/MovieCard.tsx';
import { SearchBar } from '../components/SearchBar.tsx';
import { movieApi } from '../services/movieApi.ts';
import { addToFavorites, removeFromFavorites } from '../features/favorites/favoritesSlice.ts';
import styles from './SinglePage.module.css';

export const SinglePage = () => {
  const dispatch = useAppDispatch();
  const { movies, searchResults, movieDetails, loading, error } = useAppSelector((state) => state.movies);
  const favorites = useAppSelector((state) => state.favorites.favorites);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPopularMovies(1));
  }, [dispatch]);

  useEffect(() => {
    if (selectedMovieId) {
      dispatch(fetchMovieDetails(selectedMovieId));
    }
  }, [dispatch, selectedMovieId]);

  const handleSearch = (query: string) => {
    dispatch(searchMovies({ query }));
  };

  const handleClearSearch = () => {
    dispatch(clearSearchResults());
  };

  const handleClearAllFavorites = () => {
    if (window.confirm('Are you sure you want to clear all favorites?')) {
      dispatch(clearFavorites());
    }
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    // Scroll to movie details section
    document.getElementById('movie-details')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCloseDetails = () => {
    setSelectedMovieId(null);
  };

  const displayMovies = searchResults.length > 0 ? searchResults : movies;
  const isSearchActive = searchResults.length > 0;

  const isFavorite = movieDetails ? favorites.some((fav) => fav.id === movieDetails.id) : false;

  const handleFavoriteClick = () => {
    if (movieDetails) {
      if (isFavorite) {
        dispatch(removeFromFavorites(movieDetails.id));
      } else {
        dispatch(addToFavorites(movieDetails));
      }
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero / Home Section */}
      <section id="home" className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>Discover Movies</h1>
            <p className={styles.subtitle}>Browse popular movies or search for your favorites</p>
          </div>
          <SearchBar onSearch={handleSearch} />
          {isSearchActive && (
            <button className={styles.clearBtn} onClick={handleClearSearch}>
              Clear Search Results
            </button>
          )}

          {loading && !selectedMovieId && <div className={styles.loading}>Loading...</div>}
          {error && <div className={styles.error}>{error}</div>}
          
          {!loading && !error && displayMovies.length === 0 && (
            <div className={styles.empty}>No movies found</div>
          )}

          {!loading && displayMovies.length > 0 && (
            <div className={styles.grid}>
              {displayMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => handleMovieClick(movie.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Movie Details Section */}
      <section id="movie-details" className={`${styles.section} ${styles.detailsSection}`}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>Movie Details</h2>
          {!selectedMovieId && (
            <div className={styles.placeholder}>
              <p>Select a movie above to see its details here</p>
            </div>
          )}
          {selectedMovieId && loading && <div className={styles.loading}>Loading movie details...</div>}
          {selectedMovieId && movieDetails && !loading && (
            <div className={styles.detailsContent}>
              <button className={styles.closeBtn} onClick={handleCloseDetails}>
                × Close Details
              </button>
              <div className={styles.movieDetails}>
                <img
                  src={movieApi.getImageUrl(movieDetails.poster_path)}
                  alt={movieDetails.title}
                  className={styles.poster}
                  loading="lazy"
                />
                <div className={styles.details}>
                  <div className={styles.detailsHeader}>
                    <div>
                      <h3 className={styles.movieTitle}>{movieDetails.title}</h3>
                      {movieDetails.tagline && <p className={styles.tagline}>"{movieDetails.tagline}"</p>}
                    </div>
                    <button
                      className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ''}`}
                      onClick={handleFavoriteClick}
                    >
                      {isFavorite ? '❤️ Remove' : '🤍 Add to Favorites'}
                    </button>
                  </div>

                  <div className={styles.meta}>
                    <div className={styles.metaItem}>
                      <span className={styles.rating}>⭐ {movieDetails.vote_average.toFixed(1)}</span>
                      <span>({movieDetails.vote_count} votes)</span>
                    </div>
                    <div className={styles.metaItem}>📅 {movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : 'N/A'}</div>
                    <div className={styles.metaItem}>⏱️ {Math.floor(movieDetails.runtime / 60)}h {movieDetails.runtime % 60}m</div>
                    <div className={styles.metaItem}>📊 {movieDetails.status}</div>
                  </div>

                  {movieDetails.genres.length > 0 && (
                    <div className={styles.genresSection}>
                      <h4>Genres</h4>
                      <div className={styles.genres}>
                        {movieDetails.genres.map((genre) => (
                          <span key={genre.id} className={styles.genre}>
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.overviewSection}>
                    <h4>Overview</h4>
                    <p className={styles.overview}>{movieDetails.overview || 'No overview available.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Favorites Section */}
      <section id="favorites" className={styles.section}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>My Favorites</h2>
          <p className={styles.sectionSubtitle}>Your collection of favorite movies</p>

          {favorites.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>💔</div>
              <p>No favorites yet. Start adding movies you love!</p>
            </div>
          ) : (
            <>
              <button className={styles.clearAllBtn} onClick={handleClearAllFavorites}>
                Clear All Favorites
              </button>
              <div className={styles.grid}>
                {favorites.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={() => handleMovieClick(movie.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`${styles.section} ${styles.aboutSection}`}>
        <div className={styles.sectionContent}>
          <h2 className={styles.sectionTitle}>About MovieCatalog</h2>
          <p className={styles.sectionSubtitle}>Your personal movie discovery platform</p>

          <div className={styles.aboutContent}>
            <div className={styles.aboutCard}>
              <h3>About the Project</h3>
              <p>
                MovieCatalog is a modern React application built with TypeScript that helps you discover,
                search, and organize your favorite movies. Powered by The Movie Database (TMDB) API,
                it provides up-to-date information about thousands of movies.
              </p>
            </div>

            <div className={styles.aboutCard}>
              <h3>Features</h3>
              <ul className={styles.features}>
                <li className={styles.feature}>
                  <span className={styles.icon}>🔍</span>
                  <span>Search through thousands of movies</span>
                </li>
                <li className={styles.feature}>
                  <span className={styles.icon}>⭐</span>
                  <span>View detailed information including ratings and reviews</span>
                </li>
                <li className={styles.feature}>
                  <span className={styles.icon}>❤️</span>
                  <span>Save your favorite movies for quick access</span>
                </li>
                <li className={styles.feature}>
                  <span className={styles.icon}>📱</span>
                  <span>Fully responsive design for all devices</span>
                </li>
                <li className={styles.feature}>
                  <span className={styles.icon}>🎨</span>
                  <span>Modern and intuitive user interface</span>
                </li>
              </ul>
            </div>

            <div className={styles.aboutCard}>
              <h3>Technologies Used</h3>
              <div className={styles.tech}>
                <span className={styles.techItem}>React 19</span>
                <span className={styles.techItem}>TypeScript</span>
                <span className={styles.techItem}>Redux Toolkit</span>
                <span className={styles.techItem}>CSS Modules</span>
                <span className={styles.techItem}>Vite</span>
                <span className={styles.techItem}>Vitest</span>
                <span className={styles.techItem}>Storybook</span>
              </div>
            </div>

            <div className={styles.aboutCard}>
              <h3>Data Source</h3>
              <p>
                This product uses the TMDB API but is not endorsed or certified by TMDB.
                All movie data, images, and information are provided by The Movie Database.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
