# MovieCatalog - React TypeScript Movie Application

A modern, responsive movie catalog application built with React, TypeScript, Redux Toolkit, and React Router. Browse popular movies, search for your favorites, and maintain a personalized favorites list.

## 🎬 Features

- **Browse Movies**: View popular movies from The Movie Database (TMDB)
- **Search Functionality**: Search for movies by title
- **Movie Details**: View comprehensive information about each movie
- **Favorites**: Save and manage your favorite movies (stored in localStorage)
- **Watch Movies**: Watch official movie trailers with integrated video player
- **Watch Party**: Synchronized viewing experience across multiple browser tabs
- **Responsive Design**: Fully responsive layout that works on all devices
- **Modern UI**: Clean, intuitive interface with CSS Modules

## 🚀 Technologies

- **React 19** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management with createAsyncThunk for API calls
- **React Router** - Client-side routing
- **CSS Modules** - Component-scoped styling
- **Vite** - Build tool and dev server
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing
- **Storybook** - Component documentation and testing
- **Cypress** - End-to-end testing

## 📋 Prerequisites

- Node.js 18+ and npm
- A TMDB API key (get one at https://www.themoviedb.org/settings/api)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd test
```

2. Install dependencies:
```bash
npm install
```

3. Configure API key:
   - Open `src/services/movieApi.ts`
   - Replace `YOUR_TMDB_API_KEY` with your actual TMDB API key

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🧪 Testing

### Unit Tests (Vitest)
Run all unit tests:
```bash
npm run test
```

Run tests with UI:
```bash
npm run test:ui
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Component Tests (Storybook)
Start Storybook:
```bash
npm run storybook
```
Storybook will be available at `http://localhost:6006`

Build Storybook:
```bash
npm run build-storybook
```

### E2E Tests (Cypress)
Open Cypress interactive mode:
```bash
npm run cypress
```

Run Cypress in headless mode:
```bash
npm run cypress:headless
```

**Note:** Make sure the dev server is running (`npm run dev`) before running E2E tests.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── MovieCard.tsx
│   ├── SearchBar.tsx
│   ├── VideoPlayer.tsx  # Video player with controls
│   └── *.module.css     # CSS Modules
├── features/           # Redux slices
│   ├── movies/
│   │   └── moviesSlice.ts
│   └── favorites/
│       └── favoritesSlice.ts
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── MovieDetailsPage.tsx
│   ├── FavoritesPage.tsx
│   ├── AboutPage.tsx
│   ├── WatchMoviePage.tsx    # Solo watch page
│   └── WatchPartyPage.tsx    # Synchronized watch party
├── services/           # API services
│   └── movieApi.ts
├── store/              # Redux store configuration
│   ├── store.ts
│   └── hooks.ts
├── types/              # TypeScript type definitions
│   └── movie.ts
├── App.tsx             # Main app component
└── main.tsx           # Application entry point
```

## 🎯 Available Pages

1. **Home** (`/`) - Browse popular movies and search
2. **Movie Details** (`/movie/:id`) - View detailed information about a movie
3. **Watch Movie** (`/watch/:id`) - Watch movie trailers in a dedicated player
4. **Watch Party** (`/watch-party/:id`) - Synchronized viewing with real-time playback sync
5. **Favorites** (`/favorites`) - View and manage favorite movies
6. **About** (`/about`) - Information about the project

## 🎥 How to Watch Movies

### Solo Viewing
1. Browse movies on the home page or view movie details
2. Click the **"▶️ Watch"** button on any movie card, or
3. Click **"▶️ Watch Now"** on the movie details page
4. Enjoy the official trailer with full playback controls

### Watch Party (Synchronized Viewing)
1. Navigate to any movie's watch page (`/watch/:id`)
2. Click the **"🎉 Start Watch Party"** button
3. Open the same watch party URL in multiple browser tabs
4. Playback will be synchronized across all tabs:
   - Play/Pause actions are synced
   - Seeking is synced
   - See participant count in real-time

**Note:** Watch Party uses BroadcastChannel API and works on the same computer across multiple tabs/windows.

## 🔧 Development

### Linting
```bash
npm run lint
```

### Type Checking
TypeScript type checking is included in the build process:
```bash
npm run build
```

## 🎨 Styling

The application uses CSS Modules for component-scoped styling, ensuring no CSS conflicts and better maintainability. Each component has its own `.module.css` file.

### Responsive Design
- Mobile-first approach
- Breakpoints at 768px for tablets and larger screens
- Flexible grid layouts that adapt to screen size

## 🔌 API Integration

The application uses TMDB API with the following endpoints:
- `GET /movie/popular` - Fetch popular movies
- `GET /search/movie` - Search for movies
- `GET /movie/{id}` - Get movie details
- `GET /movie/{id}/videos` - Fetch movie trailers and videos

All API calls are handled through Redux Toolkit's `createAsyncThunk` for proper async state management.

## 🎬 Video Player Features

- **YouTube Integration**: Plays official trailers from TMDB via YouTube
- **Custom Controls**: Play/Pause, Volume, Seek, and Fullscreen
- **Demo Mode**: Fallback display when no trailer is available
- **Responsive**: 16:9 aspect ratio, mobile-friendly
- **Synchronization**: Supports synchronized playback for watch parties
- **Security**: XSS protection with input sanitization

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Movie data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/)
- This product uses the TMDB API but is not endorsed or certified by TMDB

