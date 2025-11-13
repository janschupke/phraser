import { Link, useLocation } from 'react-router-dom';

export function Navigation() {
  const location = useLocation();

  const navLinkClass = (path: string) => {
    const baseClass = 'px-4 py-2 rounded-lg transition-colors duration-200';
    const activeClass =
      location.pathname === path
        ? 'bg-primary-600 text-white'
        : 'text-neutral-700 hover:bg-neutral-100';
    return `${baseClass} ${activeClass}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-surface shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 sm:gap-4">
          <Link to="/" className={navLinkClass('/')}>
            Add Translation
          </Link>
          <Link to="/flashcards" className={navLinkClass('/flashcards')}>
            Flashcards
          </Link>
          <Link to="/list" className={navLinkClass('/list')}>
            All Translations
          </Link>
        </div>
      </div>
    </nav>
  );
}
