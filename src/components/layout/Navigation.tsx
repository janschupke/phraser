import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getTranslations } from '../../utils/storage';

const navLinks = [
  { path: '/', label: 'Add Translation' },
  { path: '/flashcards', label: 'Flashcards' },
  { path: '/list', label: 'All Translations' },
  { path: '/settings', label: 'Settings' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const navRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [translationCount, setTranslationCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      setTranslationCount(getTranslations().length);
    };
    
    updateCount();
    
    // Listen for storage changes
    window.addEventListener('storage', updateCount);
    
    // Also check periodically in case translations change in same window
    const interval = setInterval(updateCount, 500);
    
    return () => {
      window.removeEventListener('storage', updateCount);
      clearInterval(interval);
    };
  }, []);

  const navLinkClass = (path: string) => {
    const baseClass = 'px-4 py-2 rounded-lg transition-colors duration-200';
    const activeClass =
      location.pathname === path
        ? 'bg-primary-600 text-white'
        : 'text-neutral-700 hover:bg-neutral-100';
    return `${baseClass} ${activeClass}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when not typing in an input/textarea
      if (
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLButtonElement) &&
        e.target.tagName !== 'A'
      ) {
        return;
      }

      const currentIndex = navLinks.findIndex(link => link.path === location.pathname);
      let newIndex = currentIndex;

      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        newIndex = currentIndex - 1;
      } else if (e.key === 'ArrowRight' && currentIndex < navLinks.length - 1) {
        e.preventDefault();
        newIndex = currentIndex + 1;
      }

      if (newIndex !== currentIndex) {
        navigate(navLinks[newIndex].path);
        navRefs.current[newIndex]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [location.pathname, navigate]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-surface shadow-md z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex gap-2 sm:gap-4">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              ref={el => {
                navRefs.current[index] = el;
              }}
              className={navLinkClass(link.path)}
            >
              {link.label}
              {link.path === '/list' && translationCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-neutral-200 rounded">
                  {translationCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
