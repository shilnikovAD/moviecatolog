import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import { Header } from './components/Header.tsx';
import { SinglePage } from './pages/SinglePage.tsx';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <Header />
        <main>
          <SinglePage />
        </main>
      </div>
    </Provider>
  );
}

export default App;
