import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import AddTranslation from './pages/AddTranslation';
import Flashcards from './pages/Flashcards';
import ListTranslations from './pages/ListTranslations';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 w-full pt-16 sm:pt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <Routes>
              <Route path="/" element={<AddTranslation />} />
              <Route path="/flashcards" element={<Flashcards />} />
              <Route path="/list" element={<ListTranslations />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
