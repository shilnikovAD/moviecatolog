import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from '../features/movies/moviesSlice.ts';
import favoritesReducer from '../features/favorites/favoritesSlice.ts';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
